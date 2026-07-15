import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Journal from "@/pages/Journal";
import JournalPost from "@/pages/JournalPost";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import EventsJohannesburg from "@/pages/EventsJohannesburg";
import EventsCapeTown from "@/pages/EventsCapeTown";
import EventsPretoria from "@/pages/EventsPretoria";
import ExperiencePrivateDining from "@/pages/ExperiencePrivateDining";
import ExperienceWineTasting from "@/pages/ExperienceWineTasting";
import ExperienceNetworking from "@/pages/ExperienceNetworking";
import ExperienceLifestyle from "@/pages/ExperienceLifestyle";
import Partnerships from "@/pages/Partnerships";
import Contact from "@/pages/Contact";

import BookingApprove from "@/pages/BookingApprove";
import BookingDecline from "@/pages/BookingDecline";
import RefundForm from "@/pages/RefundForm";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ContactsList from "@/pages/admin/contacts/ContactsList";
import ContactProfile from "@/pages/admin/contacts/ContactProfile";
import EmailCompose from "@/pages/admin/email/EmailCompose";
import EmailHistory from "@/pages/admin/email/EmailHistory";
import { EmailDrafts, EmailTemplates } from "@/pages/admin/email/EmailDraftsTemplates";
import BlogList from "@/pages/admin/blog/BlogList";
import BlogEditor from "@/pages/admin/blog/BlogEditor";
import BlogGenerate from "@/pages/admin/blog/BlogGenerate";
import AdminPlaces from "@/pages/admin/places/AdminPlaces";
import NewPlace from "@/pages/admin/places/NewPlace";
import AdminBookings from "@/pages/admin/bookings/AdminBookings";
import Analytics from "@/pages/admin/analytics/Analytics";
import Settings from "@/pages/admin/settings/Settings";
import AdminAttendance from "@/pages/admin/attendance/AdminAttendance";
import AdminRefunds from "@/pages/admin/refunds/AdminRefunds";
import AdminFinance from "@/pages/admin/finance/AdminFinance";
import TicketPage from "@/pages/TicketPage";
import EmailGenerate from "@/pages/admin/email/EmailGenerate";
import SocialGenerator from "@/pages/admin/social/SocialGenerator";
import Restaurants from "@/pages/Restaurants";
import RestaurantPost from "@/pages/RestaurantPost";
import ConsentBanner from "@/components/ConsentBanner";
import ProfileSetup from "@/pages/ProfileSetup";
import AttendeeDirectory from "@/pages/AttendeeDirectory";
import AdminProfiles from "@/pages/admin/profiles/AdminProfiles";
import AdminEvents from "@/pages/admin/events/AdminEvents";
import AdminEventDetail from "@/pages/admin/events/EventDetail";
import EventProject from "@/pages/admin/events/EventProject";
import ContentEngine from "@/pages/admin/content/ContentEngine";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/restaurants/:slug" component={RestaurantPost} />
      <Route path="/journal" component={Journal} />
      <Route path="/journal/:slug" component={JournalPost} />
      <Route path="/blog" component={Journal} />
      <Route path="/blog/:slug" component={JournalPost} />
      <Route path="/events" component={Events} />
      <Route path="/events/johannesburg" component={EventsJohannesburg} />
      <Route path="/events/cape-town" component={EventsCapeTown} />
      <Route path="/events/pretoria" component={EventsPretoria} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/experiences/private-dining" component={ExperiencePrivateDining} />
      <Route path="/experiences/wine-tasting" component={ExperienceWineTasting} />
      <Route path="/experiences/networking" component={ExperienceNetworking} />
      <Route path="/experiences/lifestyle" component={ExperienceLifestyle} />
      <Route path="/partnerships" component={Partnerships} />
      <Route path="/contact" component={Contact} />
      <Route path="/bookings/approve/:token" component={BookingApprove} />
      <Route path="/bookings/decline/:token" component={BookingDecline} />
      <Route path="/refund/:token" component={RefundForm} />
      <Route path="/ticket/:qrToken" component={TicketPage} />
      <Route path="/profile/setup" component={ProfileSetup} />
      <Route path="/events/:eventId/attendees" component={AttendeeDirectory} />
      <Route path="/login" component={AdminLogin} />

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/contacts" component={ContactsList} />
      <Route path="/admin/contacts/:id" component={ContactProfile} />
      <Route path="/admin/email/compose" component={EmailCompose} />
      <Route path="/admin/email/history" component={EmailHistory} />
      <Route path="/admin/email/drafts" component={EmailDrafts} />
      <Route path="/admin/email/templates" component={EmailTemplates} />
      <Route path="/admin/email" component={EmailHistory} />
      <Route path="/admin/blog/generate" component={BlogGenerate} />
      <Route path="/admin/blog/new" component={() => <BlogEditor />} />
      <Route path="/admin/blog/:id/edit" component={BlogEditor} />
      <Route path="/admin/blog" component={BlogList} />
      <Route path="/admin/places/new" component={NewPlace} />
      <Route path="/admin/places" component={AdminPlaces} />
      <Route path="/admin/email/generate" component={EmailGenerate} />
      <Route path="/admin/social" component={SocialGenerator} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/attendance" component={AdminAttendance} />
      <Route path="/admin/refunds" component={AdminRefunds} />
      <Route path="/admin/finance" component={AdminFinance} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/settings" component={Settings} />
      <Route path="/admin/profiles" component={AdminProfiles} />
      <Route path="/admin/content-engine/:tab?" component={ContentEngine} />
      <Route path="/admin/events/project/:id" component={EventProject} />
      <Route path="/admin/events/:eventTitle" component={AdminEventDetail} />
      <Route path="/admin/events" component={AdminEvents} />

      <Route component={NotFound} />
    </Switch>
  );
}

function ConsentBannerWrapper() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <ConsentBanner />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <ConsentBannerWrapper />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
