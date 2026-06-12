import CommanLayout from "@/components/CommanLayout";

export const metadata = {
  title: "Return, Refund & Replacement Policy – Epiclance",
  description: "Read our return, refund, and replacement policy. Check eligibility, customized product exceptions, and timelines.",
};

export default function ReturnPolicyPage() {
  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
          <div className="container">
            <div className="dz-bnr-inr-entry">
              <div className="row align-items-center">
                <div className="col-lg-12">
                  <div className="text-start mb-xl-0 mb-4">
                    <h1 className="mb-2">Return, Refund &amp; Replacement Policy</h1>
                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                      <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                          <a href="/">Home</a>
                        </li>
                        <li className="breadcrumb-item">Return &amp; Refund Policy</li>
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
            <div className="row">
              <div className="col-lg-12">
                <div className="bg-white p-4 p-md-5 rounded shadow-sm" style={{ color: "#333", lineHeight: "1.7" }}>
                  <p className="lead mb-4">
                    At Epiclane Private Limited, customer satisfaction is important to us. We carefully manufacture 
                    and inspect every product before dispatch. However, if you receive a damaged, defective, 
                    incorrect, or incomplete product, we are here to help.
                  </p>
                  <p className="mb-5 text-muted">
                    Please read this policy carefully before requesting a return, refund, or replacement.
                  </p>

                  <hr className="my-4" />

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">1. Company Information</h3>
                  <p>
                    Epiclane Private Limited<br />
                    474, 1st Floor, New GIDC, Katargam, Surat, Gujarat - 395004, India<br /><br />
                    Website: <a href="https://www.epiclane.in" className="text-primary hover:underline">www.epiclane.in</a><br />
                    Email: <a href="mailto:contact@epiclane.in" className="text-primary hover:underline">contact@epiclane.in</a><br />
                    Contact Form: <a href="https://www.epiclane.in/contact-us" className="text-primary hover:underline">https://www.epiclane.in/contact-us</a>
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">2. Return Eligibility</h3>
                  <p>
                    Customers may request a return, replacement, or refund within 7 days from the date of delivery, 
                    subject to the conditions mentioned in this policy.
                  </p>
                  <p>To be eligible, the product must:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Be in its original condition</li>
                    <li>Be unused where applicable</li>
                    <li>Include original packaging</li>
                    <li>Be accompanied by proof of purchase</li>
                    <li>Meet the requirements described in this policy</li>
                  </ul>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">3. Customized &amp; Personalized Products</h3>
                  <p>
                    Most products sold by Epiclane are personalized and manufactured specifically according to 
                    customer-provided details.
                  </p>
                  <p>
                    Therefore, customized and personalized products are generally non-returnable and non-refundable 
                    except in the following situations:
                  </p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Product received damaged during transit</li>
                    <li>Product received defective</li>
                    <li>Wrong product delivered</li>
                    <li>Wrong customization done by Epiclane</li>
                    <li>Product significantly differs from the approved order details</li>
                  </ul>
                  <p>Returns or refunds will not be approved for:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Change of mind or Personal preference</li>
                    <li>Ordering the wrong product</li>
                    <li>Incorrect customization details submitted by the customer</li>
                    <li>Minor variations in color, texture, grain, print placement, or finish</li>
                  </ul>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">4. Damaged, Defective, or Incorrect Products</h3>
                  <p>If you receive a damaged, broken, defective, incomplete, or incorrect product, you must:</p>
                  <p><strong>Within 7 Days of Delivery:</strong></p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Contact our support team and provide your order details</li>
                    <li>Share a complete and uninterrupted unboxing video</li>
                    <li>Provide product photographs if requested</li>
                  </ul>
                  <p>
                    Claims submitted without an unboxing video may not be eligible for replacement or refund.
                  </p>
                  <p>
                    Epiclane reserves the right to inspect and verify all claims before approving any resolution.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">5. Replacement Policy</h3>
                  <p>If a replacement request is approved:</p>
                  <ul className="list-unstyled ps-3 mb-4">
                    <li className="mb-2"><strong>Replacement manufacturing time:</strong> 3–5 Business Days</li>
                    <li className="mb-2"><strong>Delivery time (India Orders):</strong> Up to 15 Days depending on location</li>
                  </ul>
                  <p>
                    Replacement products will be shipped at no additional cost if the issue is verified and approved.
                  </p>
                  <p>
                    Epiclane reserves the right to provide a replacement instead of a refund whenever appropriate.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">6. Refund Policy</h3>
                  <p>Refunds may be approved in situations such as:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Replacement is not possible</li>
                    <li>Product is permanently out of stock</li>
                    <li>Severe manufacturing defect</li>
                    <li>Wrong product delivered and replacement unavailable</li>
                    <li>Order cannot be fulfilled</li>
                  </ul>
                  <p>
                    Approved refunds will be processed through the original payment method whenever possible.
                  </p>
                  <p><strong>Refund Processing Time:</strong></p>
                  <ul className="list-unstyled ps-3 mb-4">
                    <li className="mb-2"><strong>Refund approval:</strong> 2–5 Business Days</li>
                    <li className="mb-2"><strong>Bank/Card Processing:</strong> 5–10 Business Days</li>
                  </ul>
                  <p>
                    Actual refund timelines may vary depending on banks, payment gateways, and financial institutions.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">7. International Orders</h3>
                  <p>
                    International orders are generally non-returnable and non-refundable due to shipping costs, 
                    customs regulations, and international logistics limitations.
                  </p>
                  <p>However, if an international order arrives Damaged, Defective, or Incorrect, customers must contact us within 7 days of delivery and provide:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Complete unboxing video</li>
                    <li>Product photographs</li>
                    <li>Order details</li>
                  </ul>
                  <p>After review, Epiclane may, at its sole discretion:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Provide a replacement</li>
                    <li>Offer store credit</li>
                    <li>Issue a partial or full refund</li>
                  </ul>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">8. Non-Returnable Items</h3>
                  <p>The following items are not eligible for return or refund:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Successfully delivered customized products</li>
                    <li>Products with customer-approved designs</li>
                    <li>Products with customer-provided spelling errors</li>
                    <li>Gift cards or Downloadable products (if applicable)</li>
                    <li>Products damaged after delivery</li>
                    <li>Products showing signs of misuse or negligence</li>
                    <li>Products without original packaging</li>
                    <li>Products returned without authorization</li>
                  </ul>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">9. Customer-Provided Customization Errors</h3>
                  <p>Customers are solely responsible for verifying:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Names, Spellings, Dates, Messages</li>
                    <li>Logos, Artwork, Uploaded Images</li>
                  </ul>
                  <p>
                    Epiclane is not responsible for errors resulting from incorrect information submitted by customers 
                    during the ordering process.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">10. Manufacturing &amp; Material Variations</h3>
                  <p>
                    Many Epiclane products are made from natural materials such as wood, MDF, acrylic, metal, 
                    and handcrafted components.
                  </p>
                  <p>Minor variations in:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Color, Texture, Grain Pattern</li>
                    <li>Print Position, Engraving Depth, Finishing</li>
                  </ul>
                  <p>are considered normal and do not qualify as defects.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">11. Cancellation of Approved Returns</h3>
                  <p>
                    Epiclane reserves the right to reject any return, refund, or replacement request if:
                  </p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>The claim appears fraudulent</li>
                    <li>Required evidence is not provided</li>
                    <li>Product damage occurred after delivery</li>
                    <li>Policy conditions are not met</li>
                  </ul>
                  <p>The decision of Epiclane regarding claim verification shall be final.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">12. Limitation of Liability</h3>
                  <p>Our liability for any approved claim shall be limited to:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Replacement of the product, or</li>
                    <li>Refund of the amount paid for the product</li>
                  </ul>
                  <p>
                    Epiclane shall not be liable for indirect, incidental, consequential, or special damages arising 
                    from the use of our products.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">13. Contact Us</h3>
                  <p>For return, refund, or replacement requests, please contact:</p>
                  <p>
                    Epiclane Private Limited<br />
                    474, 1st Floor, New GIDC, Katargam, Surat, Gujarat - 395004, India<br /><br />
                    Email: <a href="mailto:contact@epiclane.in" className="text-primary hover:underline">contact@epiclane.in</a><br />
                    Contact Form: <a href="https://www.epiclane.in/contact-us" className="text-primary hover:underline">https://www.epiclane.in/contact-us</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CommanLayout>
  );
}
