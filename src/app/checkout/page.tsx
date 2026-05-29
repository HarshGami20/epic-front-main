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

interface Address {
  id?: string;
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
  isDefault?: boolean;
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
  
  // Multiple address states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Address>({
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

    // Load saved addresses
    let loadedAddresses: Address[] = [];
    const savedAddressesStr = localStorage.getItem("user_shipping_addresses");
    
    if (savedAddressesStr) {
      try {
        loadedAddresses = JSON.parse(savedAddressesStr);
      } catch (e) {
        console.error("Failed to parse saved addresses", e);
      }
    } else {
      // Migrate from single shipping address if exists
      const savedSingle = localStorage.getItem("user_shipping_address");
      if (savedSingle) {
        try {
          const parsedSingle = JSON.parse(savedSingle);
          loadedAddresses = [{ ...parsedSingle, id: "addr_default", isDefault: true }];
        } catch (e) {
          console.error("Failed to parse single address", e);
        }
      }
    }

    // If still no addresses, initialize with user info
    if (loadedAddresses.length === 0) {
      const defaultAddr: Address = {
        id: "addr_default",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "India",
        zipCode: "",
        country: "India",
        isDefault: true,
      };
      loadedAddresses = [defaultAddr];
      localStorage.setItem("user_shipping_addresses", JSON.stringify(loadedAddresses));
    }

    setSavedAddresses(loadedAddresses);

    // Find default or first address to select
    const defaultAddr = loadedAddresses.find((a) => a.isDefault) || loadedAddresses[0];
    if (defaultAddr && defaultAddr.id) {
      setSelectedAddressId(defaultAddr.id);
      setAddress(defaultAddr);
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
  const subtotal = checkoutItems.reduce((acc, item) => {
    const base = Number(item.basePrice || item.price || 0);
    const addons = Number(item.addonsTotal || 0);
    return acc + (base + addons) * (item.quantity || 1);
  }, 0);
  const checkoutItem = checkoutItems[0];
  const couponDiscount = appliedCoupon?.discount || 0;
  const discountedSubtotal = subtotal - couponDiscount;
  const tax = discountedSubtotal * 0.1;
  const shipping = 0.0;
  const grandTotal = discountedSubtotal + tax + shipping;

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

  // Multiple Addresses Helpers
  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    const selected = savedAddresses.find((a) => a.id === id);
    if (selected) {
      setAddress(selected);
    }
  };

