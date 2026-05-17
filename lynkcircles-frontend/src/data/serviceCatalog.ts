/**
 * Frontend mirror of lynkcircles-backend/lib/serviceCatalog.js.
 *
 * We ship the catalog client-side so pickers render instantly without
 * waiting on /api/v1/services on every dialog open, AND there's a
 * runtime fetch in useServiceCatalog() that overlays any newer entries
 * the server ships before we next deploy. Best of both: instant UI,
 * additive updates without a release.
 */

export interface ServiceEntry {
  key: string;
  label: string;
}

export interface ServiceCategory {
  key: string;
  label: string;
  icon: string;
  services: ServiceEntry[];
}

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    key: "construction",
    label: "Construction & Repair",
    icon: "Hammer",
    services: [
      { key: "carpentry", label: "Carpentry" },
      { key: "plumbing", label: "Plumbing" },
      { key: "electrical", label: "Electrical" },
      { key: "masonry", label: "Masonry & Brickwork" },
      { key: "painting", label: "Painting" },
      { key: "tiling", label: "Tiling & Flooring" },
      { key: "welding", label: "Welding & Fabrication" },
      { key: "roofing", label: "Roofing" },
      { key: "glasswork", label: "Glass & Aluminum" },
      { key: "interior-design", label: "Interior Design" },
    ],
  },
  {
    key: "home-services",
    label: "Home Services",
    icon: "Home",
    services: [
      { key: "cleaning", label: "House Cleaning" },
      { key: "cooking", label: "Cooking" },
      { key: "domestic-help", label: "Domestic Help (full-day)" },
      { key: "childcare", label: "Childcare / Nanny" },
      { key: "eldercare", label: "Eldercare" },
      { key: "gardening", label: "Gardening & Landscaping" },
      { key: "pest-control", label: "Pest Control" },
      { key: "laundry", label: "Laundry & Ironing" },
      { key: "ac-repair", label: "AC & Refrigeration Repair" },
      { key: "appliance-repair", label: "Appliance Repair" },
    ],
  },
  {
    key: "personal",
    label: "Personal Services",
    icon: "Scissors",
    services: [
      { key: "barber", label: "Barber / Salon" },
      { key: "beauty", label: "Beauty & Makeup" },
      { key: "massage", label: "Massage & Wellness" },
      { key: "fitness-trainer", label: "Fitness Trainer" },
      { key: "yoga-instructor", label: "Yoga Instructor" },
      { key: "photography", label: "Photography" },
      { key: "videography", label: "Videography" },
      { key: "event-dj", label: "DJ / Event Music" },
      { key: "decorator", label: "Event Decoration" },
      { key: "catering", label: "Catering" },
    ],
  },
  {
    key: "crafts-production",
    label: "Crafts & Production",
    icon: "Spool",
    services: [
      { key: "tailoring", label: "Tailoring" },
      { key: "embroidery-operator", label: "Embroidery Machine Operator" },
      { key: "sewing-operator", label: "Sewing Machine Operator" },
      { key: "fashion-design", label: "Fashion / Pattern Design" },
      { key: "jewelry-making", label: "Jewelry Making" },
      { key: "pottery", label: "Pottery" },
      { key: "carpentry-furniture", label: "Furniture Making" },
      { key: "metalwork", label: "Metalwork & Smithing" },
    ],
  },
  {
    key: "transport",
    label: "Driving & Transport",
    icon: "Car",
    services: [
      { key: "driver-personal", label: "Personal Driver" },
      { key: "driver-commercial", label: "Commercial Driver (truck/cab)" },
      { key: "delivery", label: "Delivery / Courier" },
      { key: "moving", label: "Moving / Packers" },
    ],
  },
  {
    key: "education",
    label: "Teaching & Tutoring",
    icon: "GraduationCap",
    services: [
      { key: "tutor-school", label: "School Tutor (any subject)" },
      { key: "tutor-language", label: "Language Tutor" },
      { key: "tutor-music", label: "Music Teacher" },
      { key: "tutor-coding", label: "Coding / Tech Tutor" },
      { key: "tutor-test-prep", label: "Test Prep (NEET, JEE, SAT, etc.)" },
    ],
  },
  {
    key: "professional",
    label: "Professional Services",
    icon: "Briefcase",
    services: [
      { key: "accountant", label: "Accountant / Bookkeeper" },
      { key: "legal", label: "Legal Advice" },
      { key: "graphic-design", label: "Graphic Design" },
      { key: "web-development", label: "Web / App Development" },
      { key: "translator", label: "Translator / Interpreter" },
      { key: "marketing", label: "Marketing / Social Media" },
    ],
  },
];

const SERVICE_INDEX = (() => {
  const map = new Map<
    string,
    ServiceEntry & { categoryKey: string; categoryLabel: string }
  >();
  for (const cat of SERVICE_CATALOG) {
    for (const svc of cat.services) {
      map.set(svc.key, {
        ...svc,
        categoryKey: cat.key,
        categoryLabel: cat.label,
      });
    }
  }
  return map;
})();

export const lookupService = (key: string | undefined | null) =>
  key ? SERVICE_INDEX.get(key) ?? null : null;

/** Display-friendly label for a service key. Falls back to the key
 *  itself if the catalog doesn't know it (legacy data). */
export const serviceLabel = (key: string | undefined | null, fallback?: string) =>
  (key && SERVICE_INDEX.get(key)?.label) || fallback || key || "Service";
