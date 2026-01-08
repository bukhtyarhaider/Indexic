export type TagCategory =
  | "Domain"
  | "Platform"
  | "Style"
  | "Feature"
  | "Technology"
  | "Other";

interface TagDefinition {
  canonical: string;
  category: TagCategory;
  aliases: string[];
}

export const TAG_DEFINITIONS: TagDefinition[] = [
  // DOMAINS
  {
    canonical: "E-commerce",
    category: "Domain",
    aliases: [
      "ecommerce",
      "e-commerce",
      "online store",
      "shop",
      "retail",
      "marketplace",
      "b2c",
      "b2b",
      "luxury retail",
      "luxury shop",
      "mobile commerce",
      "frictionless checkout",
      "conversion optimization",
      "conversion rate optimization",
      "bidding platform",
    ],
  },
  {
    canonical: "FinTech",
    category: "Domain",
    aliases: [
      "fintech",
      "finance",
      "banking",
      "crypto",
      "cryptocurrency",
      "wallet",
      "payments",
      "digital banking",
      "trading interface",
      "crypto design",
      "digital assets",
      "nft marketplace",
    ],
  },
  {
    canonical: "Healthcare",
    category: "Domain",
    aliases: [
      "healthcare",
      "health",
      "medical",
      "medicine",
      "doctor",
      "hospital",
      "telehealth",
      "healthtech",
      "medical software",
      "medical tech",
      "patient portal",
      "telemedicine",
    ],
  },
  {
    canonical: "Education",
    category: "Domain",
    aliases: [
      "education",
      "edtech",
      "e-learning",
      "elearning",
      "learning",
      "school",
      "university",
      "lms",
      "educational software",
    ],
  },
  {
    canonical: "Real Estate",
    category: "Domain",
    aliases: ["real estate", "property", "housing", "realtor", "proptech"],
  },
  {
    canonical: "Social Media",
    category: "Domain",
    aliases: [
      "social",
      "social network",
      "community",
      "chat",
      "messaging",
      "social impact",
    ],
  },
  {
    canonical: "SaaS",
    category: "Domain",
    aliases: [
      "saas",
      "software as a service",
      "subscription",
      "saas app",
      "saas design",
      "saas ui",
      "enterprise software",
    ],
  },
  {
    canonical: "Travel",
    category: "Domain",
    aliases: [
      "travel",
      "tourism",
      "booking",
      "flight",
      "hotel",
      "travel & hospitality",
      "travel hospitality",
      "ride booking app",
      "ride-sharing",
    ],
  },
  {
    canonical: "Food & Beverage",
    category: "Domain",
    aliases: [
      "food",
      "beverage",
      "restaurant",
      "delivery",
      "dining",
      "food & beverages",
    ],
  },
  {
    canonical: "Entertainment",
    category: "Domain",
    aliases: [
      "entertainment",
      "entertainment ux",
      "online ticketing system",
      "ticketing system",
    ],
  },
  {
    canonical: "Fitness",
    category: "Domain",
    aliases: ["fitness", "fitness & wellness", "fitness tech"],
  },
  {
    canonical: "Automotive",
    category: "Domain",
    aliases: ["automotive", "automotive web design"],
  },
  {
    canonical: "Non-Profit",
    category: "Domain",
    aliases: ["non-profit", "charity app", "social impact"],
  },

  // PLATFORMS
  {
    canonical: "Web",
    category: "Platform",
    aliases: [
      "website",
      "web app",
      "webapp",
      "browser",
      "web application",
      "web design",
      "web platform",
      "responsive design",
      "responsive web",
      "responsive web design",
    ],
  },
  {
    canonical: "Mobile",
    category: "Platform",
    aliases: [
      "mobile app",
      "ios",
      "android",
      "phone",
      "smartphone",
      "mobile design",
      "mobile ui/ux",
      "mobile app design",
      "mobile development",
      "mobile-first",
      "mobile ux/ui",
    ],
  },
  {
    canonical: "Desktop",
    category: "Platform",
    aliases: [
      "desktop app",
      "windows",
      "macos",
      "linux",
      "desktop design",
      "desktop ui",
      "desktop application",
      "desktop experience",
      "desktop interface",
    ],
  },
  {
    canonical: "Cross-Platform",
    category: "Platform",
    aliases: ["cross platform", "hybrid", "flutter", "react native"],
  },

  // UX/UI & DESIGN DISCIPLINES
  {
    canonical: "UX/UI Design",
    category: "Style",
    aliases: [
      "ux/ui",
      "ui/ux",
      "ui/ux design",
      "ux design",
      "ui design",
      "user interface",
      "user experience",
      "user experience (ux)",
      "user interface (ui)",
      "visual design",
      "visual interface",
      "product design",
      "interaction design",
      "interactive design",
      "user centric",
      "user-centric design",
      "user engagement",
      "modern ux",
      "modern ui",
      "intuitive design",
      "intuitive navigation",
    ],
  },
  {
    canonical: "User Research",
    category: "Feature",
    aliases: [
      "user research",
      "product discovery",
      "product strategy",
      "information architecture",
    ],
  },
  {
    canonical: "Prototyping",
    category: "Feature",
    aliases: [
      "prototyping",
      "interactive prototyping",
      "interface prototyping",
    ],
  },
  {
    canonical: "Graphic Design",
    category: "Style",
    aliases: [
      "graphic design tool",
      "image editor",
      "photo editing",
      "high-resolution export",
      "visual identity",
      "branding",
      "digital branding",
    ],
  },
  {
    canonical: "Illustration",
    category: "Style",
    aliases: [
      "illustration",
      "doodles and line art illustrations",
      "line art",
      "generative art",
      "ai graphics",
    ],
  },

  // STYLES
  {
    canonical: "Minimalist",
    category: "Style",
    aliases: ["minimal", "clean", "simple", "minimalism", "minimalist design"],
  },
  {
    canonical: "Dark Mode",
    category: "Style",
    aliases: ["dark", "dark theme", "night mode"],
  },
  {
    canonical: "Neubrutalism",
    category: "Style",
    aliases: ["neo-brutalism", "neubrutalism", "brutalist"],
  },
  {
    canonical: "Neumorphism",
    category: "Style",
    aliases: ["neumorphism", "soft ui", "neuomorphism", "neuomorphism design"],
  },
  {
    canonical: "Glassmorphism",
    category: "Style",
    aliases: ["glassmorphism", "glass"],
  },
  {
    canonical: "Corporate",
    category: "Style",
    aliases: ["professional", "business", "enterprise", "elegant design"],
  },
  {
    canonical: "Playful",
    category: "Style",
    aliases: [
      "fun",
      "colorful",
      "vibrant",
      "vibrant aesthetic",
      "fluorescent aesthetic",
      "vibrant fluorescent colors",
      "gen z aesthetic",
      "gen z graphic design",
    ],
  },
  {
    canonical: "Modern",
    category: "Style",
    aliases: ["modern", "modern aesthetic"],
  },
  {
    canonical: "High-Contrast",
    category: "Style",
    aliases: ["high-contrast", "high-contrast ui"],
  },

  // FEATURES
  {
    canonical: "Dashboard",
    category: "Feature",
    aliases: [
      "admin",
      "analytics",
      "charts",
      "data visualization",
      "admin panel",
      "dashboard design",
    ],
  },
  {
    canonical: "Landing Page",
    category: "Feature",
    aliases: ["landing", "hero", "home page"],
  },
  {
    canonical: "Authentication",
    category: "Feature",
    aliases: ["auth", "login", "signup", "sign in", "sign up", "user accounts"],
  },
  {
    canonical: "Search",
    category: "Feature",
    aliases: ["filtering", "search bar"],
  },
  {
    canonical: "Motion Design",
    category: "Feature",
    aliases: [
      "motion design",
      "motion graphics",
      "micro-animations",
      "scrolling animations",
    ],
  },
  {
    canonical: "Weather",
    category: "Feature",
    aliases: ["weather forecasting"],
  },
  {
    canonical: "Customization",
    category: "Feature",
    aliases: ["customization"],
  },
  {
    canonical: "Accessibility",
    category: "Feature",
    aliases: ["accessibility"],
  },

  // TECHNOLOGY
  {
    canonical: "React",
    category: "Technology",
    aliases: ["reactjs", "react.js"],
  },
  {
    canonical: "TypeScript",
    category: "Technology",
    aliases: ["ts", "type script"],
  },
  { canonical: "Next.js", category: "Technology", aliases: ["nextjs", "next"] },
  {
    canonical: "Tailwind CSS",
    category: "Technology",
    aliases: ["tailwind", "tailwindcss"],
  },
  { canonical: "Supabase", category: "Technology", aliases: ["supabase"] },
  { canonical: "Node.js", category: "Technology", aliases: ["node", "nodejs"] },
  {
    canonical: "PostgreSQL",
    category: "Technology",
    aliases: ["postgres", "sql"],
  },
  { canonical: "GraphQL", category: "Technology", aliases: ["graphql"] },
];