  const handleAddNewAddressClick = () => {
    setAddressForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "India",
      zipCode: "",
      country: "India",
    });
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  const handleEditAddressClick = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection
    setAddressForm({ ...addr });
    setEditingAddressId(addr.id || null);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection
    const updated = savedAddresses.filter((a) => a.id !== id);
    
    let newSelectedId = selectedAddressId;
    if (selectedAddressId === id) {
      if (updated.length > 0) {
        newSelectedId = updated[0].id || "";
        setAddress(updated[0]);
      } else {
        newSelectedId = "";
        setAddress({
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
      }
    }
    
    setSavedAddresses(updated);
    setSelectedAddressId(newSelectedId);
    localStorage.setItem("user_shipping_addresses", JSON.stringify(updated));
    toast.success("Address deleted.");
  };

  const handleSaveAddress = () => {
    if (
      !addressForm.firstName ||
      !addressForm.lastName ||
      !addressForm.phone ||
      !addressForm.addressLine1 ||
      !addressForm.city ||
      !addressForm.zipCode
    ) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    let updatedList: Address[] = [];
    
    if (editingAddressId) {
      updatedList = savedAddresses.map((a) => 
        a.id === editingAddressId ? { ...addressForm, id: editingAddressId } : a
      );
      toast.success("Address updated!");
    } else {
      const newId = `addr_${Date.now()}`;
      const newAddr = { ...addressForm, id: newId };
      if (savedAddresses.length === 0) {
        newAddr.isDefault = true;
      }
      updatedList = [...savedAddresses, newAddr];
      toast.success("New address added!");
    }

    setSavedAddresses(updatedList);
    localStorage.setItem("user_shipping_addresses", JSON.stringify(updatedList));
    
    const targetId = editingAddressId || updatedList[updatedList.length - 1].id;
    if (targetId) {
      setSelectedAddressId(targetId);
      const active = updatedList.find((a) => a.id === targetId);
      if (active) setAddress(active);
    }

    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
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
    const orderToast = toast.loading("Opening Razorpay Magic Checkout...");

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
        couponCode: appliedCoupon?.coupon.code || undefined,
        notes: checkoutMode === "direct"
          ? `Variant: ${checkoutItems[0].selectedVariantId || "Default"}. Style: ${checkoutItems[0].selectedStyleVariantId || "Default"}. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`
          : `Cart Checkout of ${checkoutItems.length} items. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`,
      };

      // Call backend to create order
      const resData = await createRazorpayOrder(orderPayload, token);
      const { order, razorpayOrder, keyId } = resData;

      toast.success("Redirecting to secure gateway...", { id: orderToast });

      await openRazorpayCheckout({
        razorpayOrder,
        keyId,
        orderNumber: order.orderNumber,
        customer: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          phone: address.phone,
        },
        shippingAddress: {
          line1: address.addressLine1,
          line2: address.addressLine2 || "",
          city: address.city,
          state: address.state,
          zipcode: address.zipCode,
          country: address.country || "India",
          first_name: address.firstName,
          last_name: address.lastName,
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
                orderId: order.id,
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
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 border border-slate-300 hover:bg-slate-900 hover:text-white px-3 py-2 text-xs font-bold text-uppercase transition-all"
                      style={{ borderRadius: "50px", letterSpacing: "0.5px" }}
                    >
                      <i className="fa-solid fa-arrow-left" /> Back to {checkoutMode === "cart" ? "Cart" : "Customize"}
                    </button>
                  </div>

                  <h4 className="title m-b20">1. Shipping & Billing Details</h4>
                  
                  {showAddressForm ? (
                    // Add/Edit Address Form View
                    <div className="p-4 border rounded bg-white m-b30">
                      <h5 className="mb-4 fw-bold text-slate-800">
                        {editingAddressId ? "Edit Address Details" : "Add New Address"}
                      </h5>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group m-b20">
                            <label className="label-title">First Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="firstName"
                              value={addressForm.firstName}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group m-b20">
                            <label className="label-title">Last Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="lastName"
                              value={addressForm.lastName}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group m-b20">
                            <label className="label-title">Phone <span className="text-danger">*</span></label>
                            <input
                              type="tel"
                              name="phone"
                              value={addressForm.phone}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              placeholder="e.g. 9876543210"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group m-b20">
                            <label className="label-title">E-mail <span className="text-danger">*</span></label>
                            <input
                              type="email"
                              name="email"
                              value={addressForm.email}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group m-b20">
                            <label className="label-title">Street Address <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="addressLine1"
                              value={addressForm.addressLine1}
                              onChange={handleAddressFormChange}
                              className="form-control m-b10"
                              placeholder="House/flat number, street name, landmark"
                              required
                            />
                            <input
                              type="text"
                              name="addressLine2"
                              value={addressForm.addressLine2 || ""}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              placeholder="Apartment, suite, unit (optional)"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group m-b20">
                            <label className="label-title">City <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="city"
                              value={addressForm.city}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group m-b20">
                            <label className="label-title">State <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="state"
                              value={addressForm.state}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group m-b20">
                            <label className="label-title">Postcode / ZIP <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="zipCode"
                              value={addressForm.zipCode}
                              onChange={handleAddressFormChange}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                          }}
                          className="btn btn-sm btn-outline-secondary px-4 py-2 text-uppercase font-bold text-xs"
                          style={{ borderRadius: "5px" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          className="btn btn-sm btn-secondary px-4 py-2 text-uppercase font-bold text-xs"
                          style={{ borderRadius: "5px" }}
                        >
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Saved Addresses List View
                    <div className="m-b30">
                      <div className="row g-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div key={addr.id} className="col-md-6">
                              <div 
                                onClick={() => handleSelectAddress(addr.id || "")}
                                className={`p-4 rounded border h-100 position-relative d-flex flex-column justify-content-between transition-all cursor-pointer ${isSelected ? 'border-secondary bg-slate-100 bg-opacity-5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                style={{ borderWidth: isSelected ? '2px' : '1px' }}
                              >
                                <div>
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="mb-0 text-secondary fw-black" style={{ fontSize: '15px' }}>{addr.firstName} {addr.lastName}</h6>
                                    {isSelected && (
                                      <span className="badge bg-secondary text-white text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded">
                                        DELIVER HERE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-xs mb-1 font-semibold">{addr.addressLine1}</p>
                                  {addr.addressLine2 && <p className="text-slate-600 text-xs mb-1 font-semibold">{addr.addressLine2}</p>}
                                  <p className="text-slate-600 text-xs mb-2 font-semibold">{addr.city}, {addr.state} - {addr.zipCode}</p>
                                  <p className="text-slate-800 text-xs mb-0 font-black"><i className="fa-solid fa-phone text-muted me-1.5" />Mo: {addr.phone}</p>
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top border-slate-100">
                                  <button
                                    type="button"
                                    onClick={(e) => handleEditAddressClick(addr, e)}
                                    className="btn btn-xs btn-outline-secondary py-1 px-3 text-xs font-bold"
                                    style={{ fontSize: '10px', height: '24px', lineHeight: '22px' }}
                                  >
                                    <i className="fa-solid fa-pen me-1" /> Edit
                                  </button>
                                  {savedAddresses.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteAddress(addr.id || "", e)}
                                      className="btn btn-xs btn-outline-danger py-1 px-3 text-xs font-bold"
                                      style={{ fontSize: '10px', height: '24px', lineHeight: '22px' }}
                                    >
                                      <i className="fa-solid fa-trash me-1" /> Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-start">
                        <button
                          type="button"
                          onClick={handleAddNewAddressClick}
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 font-black text-uppercase px-4 py-2 border border-slate-300 text-xs"
                          style={{ borderRadius: "5px" }}
                        >
                          <i className="fa-solid fa-plus" /> Add New Address
                        </button>
                      </div>
                    </div>
                  )}

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

                  <h4 className="title m-b20 m-t20">3. Coupon Code</h4>

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

                  <h4 className="title m-b20">4. Payment</h4>
                  
                  <div className="p-4 border rounded bg-light m-b25">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white border rounded p-2 px-3 fw-bold text-primary">Razorpay Magic Checkout</div>
                      <p className="mb-0 text-muted small">
                        One-click checkout with UPI, cards, saved addresses, and in-checkout coupons.
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
                      {loading ? "Processing..." : "Pay with Magic Checkout"}
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
