import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SignupModal from "./components/SignupModal";
import LoginModal from "./components/LoginModal";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import PDFViewer from "./components/PDFViewer";
import AccountDetails from "./components/AccountDetails";
import Profile from "./components/Profile";
import OurTeam from "./components/OurTeam";
import TeamPage from "./components/TeamPage";
import AboutUs from "./components/AboutUs";
import HomeEventsPage from "./components/HomeEventsPage";
import EventDetailPage from "./components/EventDetailPage";
import EventPage from "./components/EventPage";
import { useModal } from "./hooks/useModal";
import { ToastProvider, useToast } from "./components/ToastContext"; // Import ToastProvider
import "./styles/locomotive.css";
import MemberProfile from "./components/MemberProfile";

interface MyJwtPayload {
  id: number;
  email: string;
  role: "admin" | "user";
  name: string;
  iat?: number;
  exp?: number;
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showInfo, showError } = useToast(); // Use toast hook

  const { isOpen, openModal, closeModal } = useModal();
  const loginModal = useModal();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top whenever the location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          throw new Error("Token expired");
        }
        setUser({
          email: decoded.email,
          role: decoded.role,
          name: decoded.name || "",
        });
      } catch (err) {
        console.error("Invalid or expired token", err);
        localStorage.removeItem("token");
        setUser(null);
        // Show error toast instead of console log
        showError("Session expired. Please log in again.");
      }
    }
    setIsLoading(false);
  }, [showError]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    // Show info toast instead of alert
    showInfo("You have been logged out successfully.");
  };

  const [pdfViewer, setPdfViewer] = useState({
    isOpen: false,
    url: "",
    title: "",
    type: "newspaper" as "newspaper" | "question" | "tkmce_news",
  });

  const isAdmin = user?.role === "admin";
  const isHomePage = location.pathname === "/";
  const isDashboardPage = location.pathname === "/dashboard";
  const isAdminPage = location.pathname === "/admin";
  const isEventPage = location.pathname.startsWith("/event/");
  const isEventsListPage = location.pathname === "/events";
  const isDashboardEventPage =
    location.pathname.startsWith("/dashboard/event/");
  const isAboutUsPage = location.pathname === "/aboutus";
  const isMemberProfilePage = location.pathname.startsWith("/team/");

  const handleLogin = (credentials: {
    email: string;
    role: "admin" | "user";
    name: string;
  }) => {
    setUser({
      email: credentials.email,
      role: credentials.role,
      name: credentials.name,
    });
    loginModal.closeModal();

    // Show success toast
    showSuccess(`Welcome back, ${credentials.name}!`);

    if (credentials.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleOpenPDF = (
    url: string,
    title: string,
    type: "newspaper" | "question" | "tkmce_news",
  ) => {
    setPdfViewer({ isOpen: true, url, title, type });
  };

  const handleClosePDF = () => {
    setPdfViewer((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-lexend">
      {/* Home Page */}
      {isHomePage && (
        <div className="bg-dark-bg text-white">
          <Header
            onSignupClick={openModal}
            onLoginClick={loginModal.openModal}
            user={user}
            onDashboardClick={() => navigate("/dashboard")}
          />
          <Hero onSignupClick={openModal} />
          <About />
          <OurTeam />
          <Contact />
          <Footer />
          <SignupModal isOpen={isOpen} onClose={closeModal} />
          <LoginModal
            onSignupClick={openModal}
            isOpen={loginModal.isOpen}
            onClose={loginModal.closeModal}
            onLogin={handleLogin}
          />
        </div>
      )}

      {/* About Us Page */}
      {isAboutUsPage && <AboutUs />}

      {/* Events List Page */}
      {isEventsListPage && (
        <div>
          <HomeEventsPage user={user} onLoginClick={loginModal.openModal} />
          <LoginModal
            onSignupClick={openModal}
            isOpen={loginModal.isOpen}
            onClose={loginModal.closeModal}
            onLogin={handleLogin}
          />
          <SignupModal isOpen={isOpen} onClose={closeModal} />
        </div>
      )}

      {/* Event Detail Page (from Home) */}
      {isEventPage && !isDashboardEventPage && (
        <div>
          <EventDetailPage onLoginClick={loginModal.openModal} user={user} />
          <LoginModal
            onSignupClick={openModal}
            isOpen={loginModal.isOpen}
            onClose={loginModal.closeModal}
            onLogin={handleLogin}
          />
          <SignupModal isOpen={isOpen} onClose={closeModal} />
        </div>
      )}

      {/* Dashboard */}
      {isDashboardPage && user && (
        <Dashboard
          user={user}
          onOpenPDF={handleOpenPDF}
          onLogout={handleLogout}
        />
      )}

      {/* Dashboard Event Page */}
      {isDashboardEventPage && user && (
        <EventPage user={user} onLogout={handleLogout} />
      )}

      {/* Admin */}
      {isAdminPage && user && isAdmin && <AdminPanel onLogout={handleLogout} />}

      {/* Account Details */}
      {location.pathname === "/account" && user && (
        <AccountDetails user={user} onLogout={handleLogout} />
      )}
      {location.pathname === "/account" && !user && <Navigate to="/" replace />}

      {/* Profile */}
      {location.pathname === "/profile" && user && (
        <Profile user={user} onLogout={handleLogout} />
      )}
      {location.pathname === "/profile" && !user && <Navigate to="/" replace />}

      {/* Team Page Layout */}
      {location.pathname === "/team" && <TeamPage />}

      {/* Member Profile Page */}
      {isMemberProfilePage && <MemberProfile />}

      {/* Protected Route Redirects */}
      {isDashboardPage && !user && <Navigate to="/" replace />}
      {isAdminPage && (!user || !isAdmin) && (
        <Navigate to={user ? "/dashboard" : "/"} replace />
      )}

      {/* Global PDF Viewer */}
      <PDFViewer
        isOpen={pdfViewer.isOpen}
        onClose={handleClosePDF}
        pdfUrl={pdfViewer.url}
        title={pdfViewer.title}
        type={pdfViewer.type}
      />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      {" "}
      {/* Wrap the entire app with ToastProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/aboutus" element={<AppContent />} />
          <Route path="/events" element={<AppContent />} />
          <Route path="/dashboard" element={<AppContent />} />
          <Route path="/dashboard/event/:id" element={<AppContent />} />
          <Route path="/admin" element={<AppContent />} />
          <Route path="/account" element={<AppContent />} />
          <Route path="/profile" element={<AppContent />} />
          <Route path="/event/:id" element={<AppContent />} />
          <Route path="/team" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/team/:admissionNo" element={<AppContent />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
