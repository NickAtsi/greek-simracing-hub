import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PodcastsSection from "@/components/PodcastsSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import ReactiveBackground from "@/components/ReactiveBackground";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ReactiveBackground />
      <Navbar />
      <HeroSection />
      <PodcastsSection />
      <CommunitySection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