/**
 * Normalizes a single tag to its canonical form.
 * If no match is found, returns the original tag formatted (Title Case).
 */
export const normalizeTag = (tag: string): string => {
  const lowerTag = tag.trim().toLowerCase();

  // 1. Exact alias match
  for (const def of TAG_DEFINITIONS) {
    if (
      def.canonical.toLowerCase() === lowerTag ||
      def.aliases.includes(lowerTag)
    ) {
      return def.canonical;
    }
  }

  // 2. Partial match (optional, but good for "Mobile App" -> "Mobile")
  // For now, let's stick to explicit aliases to avoid over-aggressive matching.

  // 3. Fallback: Format neatly (Capitalize words)
  return tag
    .trim()
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

/**
 * Normalizes an array of tags, removing duplicates.
 */
export const normalizeTags = (tags: string[]): string[] => {
  const normalized = tags.map(normalizeTag);
  return Array.from(new Set(normalized));
};

/**
 * Get the category for a given canonical tag.
 */
export const getTagCategory = (tag: string): TagCategory => {
  const def = TAG_DEFINITIONS.find((d) => d.canonical === tag);
  return def ? def.category : "Other";
};

/**
 * Get all canonical tags for a specific category.
 */
export const getTagsByCategory = (category: TagCategory): string[] => {
  return TAG_DEFINITIONS.filter((d) => d.category === category).map(
    (d) => d.canonical
  );
};
