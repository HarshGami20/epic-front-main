import CommanLayout from "@/components/CommanLayout";
import ContactUs from "./_components/ContactUs";

export const metadata = {
  title: "Contact Us – Epiclance",
  description:
    "Get in touch with Epiclance for custom gifts, orders, and support. Send us a message and our team will respond soon.",
};

export default function ContactUsPage() {
  return (
    <CommanLayout>
      <ContactUs />
    </CommanLayout>
  );
}
