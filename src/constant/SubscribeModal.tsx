"use client"
import { useEffect, useRef, useState, FormEvent } from "react";
import IMAGES from "./theme";
import { getPublicApiUrl } from "@/lib/env";
import { getImageUrl } from "@/lib/imageUtils";
import { submitInquiry } from "@/lib/inquiryApi";

/** Node can expose a broken global localStorage when --localstorage-file is invalid */
function storageGet(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        const ls = globalThis.localStorage;
        if (!ls || typeof ls.getItem !== "function") return null;
        return ls.getItem(key);
    } catch {
        return null;
    }
}
function storageSet(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
        const ls = globalThis.localStorage;
        if (!ls || typeof ls.setItem !== "function") return;
        ls.setItem(key, value);
    } catch {
        /* private mode / quota */
    }
}

interface SubscribeModalConfig {
    enabled: boolean;
    titleLabel: string;
    heading: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    mobileLabel: string;
    mobilePlaceholder: string;
    submitButtonText: string;
    consentText: string;
    successMessage: string;
    imageUrl: string;
    delaySeconds: number;
    reopenAfterHours: number;
}

const defaultConfig: SubscribeModalConfig = {
    enabled: true,
    titleLabel: "Newsletter",
    heading: "Subscribe Now",
    description: "Stay updated on all that's new and noteworthy",
    nameLabel: "Your Name",
    namePlaceholder: "Enter your name",
    mobileLabel: "Mobile Number",
    mobilePlaceholder: "Enter mobile number",
    submitButtonText: "Subscribe",
    consentText: "I agree to receive marketing materials",
    successMessage: "Thank you! We will contact you soon.",
    imageUrl: "",
    delaySeconds: 5,
    reopenAfterHours: 8,
};

function resolveImageUrl(url?: string) {
    if (!url) return getImageUrl(IMAGES.Adv2);
    return getImageUrl(url);
}

export default function SubscribeModal() {
    const [subscribeModal, setSubscribeModal] = useState(false);
    const [config, setConfig] = useState<SubscribeModalConfig>(defaultConfig);
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [submitError, setSubmitError] = useState("");
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${getPublicApiUrl()}/public/cms/slug/startupkit-subscribe-modal`, {
                    cache: "no-store",
                });
                if (!res.ok) return;
                const json = await res.json();
                const content = json?.data?.content || json?.content;
                if (content && typeof content === "object") {
                    setConfig({ ...defaultConfig, ...content });
                }
            } catch {
                /* use defaults */
            }
        };
        fetchConfig();
    }, []);

    function handleClose() {
        storageSet("getval", "true");
        setSubscribeModal(false);
        document.body.classList.remove("overflow-hidden");
    }

    function scheduleReopen(reopenAfterHours: number) {
        const reopenAfterSeconds = Math.max(1, reopenAfterHours) * 3600;
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 1;
            if (elapsed > reopenAfterSeconds) {
                setSubscribeModal(true);
                document.body.classList.add("overflow-hidden");
                clearInterval(interval);
            }
        }, 1000);
    }

    useEffect(() => {
        if (!config.enabled) return;

        const updateMargin = () => {
            if (dialogRef.current) {
                const windowHeight = window.innerHeight;
                const modalHight = dialogRef.current.clientHeight;
                setHeight(Math.max(0, (windowHeight - modalHight) / 2));
            }
        };

        const marginInterval = setInterval(updateMargin, 1000);
        const getvalue = storageGet("getval");

        if (getvalue === "true") {
            scheduleReopen(config.reopenAfterHours);
        } else {
            const timer = setTimeout(() => {
                setSubscribeModal(true);
                document.body.classList.add("overflow-hidden");
            }, Math.max(0, config.delaySeconds) * 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(marginInterval);
            };
        }

        return () => clearInterval(marginInterval);
    }, [config.enabled, config.delaySeconds, config.reopenAfterHours]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitError("");
        setSubmitMessage("");

        if (!name.trim()) {
            setSubmitError("Please enter your name.");
            return;
        }
        if (!mobile.trim()) {
            setSubmitError("Please enter your mobile number.");
            return;
        }
        if (!consent) {
            setSubmitError("Please agree to receive marketing materials.");
            return;
        }

        try {
            setSubmitting(true);
            await submitInquiry({
                name: name.trim(),
                mobile: mobile.trim(),
                message: "Subscription popup lead",
                from: "subscription-modal",
            });
            setSubmitMessage(config.successMessage);
            setName("");
            setMobile("");
            setConsent(false);
            setTimeout(() => handleClose(), 1500);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!config.enabled) return null;

    return (
        <>
            <div className={`modal fade inquiry-modal style-1 ${subscribeModal ? "show d-block" : ""} `}
                id="myModal" tabIndex={-1} aria-labelledby="exampleModalCenterTitle" aria-hidden="true"
            >
                <div className="modal-dialog" role="document" id="modaldilog"
                    ref={dialogRef}
                    style={{ marginTop: height }}
                >
                    <div className="inquiry-adv">
                        <img src={resolveImageUrl(config.imageUrl)} alt="promo" />
                    </div>
                    <div className="modal-content">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="myButton"
                            onClick={handleClose}
                        >
                            <span aria-hidden="true"><i className="icon feather icon-x" /></span>
                        </button>
                        <div>
                            <div className="modal-header">
                                <span className="title-head">{config.titleLabel}</span>
                                <h3 className="modal-title" id="exampleModalLongTitle">{config.heading}</h3>
                                <p className="text">{config.description}</p>
                            </div>
                            <div className="modal-body">
                                <form className="dzSubscribe" onSubmit={handleSubmit}>
                                    {submitError && <div className="alert alert-danger py-2">{submitError}</div>}
                                    {submitMessage && <div className="alert alert-success py-2">{submitMessage}</div>}
                                    <div className="form-group">
                                        <label className="form-label">{config.nameLabel}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            required
                                            placeholder={config.namePlaceholder}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{config.mobileLabel}</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            className="form-control"
                                            required
                                            placeholder={config.mobilePlaceholder}
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        name="submit"
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-secondary btn-block m-b15 text-uppercase"
                                    >
                                        {submitting ? "Submitting..." : config.submitButtonText}
                                    </button>
                                    <div className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="basic_checkbox_3"
                                            checked={consent}
                                            onChange={(e) => setConsent(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="basic_checkbox_3">{config.consentText}</label>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {subscribeModal ?
                <div className={`modal-backdrop fade show`}></div>
                : ''
            }
        </>
    )
}
