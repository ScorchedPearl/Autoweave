import Features from "../_landingPage/features";
import Header from "../_landingPage/header";
import Footer from "../_landingPage/footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <Features />
      </div>
      <Footer />
    </div>
  );
}
