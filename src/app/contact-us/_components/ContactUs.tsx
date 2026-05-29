"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { fetchPublicCmsPageBySlug } from "@/lib/publicCmsApi";
import { submitInquiry } from "@/lib/inquiryApi";

const CONTACT_SLUGS = ["epiclance-contact-us", "startupkit-contact-us", "contact-us"];

const DEFAULT_HEADING = "Drop Us A Line";
const DEFAULT_SUBHEADING = "Use the form below to get in touch with our team";
const DEFAULT_BREADCRUMB = "Contact Us";
const DEFAULT_ADDRESS =
  "2, Lakshmi Campus, Tulsi Chowk, Katargam, Surat, Gujarat - 395004";
const DEFAULT_PHONE = "+91 9876543210";
const DEFAULT_EMAIL = "radeonenterprise@gmail.com";
const DEFAULT_HOURS = {
  week: "Mon - Fri: 9:00am - 6:00pm",
  saturday: "Saturday: 10:00am - 4:00pm",
  sunday: "Sunday: Closed",
};

type OpenHours = { week?: string; saturday?: string; sunday?: string };

function pickString(v: unknown, fallback: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}

function pickOpenHours(raw: unknown): OpenHours {
  if (!raw || typeof raw !== "object") return DEFAULT_HOURS;
  const o = raw as Record<string, unknown>;
  return {
    week: pickString(o.week, DEFAULT_HOURS.week),
    saturday: pickString(o.saturday, DEFAULT_HOURS.saturday),
    sunday: pickString(o.sunday, DEFAULT_HOURS.sunday),
  };
}

export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(true);
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [subheading, setSubheading] = useState(DEFAULT_SUBHEADING);
  const [breadcrumbLabel, setBreadcrumbLabel] = useState(DEFAULT_BREADCRUMB);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [openHours, setOpenHours] = useState<OpenHours>(DEFAULT_HOURS);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const applyContent = (content: Record<string, unknown>) => {
      setHeading(pickString(content.heading, DEFAULT_HEADING));
      setSubheading(pickString(content.subheading, DEFAULT_SUBHEADING));
      setBreadcrumbLabel(pickString(content.breadcrumbLabel, DEFAULT_BREADCRUMB));
      setAddress(pickString(content.address, DEFAULT_ADDRESS));
      setPhone(pickString(content.phone, DEFAULT_PHONE));
      setEmail(pickString(content.email, DEFAULT_EMAIL));
      setOpenHours(pickOpenHours(content.openHours));
    };

    (async () => {
      try {
        for (const slug of CONTACT_SLUGS) {
          const page = await fetchPublicCmsPageBySlug(slug);
          if (cancelled) return;
          const content = page?.content;
          if (!content || typeof content !== "object") continue;
          applyContent(content as Record<string, unknown>);
          break;
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    const mobileRegex = /^[0-9+\s\-]{10,15}$/;
    if (formData.mobile.trim() && !mobileRegex.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || undefined,
        message: formData.message.trim(),
        from: "startupkit",
      });
      setFormData({ name: "", email: "", mobile: "", message: "" });
      toast.success("Thank you! We'll get back to you soon.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-content bg-light">
        <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
          <div className="container py-5">
            <div className="placeholder-glow">
              <span className="placeholder col-6 mb-3 d-block" style={{ height: "2.5rem" }} />
              <span className="placeholder col-3 d-block" />
            </div>
          </div>
        </section>
        <section className="content-inner">
          <div className="container py-5">
            <div className="row g-4">
              <div className="col-lg-8">
                <span className="placeholder col-12 d-block mb-3" style={{ height: "12rem" }} />
              </div>
              <div className="col-lg-4">
                <span className="placeholder col-12 d-block" style={{ height: "8rem" }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-content bg-light">
      <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
        <div className="container">
          <div className="dz-bnr-inr-entry">
            <div className="row align-items-center">
              <div className="col-lg-12">
                <div className="text-start mb-xl-0 mb-4">
                  <h1>{heading}</h1>
                  <nav aria-label="breadcrumb" className="breadcrumb-row">
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link href="/"> Home</Link>
                      </li>
                      <li className="breadcrumb-item">{breadcrumbLabel}</li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-inner">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <p className="text-muted mb-4">{subheading}</p>

              {errors.form && (
                <div className="alert alert-danger" role="alert">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="dz-form">
                <div className="row">
                  <div className="col-md-6 m-b25">
                    <label className="label-title" htmlFor="name">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <div className="invalid-feedback d-block">{errors.name}</div>
                    )}
                  </div>
                  <div className="col-md-6 m-b25">
                    <label className="label-title" htmlFor="mobile">
                      Phone Number
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                      placeholder="Your phone"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                    {errors.mobile && (
                      <div className="invalid-feedback d-block">{errors.mobile}</div>
                    )}
                  </div>
                  <div className="col-12 m-b25">
                    <label className="label-title" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </div>
                  <div className="col-12 m-b25">
                    <label className="label-title" htmlFor="message">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      placeholder="How can we help?"
                      value={formData.message}
                      onChange={handleChange}
                    />
                    {errors.message && (
                      <div className="invalid-feedback d-block">{errors.message}</div>
                    )}
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-secondary btnhover"
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-4">
              <div className="widget">
                <h4 className="widget-title">Our Store</h4>
                <p className="mb-2">{address}</p>
                <p className="mb-1">
                  Phone:{" "}
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-body">
                    {phone}
                  </a>
                </p>
                <p className="mb-4">
                  Email:{" "}
                  <a href={`mailto:${email}`} className="text-body">
                    {email}
                  </a>
                </p>

                <h4 className="widget-title">Open Hours</h4>
                <ul className="list-unstyled mb-0">
                  {openHours.week && <li className="mb-2">{openHours.week}</li>}
                  {openHours.saturday && <li className="mb-2">{openHours.saturday}</li>}
                  {openHours.sunday && <li className="mb-2">{openHours.sunday}</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
