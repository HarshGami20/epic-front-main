"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav, Tab } from "react-bootstrap";
import { toast, Toaster } from "sonner";
import { Download, Package, Truck, Calendar, MapPin, Eye, ArrowLeft, RotateCcw } from "lucide-react";
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import { fetchOrderById } from "@/lib/ordersApi";
import { submitReturnRequest } from "@/lib/returnsApi";

export default function AccountOrderDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order details requested.");
      router.push("/account-orders");
      return;
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login?redirect=`/account-order-details?orderId=${orderId}`");
      return;
    }

    const getOrderDetails = async () => {
      try {
        const data = await fetchOrderById(orderId, storedToken);
        setOrder(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [orderId, router]);

  // Specifications Composite Download
  const handleDownloadSpecs = (item: any) => {
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
      img.src = item.customizationData?.previewImage || item.metadata?.previewImage || order.items?.[0]?.image || "";
      
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
        ctx.fillText("ORDER DETAILS", 580, 150);

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(580, 165);
        ctx.lineTo(1140, 165);
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Order Number:", 580, 200);
        ctx.fillStyle = "#0f172a";
        ctx.font = "normal 16px sans-serif";
        ctx.fillText(order.orderNumber, 720, 200);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Product Name:", 580, 235);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(item.product?.name || "Customized T-shirt", 720, 235);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Quantity Purchased:", 580, 270);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(`${item.quantity} Unit(s)`, 720, 270);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Unit Price Paid:", 580, 305);
        ctx.fillStyle = "#db2777";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`INR ${Number(item.price).toFixed(2)}`, 720, 305);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("CUSTOMIZATION OPTIONS", 580, 370);

        ctx.strokeStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(580, 385);
        ctx.lineTo(1140, 385);
        ctx.stroke();

        let currentY = 420;
        const textInputs = item.customizationData?.textInputs || [];

        if (textInputs.length === 0) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "italic 15px sans-serif";
          ctx.fillText("No custom text fields configured.", 580, currentY);
        } else {
          textInputs.forEach((txt: any, index: number) => {
            if (currentY > 740) return;
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(`Field #${index + 1} (${txt.zoneId || "Field"}):`, 580, currentY);

            ctx.fillStyle = "#0284c7";
            ctx.font = "normal 14px sans-serif";
            ctx.fillText(`[Font: ${txt.fontFamily} / Color: ${txt.textColor}]`, 820, currentY);

            currentY += 25;
            ctx.fillStyle = "#334155";
            ctx.font = "italic 15px sans-serif";
            ctx.fillText(`"${txt.text}"`, 600, currentY);

            currentY += 40;
          });
        }

        const link = document.createElement("a");
        link.download = `${order.orderNumber}-design-specs.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("Specification card downloaded successfully!", { id: "specs" });
      };

      img.onerror = () => {
        throw new Error("Failed to load product preview URL");
      };
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to generate spec sheet: " + e.message, { id: "specs" });
    }
  };

  const handleReturnRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token || !order) return;
    if (!returnReason.trim() || returnReason.trim().length < 10) {
      toast.error("Please provide a reason of at least 10 characters.");
      return;
    }
    setReturnSubmitting(true);
    try {
      await submitReturnRequest(order.id, returnReason.trim(), token);
      toast.success("Return request submitted successfully!");
      setShowReturnModal(false);
      setReturnReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit return request.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content bg-light min-h-screen">
        <CommanBanner image={IMAGES.BackBg1.src} mainText="Order Details" parentText="Home" currentText="Order Details" />
        <div className="content-inner-1 text-center py-16">
          <p className="font-semibold text-slate-500">Loading order info...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content bg-light min-h-screen">
        <CommanBanner image={IMAGES.BackBg1.src} mainText="Order Details" parentText="Home" currentText="Order Details" />
        <div className="content-inner-1 text-center py-16">
          <p className="text-slate-500 font-semibold mb-4">Order details could not be retrieved.</p>
          <Link href="/account-orders" className="btn btn-secondary px-4">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const firstItem = order.orderItems?.[0];
  const previewImage = firstItem?.customizationData?.previewImage || firstItem?.metadata?.previewImage || firstItem?.product?.thumbnail;
  const addressObj = order.shippingAddress || {};
  const formattedAddress = `${addressObj.addressLine1 || ""}, ${addressObj.addressLine2 || ""}, ${addressObj.city || ""}, ${addressObj.state || ""}, ${addressObj.zipCode || ""}`;

  // Formatted dates
  const createdDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="page-content bg-light">
      <CommanBanner image={IMAGES.BackBg1.src} mainText="Order Details" parentText="Home" currentText="Order Details" />
      <div className="content-inner-1">
        <div className="container">
          <div className="row">
            <CommanSidebar />
            <section className="col-xl-9 account-wrapper">
              <div className="mb-4">
                <Link
                  href="/account-orders"
                  className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-slate-900 gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to My Orders
                </Link>
              </div>

              <div className="account-card order-details">
                <div className="order-head flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="head-thumb bg-slate-50 border border-slate-100 rounded-lg p-1 overflow-hidden relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <img src={previewImage || IMAGES.ShopSmallPic1.src} alt="thumbnail" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="clearfix m-l20">
                      <span className="badge bg-slate-900 text-white uppercase text-[10px] tracking-wider px-2 py-0.5 mb-1 font-extrabold">
                        {order.status}
                      </span>
                      <h4 className="mb-0 font-extrabold text-slate-900 leading-snug">Order {order.orderNumber}</h4>
                    </div>
                  </div>
                  {/* Return Request button for DELIVERED orders */}
                  {order.status === "DELIVERED" && (
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(true)}
                      className="btn btn-sm btn-outline-secondary font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Request Return
                    </button>
                  )}
                </div>

                <div className="row mb-sm-4 mb-2 mt-4">
                  <div className="col-sm-6">
                    <div className="shiping-tracker-detail mb-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Item details</span>
                      <h6 className="title text-slate-800 font-bold mt-1">
                        {firstItem?.product?.name || "Epiclance Custom Design"} ({order.orderItems?.length || 1} Item)
                      </h6>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="shiping-tracker-detail mb-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Payment Status</span>
                      <h6 className="title text-slate-800 font-bold mt-1 uppercase">
                        {order.status === "PENDING" ? "Unpaid / Pending" : "Paid via Razorpay"}
                      </h6>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="shiping-tracker-detail mb-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ordered On</span>
                      <h6 className="title text-slate-800 font-bold mt-1">{createdDate}</h6>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="shiping-tracker-detail mb-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Delivery Address</span>
                      <h6 className="title text-slate-800 font-medium mt-1 leading-normal">
                        {addressObj.firstName} {addressObj.lastName}<br />
                        {formattedAddress}<br />
                        Phone: {addressObj.phone}
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="clearfix mt-4">
                  <Tab.Container defaultActiveKey={"details"}>
                    <div className="dz-tabs style-3">
                      <Nav className="nav nav-tabs" id="nav-tab" role="tablist">
                        <Nav.Link className="nav-link" eventKey={"details"}>Item Details</Nav.Link>
                        <Nav.Link className="nav-link" eventKey={"history"}>Fulfillment Status</Nav.Link>
                      </Nav>
                    </div>

                    <Tab.Content className="tab-content pt-4" id="nav-tabContent">
                      
                      {/* Item details */}
                      <Tab.Pane eventKey={"details"}>
                        <h5 className="font-extrabold text-slate-900 mb-4">Ordered Items</h5>
                        {order.orderItems?.map((item: any) => {
                          const hasCustom = item.customizationData?.textInputs?.length > 0;
                          return (
                            <div key={item.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 mb-4 space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="tracking-item flex items-center gap-3">
                                  <div className="tracking-product bg-white border border-slate-200 rounded-lg p-1 w-20 h-20 shrink-0 flex items-center justify-center relative overflow-hidden">
                                    <img 
                                      src={item.customizationData?.previewImage || item.metadata?.previewImage || item.product?.thumbnail} 
                                      alt="design preview" 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <div className="tracking-product-content">
                                    <h6 className="title font-bold text-slate-900 text-sm mb-1">{item.product?.name}</h6>
                                    <small className="d-block text-slate-500 font-medium"><strong>Base Price</strong> : ₹ {Number(item.price - (item.metadata?.addonsTotal || 0)).toFixed(2)}</small>
                                    <small className="d-block text-slate-500 font-medium"><strong>Addons</strong> : ₹ {Number(item.metadata?.addonsTotal || 0).toFixed(2)}</small>
                                    <small className="d-block text-slate-500 font-medium"><strong>Quantity</strong> : {item.quantity}</small>
                                  </div>
                                </div>
                                
                                {hasCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSpecs(item)}
                                    className="btn btn-sm btn-secondary font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 flex items-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Download Specs Sheet
                                  </button>
                                )}
                              </div>

                              {/* Custom text details */}
                              {hasCustom && (
                                <div className="pt-3 border-t border-slate-200/50 space-y-2">
                                  <h6 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Design Customization Specs:</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {item.customizationData.textInputs.map((txt: any, index: number) => (
                                      <div key={index} className="bg-white border border-slate-200/60 rounded-lg p-3 space-y-1 shadow-sm">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                          <span>Line #{index + 1} ({txt.zoneId || "Field"})</span>
                                          <span style={{ fontFamily: txt.fontFamily }} className="text-teal-600">Font: {txt.fontFamily}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2 pt-1">
                                          <p className="text-xs italic text-slate-800 font-bold m-0">&quot;{txt.text}&quot;</p>
                                          <span 
                                            className="w-3.5 h-3.5 rounded-full border border-slate-100 shadow-sm shrink-0" 
                                            style={{ backgroundColor: txt.textColor }} 
                                            title={txt.textColor}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="border-t border-slate-100 pt-4 max-w-sm ml-auto space-y-2 text-xs font-bold text-slate-500">
                          <div className="flex justify-between text-slate-700">
                            <span>Subtotal:</span>
                            <span className="text-slate-900">₹ {Number(order.subtotal).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>VAT / GST (10%):</span>
                            <span className="text-slate-900">₹ {Number(order.tax).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Shipping Charges:</span>
                            <span className="text-slate-900">₹ {Number(order.shipping).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                            <span>Order Total Paid:</span>
                            <span className="text-pink-600">₹ {Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>
                      </Tab.Pane>

                      {/* Timeline */}
                      <Tab.Pane eventKey={"history"}>
                        <h5 className="font-extrabold text-slate-900 mb-4">Track Fulfillment</h5>
                        <div className="widget-timeline style-1">
                          <ul className="timeline">
                            <li>
                              <div className={`timeline-badge ${order.status !== "PENDING" ? "success" : "primary"}`} />
                              <div className="timeline-box">
                                <h6 className="mb-1 font-bold text-slate-800">Order Placed & Confirmed</h6>
                                <span className="text-xs text-slate-400 font-bold block">{createdDate}</span>
                                <p className="text-slate-500 text-xs mt-1">Payment processed securely via Razorpay.</p>
                              </div>
                            </li>

                            {(order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") && (
                              <li>
                                <div className="timeline-badge success" />
                                <div className="timeline-box">
                                  <h6 className="mb-1 font-bold text-slate-800">Processing & Packaging</h6>
                                  <span className="text-xs text-slate-400 font-bold block">In Warehouse</span>
                                  <p className="text-slate-500 text-xs mt-1">Item is customized, packaged, and inspected for shipping.</p>
                                </div>
                              </li>
                            )}

                            {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                              <li>
                                <div className="timeline-badge success" />
                                <div className="timeline-box">
                                  <h6 className="mb-1 font-bold text-slate-800">Product Shipped</h6>
                                  <p className="text-slate-500 text-xs mt-1">Courier: Track with order number on delivery panel.</p>
                                </div>
                              </li>
                            )}

                            {order.status === "DELIVERED" && (
                              <li>
                                <div className="timeline-badge success" />
                                <div className="timeline-box">
                                  <h6 className="mb-1 font-bold text-slate-800">Delivered</h6>
                                  <p className="text-slate-500 text-xs mt-1">Package was delivered to the shipping address.</p>
                                </div>
                              </li>
                            )}

                            {order.status === "CANCELLED" && (
                              <li>
                                <div className="timeline-badge danger bg-red-600" />
                                <div className="timeline-box">
                                  <h6 className="mb-1 font-bold text-red-600">Order Cancelled</h6>
                                  <p className="text-slate-500 text-xs mt-1">This order was cancelled.</p>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      </Tab.Pane>

                    </Tab.Content>
                  </Tab.Container>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReturnModal(false); }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="mb-0 fw-extrabold">Request Return</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowReturnModal(false)}
                aria-label="Close"
              />
            </div>

            <p className="text-muted mb-1" style={{ fontSize: 13 }}>
              Order: <strong>{order.orderNumber}</strong>
            </p>
            <p className="text-muted mb-3" style={{ fontSize: 13 }}>
              Please explain your reason for requesting a return. Our team will review within 2–3 business days.
            </p>

            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: 13 }}>
                Reason for Return <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Describe the issue with your order (min 10 characters)..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                disabled={returnSubmitting}
              />
              <small className="text-muted">{returnReason.length} / min 10 chars</small>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={handleReturnRequest}
                disabled={returnSubmitting || returnReason.trim().length < 10}
              >
                {returnSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" />Submitting...</>
                ) : (
                  "Submit Return Request"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowReturnModal(false)}
                disabled={returnSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}