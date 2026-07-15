import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
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
import EmailGenerate from "@/pages/admin/email/EmailGenerate";
import SocialGenerator from "@/pages/admin/social/SocialGenerator";
import AdminProfiles from "@/pages/admin/profiles/AdminProfiles";
import AdminEvents from "@/pages/admin/events/AdminEvents";
import AdminEventDetail from "@/pages/admin/events/EventDetail";
import EventProject from "@/pages/admin/events/EventProject";
import ContentEngine from "@/pages/admin/content/ContentEngine";

const queryClient = new QueryClient();

// Route paths are unchanged from the combined app (still "/admin/...") so none of the
// internal <Link>/navigate calls in these pages, or the "/api/admin/..." fetch calls,
// needed to change when this became its own bundle/deployment.
function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/admin" />} />
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

function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default AdminApp;
