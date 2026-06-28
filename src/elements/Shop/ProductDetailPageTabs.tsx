"use client";

import { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { buildProductSpecRows } from "./buildProductSpecRows";
import ProductReviewPanel from "./ProductReviewPanel";
import SafeHtml from "@/components/SafeHtml";

import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/imageUtils";

type Props = {
  productData?: Record<string, any> | null;
  /** From `/products/[slug]` — use when API payload omits or mangles `slug` (e.g. reviews API). */
  routeSlug?: string;
  relatedVariants?: any[];
};

/**
 * Radeon-style PDP section: description + specification column, plus reviews tab.
 */
export default function ProductDetailPageTabs({ productData, routeSlug, relatedVariants = [] }: Props) {
  const product = productData || {};
  const name = product.name || "Product";
  const apiSlug = product.slug;
  const fromApi =
    typeof apiSlug === "string" ? apiSlug.trim() : apiSlug != null && String(apiSlug) !== "" ? String(apiSlug).trim() : "";
  const productSlug = fromApi || String(routeSlug ?? "").trim();
  const descriptionHTML = typeof product.description === "string" ? product.description : "";
  const specRows = buildProductSpecRows(product);
  const hasNarrative = descriptionHTML.replace(/<[^>]+>/g, "").trim() !== "";
  const [reviewTotal, setReviewTotal] = useState<number | null>(null);

  return (
    <div className="product-description">
      <Tab.Container defaultActiveKey="description">
        <div className="dz-tabs">
          <Nav as="ul" className="nav-tabs center" role="tablist">
            <Nav.Item as="li">
              <Nav.Link as="button" type="button" eventKey="description" role="tab">
                Description
              </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link as="button" type="button" eventKey="specifications" role="tab">
                Specifications
              </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link as="button" type="button" eventKey="reviews" role="tab">
                Reviews{reviewTotal != null ? ` (${reviewTotal})` : ""}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="pt-4">
            <Tab.Pane eventKey="description" role="tabpanel">
              <div className="row g-lg-4 g-3">
                <div className="col-12">
                  <div
                    className="detail-bx text-start"
                    style={{
                      overflow: "hidden",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    <h5 className="title mb-4">About {name}</h5>
                    {hasNarrative ? (
                      <SafeHtml
                        className="para-text"
                        html={descriptionHTML}
                        style={{ wordBreak: "break-word", width: "100%", overflowX: "hidden" }}
                      />
                    ) : (
                      <p className="text-secondary">No long description for this product yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey="specifications" role="tabpanel">
              <div className="row g-lg-4 g-3">
                <div className="col-lg-8 mx-auto">
                  <div className="product-specification">
                    <h4 className="specification-title">Specifications</h4>
                    <p className="text-secondary small mb-3">
                      Key product details and identifiers.
                    </p>
                  </div>
                  <ul className="specification-list mb-0 list-unstyled p-0 m-b40">

                    {specRows.map((row, i) => (
                      <li key={`${row.label}-${i}`} className="list-info">
                        {row.label} <span>{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey="reviews" role="tabpanel">
              <ProductReviewPanel
                slug={productSlug}
                productName={name}
                fallbackRate={product.rate}
                onReviewsSummary={(s) => setReviewTotal(s.totalCount)}
              />
            </Tab.Pane>
          </Tab.Content>
        </div>
      </Tab.Container >
    </div >
  );
}
