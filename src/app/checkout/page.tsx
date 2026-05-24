"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CreditCard, 
  Download, 
  MapPin, 
  ShoppingBag,
  Info
} from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import IMAGES from "@/constant/theme";
import { createRazorpayOrder, verifyPayment } from "@/lib/ordersApi";

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
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  
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

    // Populate email and name from user profile
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

    // Load checkout product item
    const storedItem = localStorage.getItem("checkout_item");
    if (storedItem) {
      setCheckoutItem(JSON.parse(storedItem));
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

  if (!user || !checkoutItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Checking checkout details...</p>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  const basePrice = Number(checkoutItem.basePrice || checkoutItem.price || 0);
  const addonsTotal = Number(checkoutItem.addonsTotal || 0);
  const subtotal = basePrice + addonsTotal;
  const tax = subtotal * 0.1; // 10% tax
  const shipping = 0.0; // Free shipping as shown in mock-up
  const grandTotal = subtotal + tax + shipping;
  const originalMockPrice = basePrice * 1.5; // Mock cross-out price

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Specs Sheet Downloader
  const handleDownloadSpecs = () => {
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
      img.src = checkoutItem.previewImage || checkoutItem.image;
      
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
        ctx.fillText(`INR ${basePrice.toFixed(2)}`, 720, 235);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Addons Total:", 580, 270);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(`INR ${addonsTotal.toFixed(2)}`, 720, 270);

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

      const orderItems = [
        {
          productId: checkoutItem.productId,
          quantity: checkoutItem.quantity || 1,
          customizationData: checkoutItem.customizationData || null,
          metadata: {
            previewImage: checkoutItem.previewImage || checkoutItem.image,
            addonsTotal,
            basePrice,
            deliveryDate,
            deliveryTime,
          },
        },
      ];

      const orderPayload = {
        items: orderItems,
        shippingAddress: address,
        billingAddress: address,
        notes: `Variant: ${checkoutItem.selectedVariantId || "Default"}. Style: ${checkoutItem.selectedStyleVariantId || "Default"}. Est Delivery: ${deliveryDate} @ ${deliveryTime}.`,
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
            
            // Clear checkout item from storage
            localStorage.removeItem("checkout_item");

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
          color: "#2563EB", // Matches reference mock button color
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
    <div id="pixel-editor-root" className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-[#0f172a]">
      <Toaster position="top-center" richColors closeButton />

      {/* Modern Mock Header */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90">
              <AnimatedLogo animationType={9} />
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Secure Portal</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <Link href="/shop" className="hover:text-slate-900">Shop</Link>
            <Link href="/account-orders" className="hover:text-slate-900">My Orders</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link & Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/customize/${checkoutItem.slug || ""}`)}
            className="flex items-center gap-2 text-slate-900 font-extrabold hover:opacity-80 transition-all text-lg"
          >
            <ArrowLeft className="w-5 h-5" /> Checkout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Checkout Form Fields (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                1. Contact Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={address.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={address.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Phone</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-xs font-bold text-slate-400 select-none">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleInputChange}
                      placeholder="98765-43210"
                      className="w-full h-11 pl-12 pr-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={address.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery details */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  2. Delivery details
                </h3>
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Delivery Only
                </span>
              </div>

              {/* Delivery parameters fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Delivery Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full h-11 px-4 pr-10 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                      style={{ borderRadius: "10px" }}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Convenient Time</label>
                  <div className="relative">
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full h-11 px-4 pr-10 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none"
                      style={{ borderRadius: "10px" }}
                    >
                      <option value="9 am - 1 pm">9 am - 1 pm</option>
                      <option value="1 pm - 6 pm">1 pm - 6 pm (Afternoon)</option>
                      <option value="6 pm - 9 pm">6 pm - 9 pm (Evening)</option>
                    </select>
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Shipping Address alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Address</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={address.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Street, house/flat number, landmark"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleInputChange}
                    placeholder="Pin Code"
                    className="w-full h-11 px-4 border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment method */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                3. Payment method
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`h-14 border-2 font-bold text-xs transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    paymentMethod === "razorpay" 
                      ? "border-blue-500 bg-blue-50/20 text-blue-600 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  style={{ borderRadius: "10px" }}
                >
                  <span className="font-extrabold tracking-wide text-sm flex items-center gap-1.5">
                    Razorpay
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("visa")}
                  className={`h-14 border-2 font-bold text-xs transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    paymentMethod === "visa" 
                      ? "border-blue-500 bg-blue-50/20 text-blue-600" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  style={{ borderRadius: "10px" }}
                >
                  <span className="font-black italic text-blue-800 text-sm">VISA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gpay")}
                  className={`h-14 border-2 font-bold text-xs transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    paymentMethod === "gpay" 
                      ? "border-blue-500 bg-blue-50/20 text-blue-600" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  style={{ borderRadius: "10px" }}
                >
                  <span className="font-bold text-slate-800 text-sm">G Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("other")}
                  className={`h-14 border-2 font-bold text-xs transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    paymentMethod === "other" 
                      ? "border-blue-500 bg-blue-50/20 text-blue-600" 
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-500"
                  }`}
                  style={{ borderRadius: "10px" }}
                >
                  <span className="font-extrabold uppercase text-[10px] tracking-wider">OTHER</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Floating Order Card (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 leading-snug">Order</h3>

            {/* Custom Image Box inside gray container */}
            <div className="relative aspect-square w-full bg-[#f1f5f9] rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-4">
              <img
                src={checkoutItem.previewImage || checkoutItem.image}
                alt={checkoutItem.name}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Preview mockup
              </div>
            </div>

            {/* Product description info */}
            <div className="space-y-4 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-start gap-3">
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  {checkoutItem.name}
                </h4>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                <span>SIZE: DEFAULT</span>
                <span>COLOR: {checkoutItem.selectedVariantId || "DEFAULT"}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-black text-lg">
                  ₹ {grandTotal.toFixed(2)}
                </span>
                <span className="line-through text-slate-400 text-xs font-bold">
                  ₹ {originalMockPrice.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Spec Sheet Downloader */}
            <button
              type="button"
              onClick={handleDownloadSpecs}
              className="w-full h-11 border border-slate-900 hover:bg-slate-50 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              style={{ borderRadius: "10px" }}
            >
              <Download className="w-3.5 h-3.5" /> Download Specs Sheet
            </button>

            {/* Pricing Breakout panel */}
            <div className="space-y-3.5 pt-2 text-xs font-bold text-[#64748b]">
              <div className="flex justify-between items-center">
                <span>SUBTOTAL</span>
                <span className="text-slate-900">₹ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>DISCOUNT (33% OFF)</span>
                <span className="text-emerald-600">- ₹ {(originalMockPrice - subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>SHIPPING</span>
                <span className="text-emerald-600 font-black">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span>VAT / GST (10%)</span>
                <span className="text-slate-900">₹ {tax.toFixed(2)}</span>
              </div>

              {/* Total final receipt amount */}
              <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">TOTAL</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹ {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Checkout button */}
            <div className="space-y-4 pt-4">
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wider shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                style={{ borderRadius: "10px" }}
              >
                {loading ? "Preparing Checkout Session..." : "Checkout →"}
              </button>

              {/* Checkbox agreement */}
              <label className="flex items-start gap-2.5 text-[10px] text-slate-400 font-bold cursor-pointer select-none leading-normal">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 mt-0.5 shrink-0"
                />
                <span>
                  By confirming the order, I accept the{" "}
                  <Link href="/terms" className="text-blue-500 hover:underline">
                    terms of the user agreement
                  </Link>
                </span>
              </label>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
