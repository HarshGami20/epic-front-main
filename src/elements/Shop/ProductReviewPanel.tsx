"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { toast, Toaster } from "sonner";
import {
  createPublicProductReview,
  fetchPublicProductReviews,
  type PublicProductReview,
  type PublicProductReviewsPayload,
} from "@/lib/publicProductReviewsApi";
import { getImageUrl } from "@/lib/imageUtils";
import css from "./productReviewAmazon.module.css";

const MAX_REVIEW_IMAGES = 6;
const MAX_IMAGE_MB = 8;

function histogramFromAvg(avg: number): number[] {
  const a = Math.min(5, Math.max(0, avg));
  const tilt = (5 - a) * 10;
  const v5 = Math.max(5, Math.round(62 - tilt));
  const v4 = Math.max(4, Math.round(18 + tilt * 0.4));
  const v3 = Math.max(3, Math.round(10 + tilt * 0.25));
  const v2 = Math.max(2, Math.round(5 + tilt * 0.2));
  const v1 = Math.max(1, 100 - v5 - v4 - v3 - v2);
  return [v5, v4, v3, v2, v1];
}

function formatGlobalRatings(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, n));
}

function formatReviewDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `Reviewed in India on ${new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d)}`;
  } catch {
    return "";
  }
}

function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  const filled = Math.round(Math.min(max, Math.max(0, value)));
  return (
    <ul className={css.starRow} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <li key={i} className={i < filled ? "star-fill" : ""} style={{ color: i < filled ? "#de7921" : "#ddd" }}>
          <i className="flaticon-star-1" style={{ fontSize: 16 }} />
        </li>
      ))}
    </ul>
  );
}

function StarPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: number;
  onChange: (n: number) => void;
  idPrefix: string;
}) {
  const [hover, setHover] = useState(0);
  const show = hover || value;

  return (
    <div className="d-flex align-items-center gap-1 flex-wrap" role="group" aria-label="Overall rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          id={`${idPrefix}-star-${n}`}
          className={`${css.starBtn} ${n > show ? css.starBtnMuted : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <i className="flaticon-star-1" style={{ fontSize: 28 }} />
        </button>
      ))}
      <span className="text-secondary small ms-2">{show > 0 ? `${show} star${show > 1 ? "s" : ""}` : "Tap to rate"}</span>
    </div>
  );
}

function AuthorAvatar({ name }: { name: string }) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div
      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
      style={{ width: 40, height: 40, fontSize: 16 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function ReviewGallery({ images }: { images: string[] }) {
  if (!images?.length) return null;
  return (
    <div className={css.reviewImages}>
      {images.map((src, i) => {
        const resolved = getImageUrl(src);
        const srcStr = typeof resolved === "string" ? resolved : String(src);
        return (
          <Image
            key={`${src}-${i}`}
            src={srcStr}
            alt="Customer review"
            width={88}
            height={88}
            className={css.reviewThumb}
            unoptimized={srcStr.startsWith("http")}
          />
        );
      })}
    </div>
  );
}

type PreviewItem = { id: string; url: string; file: File };

type ProductReviewPanelProps = {
  slug?: string | null;
  productName?: string;
  /** Product `rate` when there are no reviews yet (histogram / headline fallback). */
  fallbackRate?: number;
  onReviewsSummary?: (summary: { totalCount: number }) => void;
};

export default function ProductReviewPanel({
  slug,
  productName,
  fallbackRate = 0,
  onReviewsSummary,
}: ProductReviewPanelProps) {
  const formId = useId();
  const safeSlug = typeof slug === "string" ? slug.trim() : "";
  const onReviewsSummaryRef = useRef(onReviewsSummary);
  onReviewsSummaryRef.current = onReviewsSummary;

  const [sortBy, setSortBy] = useState<"top" | "recent">("top");
  const [payload, setPayload] = useState<PublicProductReviewsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [writeRating, setWriteRating] = useState(0);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  useEffect(
    () => () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    },
    []
  );

  const loadReviews = useCallback(async () => {
    if (!safeSlug) {
      setPayload(null);
      setLoadError(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPublicProductReviews(safeSlug, { sort: sortBy, page: 1, limit: 25 });
      if (!data) {
        setPayload(null);
        setLoadError("Could not load reviews.");
        return;
      }
      setPayload(data);
    } catch {
      setPayload(null);
      setLoadError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, [safeSlug, sortBy]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const n = payload?.summary?.totalCount;
    if (n != null) onReviewsSummaryRef.current?.({ totalCount: n });
  }, [payload?.summary?.totalCount]);

  const fallback = Number.isFinite(Number(fallbackRate)) ? Math.min(5, Math.max(0, Number(fallbackRate))) : 0;
  const totalCount = payload?.summary.totalCount ?? 0;
  const apiAvg = payload?.summary.averageRating ?? 0;
  const displayAvg = totalCount > 0 ? apiAvg : fallback;
  const hist =
    totalCount > 0 && payload?.summary.histogram?.length === 5
      ? payload.summary.histogram
      : histogramFromAvg(displayAvg || 4.2);
  const totalRatingsLabel = `${formatGlobalRatings(totalCount)} global ratings`;

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: PreviewItem[] = [...previews];
    for (let i = 0; i < list.length; i++) {
      if (next.length >= MAX_REVIEW_IMAGES) {
        toast.warning(`You can add up to ${MAX_REVIEW_IMAGES} photos.`);
        break;
      }
      const file = list[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_IMAGE_MB} MB.`);
        continue;
      }
      next.push({ id: `${file.name}-${file.size}-${Date.now()}-${i}`, url: URL.createObjectURL(file), file });
    }
    setPreviews(next);
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safeSlug) {
      toast.error("Missing product.");
      return;
    }
    if (writeRating < 1) {
      toast.error("Please select an overall star rating.");
      return;
    }
    if (body.trim().length < 20) {
      toast.error("Please write at least 20 characters in your review.");
      return;
    }
    if (!headline.trim()) {
      toast.error("Please add a short headline for your review.");
      return;
    }
    if (!author.trim() || !email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (previews.length > 0) {
      toast.message("Photo upload to storage is not wired yet — submitting text only. Images stay in your browser.");
    }

    setSubmitting(true);
    try {
      const created = await createPublicProductReview(safeSlug, {
        authorName: author.trim(),
        authorEmail: email.trim(),
        rating: writeRating,
        title: headline.trim(),
        body: body.trim(),
        images: [],
      });
      if (!created) {
        toast.error("Could not submit review.");
        return;
      }
      toast.success("Thanks! Your review was posted.");
      setWriteRating(0);
      setHeadline("");
      setBody("");
      setAuthor("");
      setEmail("");
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setShowReviewModal(false);
      await loadReviews();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewsList: PublicProductReview[] = useMemo(() => payload?.reviews ?? [], [payload]);

  if (!safeSlug) {
    return (
      <div className="text-secondary small">
        Reviews are unavailable for this product (missing slug).
      </div>
    );
  }

  return (
    <div className={`${css.root} post-comments comments-area style-1 clearfix`}>
      <Toaster position="top-center" richColors closeButton />

      <h4 className="comments-title mb-3">Customer reviews</h4>
      {productName && (
        <p className="text-secondary small mb-2 mb-md-3">
          For: <strong>{productName}</strong>
        </p>
      )}

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <span className="text-secondary small d-none d-sm-inline">Share your experience with this product</span>
        <Button
          type="button"
          variant="warning"
          className="text-dark fw-600"
          onClick={() => setShowReviewModal(true)}
        >
          Write a review
        </Button>
      </div>

      {loadError && (
        <div className="alert alert-warning py-2 small mb-3" role="alert">
          {loadError}
        </div>
      )}

      <div className={css.summaryGrid}>
        <div>
          <div className="d-flex align-items-start gap-2 flex-wrap">
            <span className={css.bigRating}>{(displayAvg || 0).toFixed(1)}</span>
            <div>
              <StarDisplay value={displayAvg} />
              <p className="mb-1 mt-1 small text-secondary">{totalRatingsLabel}</p>
              <Link href="#" className="small text-decoration-none" style={{ color: "#007185" }} onClick={(e) => e.preventDefault()}>
                How customer reviews and ratings work
              </Link>
            </div>
          </div>
          <div className="mt-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const i = 5 - star;
              return (
                <div key={star} className={css.barRow}>
                  <span>{star} star</span>
                  <div className={css.barTrack}>
                    <div className={css.barFill} style={{ width: `${hist[i]}%` }} />
                  </div>
                  <span className="text-end text-secondary">{hist[i]}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <span className="fw-600">Top reviews from India</span>
            <Form.Select
              size="sm"
              className={css.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value === "recent" ? "recent" : "top")}
              aria-label="Sort reviews"
              disabled={loading}
            >
              <option value="top">Top reviews</option>
              <option value="recent">Most recent</option>
            </Form.Select>
          </div>

          {loading && (
            <div className="d-flex align-items-center gap-2 text-secondary py-4">
              <Spinner animation="border" size="sm" />
              <span>Loading reviews…</span>
            </div>
          )}

          {!loading && reviewsList.length === 0 && (
            <div className="py-3">
              <p className="text-secondary mb-2">No reviews yet. Be the first to review this product.</p>
              <Button type="button" variant="outline-secondary" size="sm" onClick={() => setShowReviewModal(true)}>
                Write the first review
              </Button>
            </div>
          )}

          {!loading &&
            reviewsList.map((r) => (
              <article key={r.id} className={css.reviewCard}>
                <div className="d-flex gap-3">
                  <AuthorAvatar name={r.authorName} />
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-600">{r.authorName}</div>
                    {r.verifiedPurchase && <div className={css.verified}>Verified Purchase</div>}
                    <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                      <StarDisplay value={r.rating} />
                      <span className="fw-600">{r.title}</span>
                    </div>
                    <div className={css.reviewMeta}>{formatReviewDate(r.createdAt)}</div>
                    <div className={css.reviewBody}>{r.body}</div>
                    <ReviewGallery images={r.images} />
                    <div className={css.helpfulRow}>
                      <span>Helpful?</span>
                      <button type="button" className={css.helpfulBtn}>
                        Yes · {r.helpfulCount ?? 0}
                      </button>
                      <button type="button" className={css.helpfulBtn}>
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>

      <Modal
        show={showReviewModal}
        onHide={() => {
          if (!submitting) setShowReviewModal(false);
        }}
        size="lg"
        centered
        scrollable
        className="product-review-modal"
        contentClassName="border-0 shadow"
        aria-labelledby="pdp-review-modal-title"
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title as="h5" id="pdp-review-modal-title" className="fw-700">
            Review this product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {productName && (
            <p className="text-secondary small mb-3">
              <strong>{productName}</strong>
            </p>
          )}
          <p className="text-secondary small mb-3">
            Your review will be shared publicly. Photo previews are local only until you connect a media upload; the review is saved as text (and optional image URLs from storage when configured).
          </p>
          <Form onSubmit={(e) => void handleSubmit(e)} id="pdp-product-review-form">
            <div className="mb-3">
              <span className={css.formLabel}>
                Overall rating <span className="text-danger">*</span>
              </span>
              <StarPicker value={writeRating} onChange={setWriteRating} idPrefix={formId} />
            </div>

            <div className="mb-3">
              <Form.Label htmlFor={`${formId}-headline`} className={css.formLabel}>
                Add a headline <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id={`${formId}-headline`}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={128}
                placeholder="What's most important to know?"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <Form.Label htmlFor={`${formId}-body`} className={css.formLabel}>
                Written review <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                id={`${formId}-body`}
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                minLength={20}
                placeholder="What did you like or dislike? What did you use this product for?"
              />
              <Form.Text>{body.trim().length} characters (minimum 20)</Form.Text>
            </div>

            <div className="mb-3">
              <span className={css.formLabel}>Add photos (optional)</span>
              <label className={`${css.uploadZone} d-block mb-2`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="d-none"
                  onChange={(e) => {
                    onPickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <span className="fw-600 d-block mb-1">Upload from device</span>
                <span className="text-secondary small">
                  Up to {MAX_REVIEW_IMAGES} images · {MAX_IMAGE_MB} MB each · JPG, PNG, WebP, GIF
                </span>
              </label>
              {previews.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {previews.map((p) => (
                    <div key={p.id} className={css.previewWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className={css.previewImg} />
                      <button type="button" className={css.removePreview} onClick={() => removePreview(p.id)} aria-label="Remove photo">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="row g-3 mb-0">
              <div className="col-md-6">
                <Form.Label htmlFor={`${formId}-author`} className={css.formLabel}>
                  Your name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control id={`${formId}-author`} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Alex" />
              </div>
              <div className="col-md-6">
                <Form.Label htmlFor={`${formId}-email`} className={css.formLabel}>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  id={`${formId}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For order verification only"
                />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0 flex-wrap gap-2">
          <p className="small text-secondary w-100 mb-0 me-auto">By submitting, you agree to our community guidelines.</p>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => !submitting && setShowReviewModal(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="pdp-product-review-form" variant="warning" className="text-dark fw-600" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
