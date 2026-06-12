import CommanLayout from "@/components/CommanLayout";

export const metadata = {
  title: "Shipping Policy – Epiclance",
  description: "Read our shipping policy, domestic and international shipping estimates, order processing timelines, and tracking information.",
};

export default function ShippingPolicyPage() {
  return (
    <CommanLayout>
      <div className="page-content bg-light">
        <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
          <div className="container">
            <div className="dz-bnr-inr-entry">
              <div className="row align-items-center">
                <div className="col-lg-12">
                  <div className="text-start mb-xl-0 mb-4">
                    <h1 className="mb-2">Shipping Policy</h1>
                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                      <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                          <a href="/">Home</a>
                        </li>
                        <li className="breadcrumb-item">Shipping Policy</li>
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
                    At Epiclane Private Limited, we strive to deliver your orders safely and on time. This Shipping 
                    Policy explains our order processing timelines, shipping methods, delivery estimates, and 
                    important shipping-related information.
                  </p>
                  <p className="mb-5 text-muted">
                    By placing an order on our website, you agree to the terms outlined below.
                  </p>

                  <hr className="my-4" />

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">1. Company Information</h3>
                  <p>
                    Epiclane Private Limited<br />
                    474, 1st Floor, New GIDC, Katargam, Surat, Gujarat - 395004, India<br /><br />
                    Website: <a href="https://www.epiclane.in" className="text-primary hover:underline">www.epiclane.in</a><br />
                    Email: <a href="mailto:contact@epiclane.in" className="text-primary hover:underline">contact@epiclane.in</a><br />
                    Contact form: <a href="https://www.epiclane.in/contact-us" className="text-primary hover:underline">https://www.epiclane.in/contact-us</a>
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">2. Order Processing</h3>
                  <p>Most orders are processed within 1 business day after payment confirmation.</p>
                  <p>
                    For customized and personalized products, production may begin immediately after receiving the 
                    required customization details and artwork approvals, if applicable.
                  </p>
                  <p>
                    Orders placed on weekends, public holidays, or outside business hours may be processed on the next working day.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">3. Domestic Shipping (India)</h3>
                  <p>We deliver across India through trusted courier partners.</p>
                  <ul className="list-unstyled ps-3 mb-4">
                    <li className="mb-2"><strong>Estimated Delivery Time:</strong> Standard Delivery: 2–9 Business Days (Remote locations may require additional delivery time).</li>
                    <li className="mb-2"><strong>Shipping Charges:</strong> Prepaid Orders: Free Shipping. Cash on Delivery (COD): Additional charges may apply and will be displayed during checkout.</li>
                  </ul>
                  <p>
                    Delivery timelines are estimates and may vary due to weather conditions, courier delays, public holidays, natural disasters, or other circumstances beyond our control.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">4. International Shipping</h3>
                  <p>We ship selected products internationally.</p>
                  <ul className="list-unstyled ps-3 mb-4">
                    <li className="mb-2"><strong>Estimated Delivery Time:</strong> 10–20 Business Days</li>
                    <li className="mb-2"><strong>Shipping Charges:</strong> Calculated separately and vary based on Destination Country, Product Weight, Package Dimensions, and Shipping Method.</li>
                  </ul>
                  <p><strong>Customs &amp; Import Duties:</strong></p>
                  <p>
                    International customers are responsible for any customs duties, import taxes, VAT, handling charges, 
                    or other fees imposed by their country&apos;s customs authorities.
                  </p>
                  <p>Epiclane is not responsible for delays caused by customs clearance procedures.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">5. Courier Partners</h3>
                  <p>Orders may be shipped through:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>DTDC, Blue Dart</li>
                    <li>Amazon Shipping, India Post</li>
                    <li>Other approved logistics partners</li>
                  </ul>
                  <p>
                    The shipping carrier is selected based on service availability, delivery location, and operational requirements.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">6. Order Tracking</h3>
                  <p>Once your order has been dispatched, tracking details may be provided via:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Email, SMS, WhatsApp</li>
                    <li>Customer Support</li>
                  </ul>
                  <p>
                    Tracking updates are generated by the shipping carrier and may occasionally take time to appear in their system.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">7. Delivery Address Accuracy</h3>
                  <p>Customers are responsible for providing complete and accurate shipping information.</p>
                  <p>Please verify:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Recipient Name, Mobile Number</li>
                    <li>House/Flat Number, Street Address</li>
                    <li>City, State, Postal Code, Country</li>
                  </ul>
                  <p>
                    Epiclane shall not be responsible for delays, failed deliveries, or additional charges resulting from 
                    incorrect or incomplete shipping information provided by the customer.
                  </p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">8. Delivery Delays</h3>
                  <p>While we aim to meet estimated delivery timelines, delays may occur due to:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Weather Conditions, Transportation Disruptions, Public Holidays</li>
                    <li>Customs Clearance, Courier Operational Issues, High Seasonal Demand</li>
                    <li>Natural Disasters, Government Restrictions</li>
                  </ul>
                  <p>Such delays are beyond our control and do not automatically qualify for refunds or cancellations.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">9. Damaged, Broken, or Partially Damaged Shipments</h3>
                  <p>
                    We take great care in packaging every order. However, if a shipment arrives damaged, broken, 
                    defective, or partially damaged during transit:
                  </p>
                  <p><strong>Required Documentation:</strong> Customers must:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Contact us within 7 days of delivery</li>
                    <li>Provide a complete and uninterrupted unboxing video</li>
                    <li>Share photographs of the product and packaging if requested</li>
                    <li>Retain original packaging materials until the claim is resolved</li>
                  </ul>
                  <p><strong>Resolution Process:</strong> After verification, Epiclane may, at its sole discretion:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Provide a replacement product</li>
                    <li>Repair the product where applicable</li>
                    <li>Issue a partial or full refund</li>
                  </ul>
                  <p><strong>Replacement Timeline:</strong> Replacement orders generally require:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>3–5 Business Days for processing and manufacturing</li>
                    <li>Up to 15 Days for delivery within India depending on location</li>
                  </ul>
                  <p>Claims submitted without an unboxing video may not be eligible for replacement or refund.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">10. Failed Delivery Attempts</h3>
                  <p>If delivery cannot be completed due to:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Customer unavailability, Incorrect address</li>
                    <li>Refusal to accept delivery, Failure to respond to courier communication</li>
                  </ul>
                  <p>The shipment may be returned to us. Additional shipping charges may apply for re-dispatching the order.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">11. Customized and Personalized Products</h3>
                  <p>
                    Since many Epiclane products are personalized according to customer specifications, production 
                    may begin shortly after order confirmation.
                  </p>
                  <p>Customers are encouraged to carefully review all submitted:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Names, Spellings, Logos</li>
                    <li>Photographs, Messages, Customization Instructions</li>
                  </ul>
                  <p>Epiclane is not responsible for errors resulting from incorrect information provided by the customer.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">12. Shipping Restrictions</h3>
                  <p>Certain products may be restricted from shipping to specific countries or regions due to:</p>
                  <ul className="list-bullet ps-3 mb-4">
                    <li>Local regulations, Import restrictions</li>
                    <li>Courier limitations, Product-specific restrictions</li>
                  </ul>
                  <p>Epiclane reserves the right to refuse shipment where delivery is not feasible.</p>

                  <h3 className="h5 fw-bold text-dark mt-4 mb-3">13. Contact Us</h3>
                  <p>For shipping-related questions or assistance, please contact:</p>
                  <p>
                    Epiclane Private Limited<br />
                    474, 1st Floor, New GIDC, Katargam, Surat, Gujarat - 395004, India<br /><br />
                    Email: <a href="mailto:contact@epiclane.in" className="text-primary hover:underline">contact@epiclane.in</a><br />
                    Website: <a href="https://www.epiclane.in/contact-us" className="text-primary hover:underline">https://www.epiclane.in/contact-us</a>
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
