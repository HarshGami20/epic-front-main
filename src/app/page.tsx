import { Metadata } from "next";
import HomePage from "./(pages)/(home)/home/page";

export const metadata: Metadata = {
  title: "Epiclance Custom Gifts – Personalized Products & Unique Gift Items Online",
  description: "Create memorable moments with Epiclance customized gifts. Design personalized mugs, t-shirts, photo frames, and special gift items for loved ones, events, and corporate gifting.",
};

export default function Home() {
  return (
    <div >
      <main>
        <HomePage />
      </main>

    </div>
  );
}
