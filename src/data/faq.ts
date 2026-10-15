import { site } from "./site";

/**
 * The live site lists six FAQ questions but its answers were not retrievable, so answers here
 * only state facts published elsewhere on the site. Anything unpublished points to the team.
 */
export const faqs = [
  {
    q: "What types of gaming consoles do you repair?",
    a: "The repair form covers PlayStation 2, 3, 4 and 5 consoles, plus official PlayStation and Xbox controllers and the PlayStation Move controller. Pick “Other” and describe it if yours isn’t listed.",
  },
  {
    q: "How long do repairs take?",
    a: `The site lists repairs as typically completed in ${site.repairTurnaround}. Your exact timeline depends on the fault, so the shop confirms it after looking at your device.`,
  },
  {
    q: "Do you offer warranties on repairs?",
    a: "Warranty terms aren’t published on the site yet. Ask the team on WhatsApp before you book so you have it in writing.",
  },
  {
    q: "Can I trade in my old gaming console?",
    a: "Yes. Start an exchange enquiry and tell us the console, its condition and what you want to upgrade to. Final trade-in value is always confirmed by the shop after checking the device.",
  },
  {
    q: "What can I expect in the gaming zone?",
    a: "PlayStation 4 and PlayStation 5 sessions are charged per head for 30 or 60 minutes, with a complimentary beverage, and there is an arcade Tekken tournament. See the Game Zone page for the listed rates.",
  },
  {
    q: "Do you sell gaming accessories and parts?",
    a: "Yes, accessory replacement is part of the service list. Availability changes, so message the shop to confirm what’s in stock.",
  },
] as const;
