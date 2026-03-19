import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Intro from "./pages/Intro";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import GamesHub from "./pages/GamesHub";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Articles from "./pages/Articles";
import ArticleView from "./pages/ArticleView";
import Forum from "./pages/Forum";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Podcasts from "./pages/Podcasts";
import Shop from "./pages/Shop";
import Members from "./pages/Members";
import Championships from "./pages/Championships";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/home" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/games-hub" element={<GamesHub />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleView />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/category/:categoryId" element={<Forum />} />
            <Route path="/forum/thread/:threadId" element={<Forum />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/members" element={<Members />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

