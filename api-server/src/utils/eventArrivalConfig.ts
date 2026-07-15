export interface ArrivalScheduleItem {
  time: string;
  label: string;
}

export interface ArrivalProtocolItem {
  icon: string;
  title: string;
  detail: string;
}

export interface EventArrivalDetails {
  subjectPrefix: string;
  venueDisplayName: string;
  venueFullAddress: string;
  mapUrl: string;
  schedule: ArrivalScheduleItem[];
  protocol: ArrivalProtocolItem[];
  dressCodeNote?: string;
  closingNote?: string;
}

const config: Record<string, EventArrivalDetails> = {
  "devil-wears-prada-screening-apr-2026": {
    subjectPrefix: "📍 Egrek Cinema, Parkhurst",
    venueDisplayName: "Egrek Cinema",
    venueFullAddress:
      "First Floor, Parkhurst Square, 38 4th Ave, Parkhurst, Randburg, 2193",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Egrek+Cinema%2C+Parkhurst+Square%2C+38+4th+Ave%2C+Parkhurst%2C+Randburg%2C+2193",
    schedule: [
      { time: "17:30", label: "Arrival & Bubbly Reception" },
      { time: "18:30", label: "Screening Commences" },
      { time: "20:30", label: "Food, Networking & Drinks" },
    ],
    protocol: [
      {
        icon: "🚗",
        title: "Transport",
        detail:
          "To ensure a seamless entry, we recommend using a ride-share service (Uber/Bolt). Please set your drop-off point to the main gate.",
      },
      {
        icon: "🎟️",
        title: "Entry",
        detail:
          "Present your name to the security lead at the entrance for guest list verification.",
      },
      {
        icon: "👗",
        title: "The Look",
        detail:
          'Our media team is ready for your most compelling "Fashion Editorial" attire.',
      },
    ],
    dressCodeNote: "Fashion Editorial",
    closingNote: "We can't wait to see the vision you bring to the room.",
  },
};

export function getEventArrivalDetails(
  eventId: string
): EventArrivalDetails | null {
  return config[eventId] ?? null;
}
