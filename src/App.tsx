import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

// Lazy-loaded pages for better performance
const Intro = lazy(() => import("./pages/Intro"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const GamesHub = lazy(() => import("./pages/GamesHub"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleView = lazy(() => import("./pages/ArticleView"));
const Forum = lazy(() => import("./pages/Forum"));
const Admin = lazy(() => import("./pages/Admin"));
const Contact = lazy(() => import("./pages/Contact"));
const Support = lazy(() => import("./pages/Support"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Podcasts = lazy(() => import("./pages/Podcasts"));
const Shop = lazy(() => import("./pages/Shop"));
const Members = lazy(() => import("./pages/Members"));
const Championships = lazy(() => import("./pages/Championships"));
const Notifications = lazy(() => import("./pages/Notifications"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
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
              <Route path="/championships" element={<Championships />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
