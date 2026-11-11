// The four services. `kind` matches a screen in components/home/Stage.astro
// ("care" has no screen). `highlights` is the short list shown in the homepage
// rows; `includes` is the full list on /services.
export interface Service {
  id: string;
  kind: "web" | "apps" | "mobile" | "care";
  name: string;
  tag: string;
  forWho: string;
  examples?: string;
  highlights: string[];
  includes: string[];
}

// The single example screen each service shows on narrow layouts and /services.
export const kindScreen = {
  web: "site",
  apps: "tracker",
  mobile: "phone",
} as const;

export const services: Service[] = [
  {
    id: "websites",
    kind: "web",
    name: "Websites",
    tag: "Be found",
    forWho:
      "Local businesses, organizations and individuals who need a site that earns trust and brings in inquiries.",
    highlights: [
      "Design shaped around your business and your customers",
      "Works on any phone, tablet or computer",
      "The groundwork for being found on Google",
    ],
    includes: [
      "Design shaped around your business and your customers",
      "A site that works on any phone, tablet or computer",
      "Accessibility, so everyone can use it",
      "The groundwork for being found on Google",
      "Contact forms that reach your inbox",
      "Domain and hosting setup",
      "A walkthrough at handover",
    ],
  },
  {
    id: "web-apps",
    kind: "apps",
    name: "Web apps and business tools",
    tag: "Daily work",
    forWho:
      "Businesses running on spreadsheets, paper or too many disconnected tools.",
    examples:
      "Booking systems, client portals, internal dashboards, and tools that move information from one system to another.",
    highlights: [
      "Booking systems, client portals, internal dashboards",
      "Working out the process with you before anything is built",
      "Connections to the tools you already use",
    ],
    includes: [
      "Working out the process with you before anything is built",
      "User accounts and secure sign-in",
      "A secure database for your information",
      "Connections to the tools you already use",
      "Hosting and setup",
      "Training for you and your staff",
    ],
  },
  {
    id: "mobile-desktop",
    kind: "mobile",
    name: "Mobile and desktop apps",
    tag: "In your pocket",
    forWho:
      "Businesses whose customers or staff need an app on their phone or computer.",
    highlights: [
      "Planning, design and building the app",
      "Publishing to the App Store and Google Play",
      "Updates after launch",
    ],
    includes: [
      "Planning and design",
      "Building the app",
      "Publishing to the App Store and Google Play",
      "Updates after launch",
    ],
  },
  {
    id: "care-hosting",
    kind: "care",
    name: "Care and hosting",
    tag: "Kept running",
    forWho:
      "Anyone we've built for, and anyone with a site or tool that nobody is looking after.",
    highlights: [
      "Hosting and daily backups",
      "Security updates",
      "Fixes and small changes",
    ],
    includes: [
      "Hosting",
      "Daily backups",
      "Security updates",
      "Fixes and small changes",
      "One point of contact",
    ],
  },
];
