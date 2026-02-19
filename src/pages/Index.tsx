import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveRacesSection from "@/components/LiveRacesSection";
import GamesHubSection from "@/components/GamesHubSection";
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
      <LiveRacesSection />
      <GamesHubSection />
      <PodcastsSection />
      <CommunitySection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
