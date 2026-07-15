import { Switch, Route, Router as WouterRouter } from "wouter";
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
import TicketPage from "@/pages/TicketPage";
import Restaurants from "@/pages/Restaurants";
import RestaurantPost from "@/pages/RestaurantPost";
import ConsentBanner from "@/components/ConsentBanner";
import ProfileSetup from "@/pages/ProfileSetup";
import AttendeeDirectory from "@/pages/AttendeeDirectory";

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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <ConsentBanner />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
