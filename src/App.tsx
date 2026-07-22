import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./lib/store";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import AppShell from "./components/AppShell";
import HealthCheckPage from "./pages/HealthCheckPage";
import ToastStack from "./components/ToastStack";
import { Loader2 } from "lucide-react";

const FeedPage = lazy(() => import("./pages/FeedPage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const WritingStudioPage = lazy(() => import("./pages/WritingStudioPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage"));
const AudioPlayerPage = lazy(() => import("./pages/AudioPlayerPage"));
const ReaderPage = lazy(() => import("./pages/ReaderPage"));
const ReelsPage = lazy(() => import("./pages/ReelsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const GlobalLiteraryMapPage = lazy(() => import("./pages/GlobalLiteraryMapPage"));
const PhoneVerificationPage = lazy(() => import("./pages/PhoneVerificationPage"));

function PageLoader() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
}

function ProtectedRoutes() {
  const { user, loading } = useApp();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-400">Loading InkReal...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/verify-phone" element={<PhoneVerificationPage />} />
          <Route path="/healthz" element={<HealthCheckPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/feed" element={<Suspense fallback={<PageLoader />}><FeedPage /></Suspense>} />
            <Route path="/discover" element={<Suspense fallback={<PageLoader />}><DiscoverPage /></Suspense>} />
            <Route path="/reels" element={<Suspense fallback={<PageLoader />}><ReelsPage /></Suspense>} />
            <Route path="/library" element={<Suspense fallback={<PageLoader />}><LibraryPage /></Suspense>} />
            <Route path="/write" element={<Suspense fallback={<PageLoader />}><WritingStudioPage /></Suspense>} />
            <Route path="/marketplace" element={<Suspense fallback={<PageLoader />}><MarketplacePage /></Suspense>} />
            <Route path="/audio" element={<Suspense fallback={<PageLoader />}><AudioPlayerPage /></Suspense>} />
            <Route path="/communities" element={<Suspense fallback={<PageLoader />}><CommunitiesPage /></Suspense>} />
            <Route path="/messages" element={<Suspense fallback={<PageLoader />}><MessagingPage /></Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
            <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
            <Route path="/read/:bookId" element={<Suspense fallback={<PageLoader />}><ReaderPage /></Suspense>} />
            <Route path="/read" element={<Suspense fallback={<PageLoader />}><ReaderPage /></Suspense>} />
            <Route path="/map" element={<Suspense fallback={<PageLoader />}><GlobalLiteraryMapPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastStack />
      </BrowserRouter>
    </AppProvider>
  );
}
