"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CommanBanner from "@/components/CommanBanner";
import CommanSidebar from "@/elements/MyAccount/CommanSidebar";
import CommanLayout from "@/components/CommanLayout";
import { fetchUserOrders } from "@/lib/ordersApi";
import { getImageUrl } from "@/lib/imageUtils";

interface DownloadItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  productName: string;
  previewImage: string;
  textInputs: any[];
  quantity: number;
  price: number;
}

export default function AccountDownloads() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/account-downloads");
      return;
    }

    const loadDownloads = async () => {
      try {
        // Fetch all orders (up to 100) and extract custom design items
        const data = await fetchUserOrders(token, 1, 100);
        const orders: any[] = data.orders || [];

        const items: DownloadItem[] = [];

        for (const order of orders) {
          // Only PAID/DELIVERED orders have downloadable specs
          if (!["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) continue;

          const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          for (const item of order.orderItems || []) {
            const preview =
              item.customizationData?.previewImage ||
              item.metadata?.previewImage;
            const textInputs = item.customizationData?.textInputs || [];

            // Include items that have either a custom preview image or text inputs
            if (preview || textInputs.length > 0) {
              items.push({
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderDate,
                productName: item.product?.name || "Custom Design",
                previewImage: preview || item.product?.thumbnail || "",
                textInputs,
                quantity: item.quantity || 1,
                price: Number(item.price || 0),
              });
            }
          }
        }

        setDownloads(items);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load downloads.");
      } finally {
        setLoading(false);
      }
    };

    loadDownloads();
  }, [router]);

  const handleDownloadSpec = (item: DownloadItem) => {
    const toastId = toast.loading("Generating specification sheet...");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 800);
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#0F172A";
      ctx.strokeRect(5, 5, 1190, 790);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(10, 10, 1180, 80);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("EPICLANCE CUSTOM PRODUCT SPECIFICATION", 40, 58);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = getImageUrl(item.previewImage);

      img.onload = () => {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(40, 120, 480, 580);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 120, 480, 580);
        const scale = Math.min(440 / img.width, 540 / img.height);
        ctx.drawImage(
          img,
          40 + (480 - img.width * scale) / 2,
          120 + (580 - img.height * scale) / 2,
          img.width * scale,
          img.height * scale
        );

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("ORDER DETAILS", 560, 150);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(560, 165);
        ctx.lineTo(1140, 165);
        ctx.stroke();

        const details = [
          ["Order #", item.orderNumber],
          ["Product", item.productName],
          ["Ordered On", item.orderDate],
          ["Quantity", `${item.quantity} Unit(s)`],
          ["Unit Price", `INR ${item.price.toFixed(2)}`],
        ];
        let y = 200;
        details.forEach(([label, value]) => {
          ctx.fillStyle = "#475569";
          ctx.font = "bold 13px sans-serif";
          ctx.fillText(label + ":", 560, y);
          ctx.fillStyle = "#0f172a";
          ctx.font = "normal 14px sans-serif";
          ctx.fillText(value, 700, y);
          y += 35;
        });

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("CUSTOMIZATION OPTIONS", 560, y + 20);
        ctx.beginPath();
        ctx.moveTo(560, y + 35);
        ctx.lineTo(1140, y + 35);
        ctx.stroke();
        y += 60;

        if (item.textInputs.length === 0) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "italic 14px sans-serif";
          ctx.fillText("No customization text fields.", 560, y);
        } else {
          item.textInputs.forEach((txt: any, idx: number) => {
            if (y > 750) return;
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 13px sans-serif";
            ctx.fillText(`Field #${idx + 1} (${txt.zoneId || "Zone"}):`, 560, y);
            ctx.fillStyle = "#0284c7";
            ctx.font = "normal 12px sans-serif";
            ctx.fillText(`Font: ${txt.fontFamily}  Color: ${txt.textColor}`, 760, y);
            y += 22;
            ctx.fillStyle = "#334155";
            ctx.font = "italic 14px sans-serif";
            ctx.fillText(`"${txt.text}"`, 580, y);
            y += 35;
          });
        }

        const link = document.createElement("a");
        link.download = `${item.orderNumber}-${item.productName.replace(/\s+/g, "-").toLowerCase()}-specs.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Specification sheet downloaded!", { id: toastId });
      };

      img.onerror = () => {
        // Generate without image
        ctx.fillStyle = "#94a3b8";
        ctx.font = "italic 14px sans-serif";
        ctx.fillText("(Preview image unavailable)", 40, 400);
        const link = document.createElement("a");
        link.download = `${item.orderNumber}-specs.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Specification sheet downloaded (no preview)!", { id: toastId });
      };
    } catch (e: any) {
      toast.error("Failed: " + e.message, { id: toastId });
    }
  };

  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <Toaster position="top-center" richColors closeButton />
        <CommanBanner
          mainText="Downloads"
          parentText="Home"
          currentText="Downloads"
        />
        <div className="content-inner-1">
          <div className="container">
            <div className="row">
              <CommanSidebar />
              <section className="col-xl-9 account-wrapper">
                <div className="account-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">
                      My Design Files
                      {!loading && (
                        <span className="badge bg-secondary ms-2">{downloads.length}</span>
                      )}
                    </h4>
                  </div>

                  {loading ? (
                    <div className="py-5 text-center text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading your design files...
                    </div>
                  ) : downloads.length === 0 ? (
                    <div className="py-5 text-center">
                      <i className="fa-solid fa-file-arrow-down fa-3x text-muted mb-3 d-block" />
                      <p className="text-muted mb-2">No downloadable design files found.</p>
                      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                        Design files appear here after customized orders are paid.
                      </p>
                      <Link href="/shop" className="btn btn-secondary px-4">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive download-table">
                      <table className="table check-tbl">
                        <thead>
                          <tr>
                            <th style={{ width: 70 }}>Preview</th>
                            <th>Product</th>
                            <th>Order #</th>
                            <th>Date</th>
                            <th>Fields</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {downloads.map((item, idx) => (
                            <tr key={`${item.orderId}-${idx}`}>
                              <td className="product-item-img">
                                {item.previewImage ? (
                                  <img
                                    src={getImageUrl(item.previewImage)}
                                    alt={item.productName}
                                    style={{
                                      width: 54,
                                      height: 54,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      border: "1px solid #e2e8f0",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 54,
                                      height: 54,
                                      background: "#f1f5f9",
                                      borderRadius: 8,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <i className="fa-solid fa-shirt text-muted" />
                                  </div>
                                )}
                              </td>
                              <td className="product-item-name">
                                <h6 className="mb-0" style={{ fontSize: 14 }}>
                                  {item.productName}
                                </h6>
                                <small className="text-muted">
                                  Qty: {item.quantity} · ₹{item.price.toFixed(2)}
                                </small>
                              </td>
                              <td>
                                <Link
                                  href={`/account-order-details?orderId=${item.orderId}`}
                                  className="fw-bold text-primary"
                                  style={{ fontSize: 13 }}
                                >
                                  {item.orderNumber}
                                </Link>
                              </td>
                              <td style={{ fontSize: 13, color: "#64748b" }}>{item.orderDate}</td>
                              <td style={{ fontSize: 13 }}>
                                {item.textInputs.length > 0 ? (
                                  <span className="badge bg-primary">
                                    {item.textInputs.length} field{item.textInputs.length > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">Image only</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSpec(item)}
                                  className="btn btn-md btn-outline-secondary btnhover20"
                                >
                                  <i className="fa-solid fa-download me-2" />
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </CommanLayout>
  );
}