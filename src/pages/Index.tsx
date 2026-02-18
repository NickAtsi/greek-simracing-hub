import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveRacesSection from "@/components/LiveRacesSection";
import GamesHubSection from "@/components/GamesHubSection";
import PodcastsSection from "@/components/PodcastsSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LiveRacesSection />
      <GamesHubSection />
      <PodcastsSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Index;
