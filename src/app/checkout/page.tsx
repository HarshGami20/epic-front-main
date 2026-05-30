"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import CommanLayout from "@/components/CommanLayout";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { createRazorpayOrder, verifyPayment } from "@/lib/ordersApi";
import { validateCoupon, fetchPublicCoupons, type CouponValidationResult, type PublicCoupon } from "@/lib/couponApi";
import { getImageUrl } from "@/lib/imageUtils";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { fetchPublicProductBySlug } from "@/lib/publicProductApi";

function hasCustomPriceBreakdown(item: any): boolean {
  return (
    Boolean(item.customizationData) ||
    Boolean(item.isCustomized) ||
    (item.addonsTotal != null && Number(item.addonsTotal) > 0)
  );
}

/** Unit price for display and order totals. Cart items use `price`; customized items use base + addons. */
function getCheckoutLineUnitPrice(item: any): number {
  if (hasCustomPriceBreakdown(item)) {
    return Number(item.basePrice ?? 0) + Number(item.addonsTotal ?? 0);
  }
  return Number(item.price ?? item.basePrice ?? 0);
}

function getOrderItemMetadata(item: any, deliveryDate: string, deliveryTime: string) {
  const unitPrice = getCheckoutLineUnitPrice(item);
  const customized = hasCustomPriceBreakdown(item);

  return {
    previewImage: item.previewImage || item.image,
    addonsTotal: customized ? Number(item.addonsTotal || 0) : 0,
    basePrice: customized ? Number(item.basePrice ?? 0) : unitPrice,
    deliveryDate,
    deliveryTime,
  };
}

