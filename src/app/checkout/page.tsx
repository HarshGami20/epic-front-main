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
import { getImageUrl } from "@/lib/imageUtils";

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<"direct" | "cart">("cart");
  
  // Address & delivery details
  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "India",
    zipCode: "",
    country: "India",
  });
  
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Default to 3 days from now
    return today.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState("1 pm - 6 pm");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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

    // Populate default from user profile
    setAddress((prev) => ({
      ...prev,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
    }));

    // Load saved address from local storage if available
    const savedAddr = localStorage.getItem("user_shipping_address");
    if (savedAddr) {
      try {
        setAddress(JSON.parse(savedAddr));
      } catch (e) {
        console.error("Failed to parse saved address", e);
      }
    }

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

    if (mode === "direct" && storedItem) {
      setCheckoutItems([JSON.parse(storedItem)]);
      setCheckoutMode("direct");
    } else if (mode === "cart" || !storedItem) {
      if (currentCart && currentCart.length > 0) {
        setCheckoutItems(currentCart);
        setCheckoutMode("cart");
      } else {
        toast.error("Your cart is empty.");
        router.push("/shop-cart");
      }
    } else if (storedItem) {
      setCheckoutItems([JSON.parse(storedItem)]);
      setCheckoutMode("direct");
    } else if (currentCart && currentCart.length > 0) {
      setCheckoutItems(currentCart);
      setCheckoutMode("cart");
    } else {
      toast.error("No product found for checkout.");
      router.push("/shop");
    }

    // Dynamically load Razorpay SDK script
    const loadRazorpay = () => {
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => toast.error("Failed to load Razorpay SDK");
      document.body.appendChild(script);
    };

    loadRazorpay();
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
  const subtotal = checkoutItems.reduce((acc, item) => {
    const base = Number(item.basePrice || item.price || 0);
    const addons = Number(item.addonsTotal || 0);
    return acc + (base + addons) * (item.quantity || 1);
  }, 0);
  const checkoutItem = checkoutItems[0];
  const basePrice = checkoutMode === "direct" && checkoutItem ? Number(checkoutItem.basePrice || checkoutItem.price || 0) : 0;
  const addonsTotal = checkoutMode === "direct" && checkoutItem ? Number(checkoutItem.addonsTotal || 0) : 0;
  const tax = subtotal * 0.1; // 10% tax
  const shipping = 0.0; // Free shipping
  const grandTotal = subtotal + tax + shipping;
  const originalMockPrice = subtotal * 1.5; // Mock cross-out price

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Specs Sheet Downloader
  const handleDownloadSpecs = () => {
    const checkoutItem = checkoutItems[0];
    if (!checkoutItem) return;
    const itemBasePrice = Number(checkoutItem.basePrice || checkoutItem.price || 0);
    const itemAddonsTotal = Number(checkoutItem.addonsTotal || 0);
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
    if (
      !address.firstName ||
      !address.lastName ||
      !address.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.zipCode
    ) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the user agreement terms to place the order.");
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Razorpay payment gateway is preparing. Please try again in a second.");
      return;
    }

    setLoading(true);
    const orderToast = toast.loading("Connecting to secure Razorpay server...");

    try {
      // Save address profile for next time
      localStorage.setItem("user_shipping_address", JSON.stringify(address));

      const orderItems = checkoutItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity || 1,
        customizationData: item.customizationData || item.variation || null,
        metadata: {
          previewImage: item.previewImage || item.image,
          addonsTotal: Number(item.addonsTotal || 0),
          basePrice: Number(item.basePrice || item.price || 0),
          deliveryDate,
          deliveryTime,
        },
      }));

      const orderPayload = {
        items: orderItems,
        shippingAddress: address,
        billingAddress: address,
        notes: checkoutMode === "direct"
          ? `Variant: ${checkoutItems[0].selectedVariantId || "Default"}. Style: ${checkoutItems[0].selectedStyleVariantId || "Default"}. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`
          : `Cart Checkout of ${checkoutItems.length} items. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`,
      };

      // Call backend to create order
      const resData = await createRazorpayOrder(orderPayload, token);
      const { order, razorpayOrder } = resData;

      toast.success("Redirecting to secure gateway...", { id: orderToast });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Epiclance",
        description: `Secure checkout Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        image: IMAGES.Logo2 ? IMAGES.Logo2.src : "",
        handler: async function (response: any) {
          const verifyToast = toast.loading("Validating payment signature...");
          try {
            const verificationPayload = {
              orderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifiedOrder = await verifyPayment(verificationPayload, token);
            toast.success("Payment verified! Your order is completed.", { id: verifyToast });
            
            // Clear checkout item from storage or clear shopping cart
            if (checkoutMode === "direct") {
              localStorage.removeItem("checkout_item");
            } else {
              localStorage.removeItem("epiclance-cart-wishlist");
              // Also dispatch clearCart locally if possible, or reload page/redirect
            }

            // Redirect to confirmation page
            router.push(`/account-order-confirmation?orderId=${verifiedOrder.orderNumber}`);
          } catch (err: any) {
            toast.error(err.message || "Signature verification failed.", { id: verifyToast });
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          contact: address.phone,
        },
        theme: {
          color: "#2563EB", 
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment cancelled or failed: ${response.error.description}`);
      });
      rzp.open();
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
        
        <CommanBanner parentText="Home" currentText="Checkout" mainText="Checkout" image={IMAGES.BackBg1.src} />
        
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
                      className="btn-link text-secondary fw-bold p-0 text-decoration-none"
                    >
                      <i className="fa-solid fa-arrow-left me-2" /> Back
                    </button>
                  </div>

                  <h4 className="title m-b20">1. Billing & Shipping Details</h4>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">First Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="firstName"
                          value={address.firstName}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">Last Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="lastName"
                          value={address.lastName}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">Phone <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">E-mail <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={address.email}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group m-b25">
                        <label className="label-title">Street Address <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={address.addressLine1}
                          onChange={handleInputChange}
                          className="form-control m-b15"
                          placeholder="House/flat number, street name, landmark"
                          required
                        />
                        <input
                          type="text"
                          name="addressLine2"
                          value={address.addressLine2}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Apartment, suite, unit (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group m-b25">
                        <label className="label-title">City <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group m-b25">
                        <label className="label-title">State <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group m-b25">
                        <label className="label-title">Postcode / ZIP <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="zipCode"
                          value={address.zipCode}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="title m-b20 m-t20">2. Delivery Schedule</h4>
                  
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

                  <h4 className="title m-b20 m-t20">3. Payment Options</h4>
                  
                  <div className="d-flex flex-wrap gap-2 m-b25">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`btn btn-lg ${paymentMethod === "razorpay" ? "btn-secondary" : "btn-outline-secondary"}`}
                    >
                      Razorpay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("visa")}
                      className={`btn btn-lg ${paymentMethod === "visa" ? "btn-secondary" : "btn-outline-secondary"}`}
                    >
                      Visa Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("gpay")}
                      className={`btn btn-lg ${paymentMethod === "gpay" ? "btn-secondary" : "btn-outline-secondary"}`}
                    >
                      Google Pay
                    </button>
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
                            ₹{((Number(item.basePrice || item.price || 0) + Number(item.addonsTotal || 0)) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <table className="table mb-4">
                    <tbody>
                      <tr>
                        <td className="border-0">Subtotal</td>
                        <td className="price border-0">₹{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Discount (33% OFF)</td>
                        <td className="price text-success">- ₹{(originalMockPrice - subtotal).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Shipping</td>
                        <td className="price text-success font-semibold">Free</td>
                      </tr>
                      <tr>
                        <td>GST (10%)</td>
                        <td className="price">₹{tax.toFixed(2)}</td>
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
                      {loading ? "Processing..." : "Place Order"}
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
