/**
 * The canonical service catalog. Workers pick from this list when
 * adding a WorkDetail; Clients pick from it when posting a job. This
 * is what makes skill-matching possible — without a controlled
 * vocabulary, "carpenter" / "Carpentry" / "wood worker" are three
 * different strings and no algorithm can match a job to a worker.
 *
 * Keep this in sync with lynkcircles-frontend/src/data/serviceCatalog.ts.
 * (When we outgrow this, migrate to a `services` collection with admin
 * tooling — but a static catalog ships an order of magnitude faster
 * and lets us iterate copy/categories without DB migrations.)
 *
 * Structure:
 *   category.key       — slug used in API
 *   category.label     — human display (English; i18n later)
 *   category.icon      — lucide icon name (FE renders by name)
 *   services[].key     — slug stored on WorkDetail.serviceKey
 *   services[].label   — human display
 *
 * India-first lens: bias toward services common in Indian neighborhoods
 * (embroidery operator, domestic help, tailoring) without excluding US/
 * global trades. The catalog is meant to be additive; never remove a
 * key once shipped (existing data references it).
 */

export const SERVICE_CATALOG = [
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

/** Map service slug -> { label, categoryKey, categoryLabel }. */
const SERVICE_INDEX = (() => {
  const map = new Map();
  for (const cat of SERVICE_CATALOG) {
    for (const svc of cat.services) {
      map.set(svc.key, {
        key: svc.key,
        label: svc.label,
        categoryKey: cat.key,
        categoryLabel: cat.label,
      });
    }
  }
  return map;
})();

export const isValidServiceKey = (key) => SERVICE_INDEX.has(key);
export const lookupService = (key) => SERVICE_INDEX.get(key) ?? null;
export const allServiceKeys = () => Array.from(SERVICE_INDEX.keys());
