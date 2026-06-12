import CommanLayout from "@/components/CommanLayout";

export const metadata = {
  title: "Cancellation Policy – Epiclance",
  description: "Read our order cancellation policy, conditions for cancellation before production, and refund procedures.",
};

export default function CancellationPolicyPage() {
  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
          <div className="container">
            <div className="dz-bnr-inr-entry">
              <div className="row align-items-center">
                <div className="col-lg-12">
                  <div className="text-start mb-xl-0 mb-4">
                    <h1 className="mb-2">Cancellation Policy</h1>
                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                      <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                          <a href="/">Home</a>
                        </li>
                        <li className="breadcrumb-item">Cancellation Policy</li>
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
                    At Epiclane Private Limited, many of our products are customized and personalized according 
                    to individual customer requirements. Because production may begin shortly after an order is 
                    placed, we have established the following cancellation policy.
                  </p>
                  <p className="mb-5 text-muted">
                    By placing an order with Epiclane, you agree to the terms outlined below.
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

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">2. Order Cancellation Requests</h3>
                  <p>
                    Customers may request cancellation of an order by contacting our support team through email, phone, 
                    or WhatsApp before production or processing begins.
                  </p>
                  <p>
                    Cancellation requests are subject to review and approval by Epiclane.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">3. Cancellation Before Production Starts</h3>
                  <p>Orders may be cancelled without penalty if:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Production has not started</li>
                    <li>Customization work has not begun</li>
                    <li>Artwork preparation has not started</li>
                    <li>Printing, engraving, manufacturing, or assembly has not commenced</li>
                  </ul>
                  <p>If approved, the customer will be eligible for a full refund of the amount paid.</p>
                  <p>Refunds will be processed according to the refund timelines mentioned in this policy.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">4. Cancellation After Production Begins</h3>
                  <p>Once production has started, orders cannot be cancelled.</p>
                  <p>This includes situations where:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Personalization details have been processed</li>
                    <li>Design work has begun</li>
                    <li>Artwork has been prepared</li>
                    <li>Printing has started</li>
                    <li>Engraving has started</li>
                    <li>Manufacturing or assembly has begun</li>
                  </ul>
                  <p>
                    Since customized products are created specifically for the customer, cancellation requests after 
                    production begins will not be accepted.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">5. Customized & Personalized Products</h3>
                  <p>Most Epiclane products are made to order using customer-provided:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Names, Logos, Photographs</li>
                    <li>Messages, Artwork, Branding Elements</li>
                  </ul>
                  <p>
                    Because these products are created specifically for an individual customer or organization, they 
                    are generally not eligible for cancellation once production activities have started.
                  </p>
                  <p>
                    Customers are advised to carefully review all customization details before placing an order.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">6. Modification of Orders</h3>
                  <p>Customers may request modifications to their order before production begins.</p>
                  <p>Requested changes may include:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Name Corrections, Design Changes</li>
                    <li>Quantity Updates, Address Updates</li>
                  </ul>
                  <p>Once production has started, modifications may not be possible.</p>
                  <p>
                    Epiclane reserves the right to accept or reject modification requests depending on the production stage.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">7. Refund for Cancelled Orders</h3>
                  <p>If a cancellation request is approved before production begins:</p>
                  <ul className="list-unstyled ps-3 mb-4">
                    <li className="mb-2"><strong>Refund Approval:</strong> 2–5 Business Days</li>
                    <li className="mb-2"><strong>Bank/Card Processing:</strong> 5–10 Business Days</li>
                  </ul>
                  <p>
                    Refunds will generally be issued through the original payment method used during purchase.
                  </p>
                  <p>
                    Actual credit timelines may vary depending on banks, payment gateways, and financial institutions.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">8. Cash on Delivery (COD) Orders</h3>
                  <p>COD orders may be cancelled before dispatch.</p>
                  <p>
                    However, repeated cancellation of COD orders may result in restrictions on future COD purchases 
                    at the discretion of Epiclane.
                  </p>
                  <p>
                    Epiclane reserves the right to refuse COD service for customers with a history of repeated order 
                    cancellations or delivery refusals.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">9. Orders Already Shipped</h3>
                  <p>Once an order has been dispatched and handed over to the shipping carrier, it cannot be cancelled.</p>
                  <p>
                    Customers must refer to the Return, Refund & Replacement Policy for assistance after delivery.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">10. Force Majeure</h3>
                  <p>
                    Epiclane shall not be liable for delays, cancellations, or inability to fulfill orders caused by 
                    circumstances beyond our reasonable control, including but not limited to:
                  </p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Natural Disasters, Floods, Fires</li>
                    <li>Government Restrictions, Transportation Disruptions</li>
                    <li>Labor Disputes, Pandemic-Related Restrictions, Technical Failures</li>
                  </ul>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">11. Right to Cancel by Epiclane</h3>
                  <p>Epiclane reserves the right to cancel any order due to:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Product Unavailability, Pricing Errors</li>
                    <li>Suspected Fraudulent Activity, Payment Verification Issues</li>
                    <li>Incorrect Customer Information, Operational Constraints</li>
                  </ul>
                  <p>
                    In such cases, customers will be notified and any eligible refund will be processed accordingly.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">12. Contact Us</h3>
                  <p>For cancellation requests or assistance, please contact:</p>
                  <p>
                    Epiclane Private Limited<br />
                    474, 1st Floor, New GIDC, Katargam, Surat, Gujarat - 395004, India<br /><br />
                    Email: <a href="mailto:contact@epiclane.in" className="text-primary hover:underline">contact@epiclane.in</a><br />
                    Contact Form: <a href="https://www.epiclane.in/contact-us" className="text-primary hover:underline">https://www.epiclane.in/contact-us</a><br />
                    Website: <a href="https://www.epiclane.in" className="text-primary hover:underline">www.epiclane.in</a>
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
