// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import TokenizationPage from "@/pages/TokenizationPage";
import BusinessesPage from "@/pages/BusinessesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage"; // Add this import
import AboutPage from "@/pages/settings/AboutPage";
import ContactPage from "@/pages/settings/ContactPage";
import FeedbackPage from "@/pages/settings/FeedbackPage";
import HelpPage from "@/pages/settings/HelpPage";
import CurrencyPage from "@/pages/settings/CurrencyPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/users" element={<UsersPage />} />
          <Route path="/dashboard/tokenization" element={<TokenizationPage />} />
          <Route path="/dashboard/businesses" element={<BusinessesPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} /> {/* Add this route */}
          <Route path="/dashboard/settings/about" element={<AboutPage />} />
          <Route path="/dashboard/settings/contact" element={<ContactPage />} />
          <Route path="/dashboard/settings/feedback" element={<FeedbackPage />} />
          <Route path="/dashboard/settings/help" element={<HelpPage />} />
          <Route path="/dashboard/settings/currency" element={<CurrencyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;