/** Only refresh catalog base price for direct/customized checkout — never overwrite cart prices. */
async function syncCheckoutItemPrices(items: any[]): Promise<any[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!hasCustomPriceBreakdown(item)) return item;

      const slug = typeof item.slug === "string" ? item.slug.trim() : "";
      if (!slug) return item;

      try {
        const product = await fetchPublicProductBySlug(slug);
        if (!product) return item;

        const catalogBase = Number(product.basePrice ?? product.price ?? 0);
        if (!Number.isFinite(catalogBase) || catalogBase <= 0) return item;

        const addonTotal = Number(item.addonsTotal ?? 0);
        return {
          ...item,
          basePrice: catalogBase,
          price: catalogBase + (Number.isFinite(addonTotal) ? addonTotal : 0),
        };
      } catch {
        return item;
      }
    })
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<"direct" | "cart">("cart");

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Default to 3 days from now
    return today.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState("1 pm - 6 pm");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const clearCart = useCartWishlistStore((state) => state.clearCart);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);

  // Authenticate and load item
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (!storedUser || !storedToken) {
      toast.error("Please login to proceed to checkout.");
      router.push("/login?redirect=/checkout");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    setToken(storedToken);

    // Fetch coupons publicly
    fetchPublicCoupons()
      .then((data) => setPublicCoupons(data))
      .catch((err) => console.error("Failed to load active coupons:", err));

    // Load checkout items
    const storedCartStr = localStorage.getItem("epiclance-cart-wishlist");
    let currentCart: any[] = [];
    if (storedCartStr) {
      try {
        const parsed = JSON.parse(storedCartStr);
        currentCart = parsed.state?.cart || [];
      } catch (e) {
        console.error(e);
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");
    const storedItem = localStorage.getItem("checkout_item");

    let loadedItems: any[] = [];
    let loadedMode: "direct" | "cart" = "cart";

    if (mode === "direct" && storedItem) {
      loadedItems = [JSON.parse(storedItem)];
      loadedMode = "direct";
    } else if (currentCart.length > 0) {
      // Cart wins over stale checkout_item unless mode=direct
      localStorage.removeItem("checkout_item");
      loadedItems = currentCart;
      loadedMode = "cart";
    } else if (storedItem) {
      loadedItems = [JSON.parse(storedItem)];
      loadedMode = "direct";
    } else {
      toast.error("Your cart is empty.");
      router.push("/shop-cart");
      return;
    }

    setCheckoutMode(loadedMode);
    setCheckoutItems(loadedItems);
    if (loadedMode === "direct") {
      void syncCheckoutItemPrices(loadedItems).then(setCheckoutItems);
    }

    // Load Razorpay SDK
    loadRazorpayScript()
      .then(() => setRazorpayLoaded(true))
      .catch(() => toast.error("Failed to load Razorpay SDK"));
  }, [router]);

  if (!user || checkoutItems.length === 0) {
    return (
      <CommanLayout>
        <div className="page-content bg-light py-5">
          <div className="container text-center py-5">
            <div className="spinner-border text-secondary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="font-semibold text-muted">Checking checkout details...</p>
          </div>
        </div>
      </CommanLayout>
    );
  }

  // Calculate pricing breakdown
  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + getCheckoutLineUnitPrice(item) * (item.quantity || 1),
    0
  );
  const checkoutItem = checkoutItems[0];
  const couponDiscount = appliedCoupon?.discount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const shipping = 0.0;
  const grandTotal = discountedSubtotal + shipping;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon(result);
      toast.success(`Coupon "${result.coupon.code}" applied! You save ₹${result.discount.toFixed(2)}`);
    } catch (err: any) {
      setAppliedCoupon(null);
      toast.error(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectCoupon = async (code: string) => {
    setCouponLoading(true);
    try {
      const result = await validateCoupon(code, subtotal);
      setAppliedCoupon(result);
      setCouponInput(code);
      toast.success(`Coupon "${result.coupon.code}" applied! You save ₹${result.discount.toFixed(2)}`);
    } catch (err: any) {
      setAppliedCoupon(null);
      toast.error(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const customerName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer";
  const customerEmail = user?.email || "";
  const customerPhone = user?.phone || "";

  // Specs Sheet Downloader
  const handleDownloadSpecs = () => {
    const checkoutItem = checkoutItems[0];
    if (!checkoutItem) return;
    const itemUnitPrice = getCheckoutLineUnitPrice(checkoutItem);
    const itemAddonsTotal = hasCustomPriceBreakdown(checkoutItem)
      ? Number(checkoutItem.addonsTotal || 0)
      : 0;
    const itemBasePrice = itemUnitPrice - itemAddonsTotal;
    toast.loading("Generating specification sheet...", { id: "specs" });
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 10;
      ctx.strokeStyle = "#0F172A";
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      ctx.fillStyle = "#0F172A";
      ctx.fillRect(10, 10, canvas.width - 20, 80);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("EPICLANCE CUSTOM PRODUCT SPECIFICATION", 40, 58);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = getImageUrl(checkoutItem.previewImage || checkoutItem.image);
      
      img.onload = () => {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(40, 120, 500, 600);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 120, 500, 600);

        const scale = Math.min(460 / img.width, 560 / img.height);
        const x = 40 + (500 - img.width * scale) / 2;
        const y = 120 + (600 - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("PRODUCT DETAILS", 580, 150);

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(580, 165);
        ctx.lineTo(1140, 165);
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Product Name:", 580, 200);
        ctx.fillStyle = "#0f172a";
        ctx.font = "normal 16px sans-serif";
        ctx.fillText(checkoutItem.name || "Custom Design", 720, 200);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Base Price:", 580, 235);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(`INR ${itemBasePrice.toFixed(2)}`, 720, 235);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Addons Total:", 580, 270);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(`INR ${itemAddonsTotal.toFixed(2)}`, 720, 270);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Order Value:", 580, 305);
        ctx.fillStyle = "#db2777";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`INR ${grandTotal.toFixed(2)}`, 720, 305);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px 'DM Sans', sans-serif";
        ctx.fillText("CUSTOMIZATION OPTIONS", 580, 370);

        ctx.strokeStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(580, 385);
        ctx.lineTo(1140, 385);
        ctx.stroke();

        let currentY = 420;
        const textInputs = checkoutItem.customizationData?.textInputs || [];
        
        if (textInputs.length === 0) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "italic 15px sans-serif";
          ctx.fillText("No custom text fields added.", 580, currentY);
        } else {
          textInputs.forEach((item: any, idx: number) => {
            if (currentY > 740) return;

            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(`Field #${idx + 1} (${item.zoneId || 'Custom Zone'}):`, 580, currentY);

            ctx.fillStyle = "#0284c7";
            ctx.font = "normal 14px sans-serif";
            ctx.fillText(`[Font: ${item.fontFamily} / Color: ${item.textColor}]`, 820, currentY);

            currentY += 25;
            ctx.fillStyle = "#334155";
            ctx.font = "italic 15px sans-serif";
            ctx.fillText(`"${item.text}"`, 600, currentY);

            currentY += 40;
          });
        }

        const link = document.createElement("a");
        link.download = `${(checkoutItem.name || "custom-product").replace(/\s+/g, "-").toLowerCase()}-specs.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        toast.success("Specification card downloaded successfully!", { id: "specs" });
      };

      img.onerror = () => {
        throw new Error("Failed to load preview image asset");
      };

    } catch (e: any) {
      console.error(e);
      toast.error("Failed to generate spec sheet: " + e.message, { id: "specs" });
    }
  };

  // Submit secure payment
  const handlePaymentSubmit = async () => {
    if (!agreeTerms) {
      toast.error("Please accept the user agreement terms to place the order.");
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Razorpay payment gateway is preparing. Please try again in a second.");
      return;
    }

    setLoading(true);
    const orderToast = toast.loading("Opening Razorpay Magic Checkout...");

    try {
      const orderItems = checkoutItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity || 1,
        customizationData: item.customizationData || item.variation || null,
        metadata: getOrderItemMetadata(item, deliveryDate, deliveryTime),
      }));

      const orderPayload = {
        items: orderItems,
        couponCode: appliedCoupon?.coupon.code || undefined,
        notes: checkoutMode === "direct"
          ? `Variant: ${checkoutItems[0].selectedVariantId || "Default"}. Style: ${checkoutItems[0].selectedStyleVariantId || "Default"}. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`
          : `Cart Checkout of ${checkoutItems.length} items. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`,
      };

      const resData = await createRazorpayOrder(orderPayload, token);
      const { checkoutSession, razorpayOrder, keyId } = resData;

      toast.success("Redirecting to secure gateway...", { id: orderToast });

      await openRazorpayCheckout({
        razorpayOrder,
        keyId,
        orderNumber: checkoutSession?.receipt || razorpayOrder.id,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        logoUrl: IMAGES.Logo2 ? IMAGES.Logo2.src : undefined,
        appliedCoupon: appliedCoupon
          ? {
              code: appliedCoupon.coupon.code,
              discountAmount: appliedCoupon.discount,
            }
          : null,
        onSuccess: async (response) => {
          const verifyToast = toast.loading("Validating payment signature...");
          try {
            const verifiedOrder = await verifyPayment(
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              },
              token
            );
            toast.success("Payment verified! Your order is completed.", { id: verifyToast });

            if (checkoutMode === "direct") {
              localStorage.removeItem("checkout_item");
            } else {
              clearCart();
            }

            router.push(`/account-order-confirmation?orderId=${verifiedOrder.orderNumber}`);
          } catch (err: any) {
            toast.error(err.message || "Signature verification failed.", { id: verifyToast });
          }
        },
        onDismiss: () => {
          setLoading(false);
          toast.info("Payment cancelled. You can try again when ready.");
        },
        onFailure: (message) => {
          setLoading(false);
          toast.error(`Payment failed: ${message}`);
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create transaction.", { id: orderToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <Toaster position="top-center" richColors closeButton />
        
        <CommanBanner parentText="Home" currentText="Checkout" mainText="Checkout"  />
        
        <section className="content-inner shop-account">
          <div className="container">
            <div className="row">
              
              {/* LEFT Column: Checkout details forms */}
              <div className="col-lg-8 col-md-12 col-sm-12 m-b30">
                <form className="shop-checkout" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Back to previous action */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (checkoutMode === "cart") {
                          router.push("/shop-cart");
                        } else {
                          router.push(`/customize/${checkoutItem?.slug || ""}`);
                        }
                      }}
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 border border-slate-300 hover:bg-slate-900 hover:text-white px-3 py-2 text-xs font-bold text-uppercase transition-all"
                      style={{ borderRadius: "50px", letterSpacing: "0.5px" }}
                    >
                      <i className="fa-solid fa-arrow-left" /> Back to {checkoutMode === "cart" ? "Cart" : "Customize"}
                    </button>
                  </div>

                  <div className="p-4 border rounded bg-white m-b30">
                    <h4 className="title m-b15">Delivery Address</h4>
                    <div className="d-flex align-items-start gap-3">
                      <i className="fa-solid fa-truck text-primary mt-1" aria-hidden="true" />
                      <div>
                        <p className="mb-2 text-slate-700 small">
                          Your delivery address will be collected securely inside Razorpay Magic Checkout
                          when you click <strong>Pay with Razorpay</strong>.
                        </p>
                        <p className="mb-0 text-muted small">
                          You can enter a new address or use a saved Razorpay address during payment.
                          {(customerName || customerEmail || customerPhone) && (
                            <> Contact details from your account may be pre-filled.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="title m-b20">1. Delivery Schedule</h4>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">Delivery Date</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">Convenient Time Slot</label>
                        <select
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="form-control form-select"
                        >
                          <option value="9 am - 1 pm">9 am - 1 pm</option>
                          <option value="1 pm - 6 pm">1 pm - 6 pm (Afternoon)</option>
                          <option value="6 pm - 9 pm">6 pm - 9 pm (Evening)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <h4 className="title m-b20 m-t20">2. Coupon Code</h4>

                  <div className="m-b25">
                    {appliedCoupon ? (
                      <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-success bg-opacity-10">
                        <div>
                          <span className="badge bg-success me-2">{appliedCoupon.coupon.code}</span>
                          <span className="text-success fw-semibold small">
                            − ₹{appliedCoupon.discount.toFixed(2)} saved
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="btn btn-sm btn-outline-danger font-bold text-xs py-1 px-3"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="form-control"
                            style={{ borderRadius: "150px" }}
                            placeholder="Enter coupon code"
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                            className="btn btn-outline-secondary font-bold text-uppercase px-4"
                          >
                            {couponLoading ? "Checking..." : "Apply"}
                          </button>
                        </div>
                        
                        {publicCoupons.length > 0 && (
                          <div className="mt-3">
                            <label className="label-title text-muted mb-2.5 small fw-bold tracking-wider uppercase">Available Offers</label>
                            <div className="row g-3">
                              {publicCoupons.map((coupon) => {
                                const isApplied = false;
                                const isMinMet = subtotal >= (coupon.minOrderAmount || 0);
                                return (
                                  <div key={coupon.id} className="col-12 col-md-6">
                                    <div className={`p-3 border rounded h-100 d-flex flex-column justify-content-between transition-all ${isApplied ? 'border-success bg-success bg-opacity-5' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                      <div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                          <span className={`px-2.5 py-1 rounded text-xs font-black border border-dashed tracking-wider ${isApplied ? 'bg-success text-white border-success' : 'bg-slate-50 text-slate-700 border-slate-300'}`}>
                                            {coupon.code}
                                          </span>
                                          {coupon.type === "PERCENTAGE" ? (
                                            <span className="text-success font-black text-sm">{coupon.value}% OFF</span>
                                          ) : (
                                            <span className="text-success font-black text-sm">₹{coupon.value} OFF</span>
                                          )}
                                        </div>
                                        {coupon.description && (
                                          <p className="mb-2 text-muted text-xs font-semibold leading-relaxed" style={{ fontSize: '11px' }}>
                                            {coupon.description}
                                          </p>
                                        )}
                                        {coupon.minOrderAmount && (
                                          <p className="mb-0 text-slate-500 text-[10px]" style={{ fontSize: '10px' }}>
                                            Min. Order: ₹{Number(coupon.minOrderAmount).toFixed(0)}
                                          </p>
                                        )}
                                      </div>
                                      <div className="mt-3 pt-2 border-top border-slate-100 text-end">
                                        {isApplied ? (
                                          <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="btn btn-sm btn-danger py-1 px-3 text-xs font-bold"
                                            style={{ fontSize: '11px' }}
                                          >
                                            Remove
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleSelectCoupon(coupon.code)}
                                            disabled={!isMinMet || couponLoading}
                                            className={`btn btn-sm py-1 px-3 text-xs font-bold ${isMinMet ? 'btn-outline-secondary' : 'btn-light text-slate-400 border border-slate-200'}`}
                                            style={{ fontSize: '11px' }}
                                            title={!isMinMet ? `Requires minimum order of ₹${Number(coupon.minOrderAmount).toFixed(2)}` : ''}
                                          >
                                            Apply
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h4 className="title m-b20">3. Payment</h4>
                  
                  <div className="p-4 border rounded bg-light m-b25">
                    <label className="label-title text-muted mb-3 small fw-bold tracking-wider uppercase d-block">
                      Payment Mode
                    </label>

                    <div className="p-3 bg-white border rounded mb-3 d-flex align-items-center gap-3">
                      <input
                        className="form-check-input m-0 flex-shrink-0"
                        type="radio"
                        name="paymentMode"
                        id="payment-razorpay"
                        checked
                        readOnly
                      />
                      <div className="flex-grow-1">
                        <label htmlFor="payment-razorpay" className="fw-bold mb-1 d-block">
                          Razorpay Magic Checkout
                        </label>
                        <p className="mb-0 text-muted small">
                          UPI · Credit / Debit Cards · Net Banking · Wallets
                        </p>
                      </div>
                      <span className="badge bg-primary text-white px-3 py-2 d-none d-sm-inline">Secure</span>
                    </div>

                    <div className="d-flex align-items-start gap-2 p-3 rounded border bg-white">
                      <i className="fa-solid fa-circle-info text-primary mt-1" aria-hidden="true" />
                      <p className="mb-0 small text-muted">
                        Click <strong className="text-dark">Pay with Razorpay</strong> in your order summary to proceed.
                        Razorpay will collect your delivery address, apply coupons, and process payment of{" "}
                        <strong className="text-dark">₹{grandTotal.toFixed(2)}</strong> securely.
                      </p>
                    </div>
                  </div>

                </form>
              </div>

              {/* RIGHT Column: Order breakdown */}
              <div className="col-lg-4 col-md-12 col-sm-12">
                <div className="order-detail sticky-top">
                  <h4 className="title mb-4">Your Order</h4>
                  
                  <div className="m-b30 max-h-[350px] overflow-y-auto pr-1">
                    {checkoutItems.map((item, idx) => (
                      <div key={item.id || idx} className="cart-item style-1">
                        <div className="dz-media" style={{ width: "60px", height: "60px", minWidth: "60px", position: "relative" }}>
                          <img
                            src={getImageUrl(item.previewImage || item.image)}
                            alt={item.name}
                            className="object-contain w-100 h-100 rounded"
                          />
                        </div>
                        <div className="dz-content">
                          <div className="me-2">
                            <h6 className="title mb-0" style={{ fontSize: "14px" }}>{item.name}</h6>
                            <span className="text-muted" style={{ fontSize: "11px" }}>
                              Qty: {item.quantity} | {item.selectedVariantId || item.variation?.selectedVariantId || item.variation?.color?.id || "Default"}
                            </span>
                          </div>
                          <span className="price font-semibold" style={{ whiteSpace: "nowrap" }}>
                            ₹{(getCheckoutLineUnitPrice(item) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <table className="table mb-4" >
                    <tbody>
                      <tr>
                        <td className="border-0">Subtotal</td>
                        <td className="price border-0">₹{subtotal.toFixed(2)}</td>
                      </tr>
                      {couponDiscount > 0 && (
                        <tr>
                          <td className="text-success">
                            Coupon ({appliedCoupon?.coupon.code})
                          </td>
                          <td className="price text-success">− ₹{couponDiscount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>Shipping</td>
                        <td className="price text-success font-semibold">Free</td>
                      </tr>
                      <tr className="total">
                        <td><h5 className="mb-0">Total</h5></td>
                        <td className="price"><h4 className="mb-0 text-pink-600">₹{grandTotal.toFixed(2)}</h4></td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="d-flex flex-column gap-3">
                    {checkoutItems.some(item => item.customizationData) && (
                      <button
                        type="button"
                        onClick={handleDownloadSpecs}
                        className="btn btn-outline-secondary w-100"
                      >
                        Download Specs Sheet
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePaymentSubmit}
                      disabled={loading}
                      className="btn btn-secondary w-100 py-3 text-uppercase font-bold tracking-wider"
                    >
                      {loading ? "Processing..." : "Pay with Razorpay"}
                    </button>
                  </div>

                  <div className="form-group m-t15">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="form-check-input"
                        id="terms-check"
                      />
                      <label className="form-check-label text-muted" htmlFor="terms-check" style={{ fontSize: "11px" }}>
                        I accept the terms of the user agreement
                      </label>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </CommanLayout>
  );
}
