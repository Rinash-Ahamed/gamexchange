import type { Enquiry } from "./validation";
import { site } from "@/data/site";

const line = (label: string, value: string | number) => `${label}: ${value}`;

/** Builds the plain-text message the customer sends from their own WhatsApp. */
export function buildEnquiryMessage(e: Enquiry): string {
  const head = {
    repair: "Repair enquiry",
    exchange: "Trade-in / exchange enquiry",
    gamezone: "Game Zone enquiry",
    contact: "Website contact enquiry",
  }[e.kind];

  const rows: string[] = [`Hi ${site.name}, ${head} from the website.`, ""];

  switch (e.kind) {
    case "repair":
      rows.push(line("Category", e.category), line("Device", e.device), line("Issues", e.fault.join(", ")), line("Details", e.details));
      break;
    case "exchange":
      rows.push(
        line("Current console", e.console),
        line("Condition", e.condition),
        line("Accessories", e.accessories.length ? e.accessories.join(", ") : "None"),
        line("Wants to upgrade to", e.upgrade),
      );
      if (e.details) rows.push(line("Details", e.details));
      break;
    case "gamezone":
      rows.push(line("Station", e.station), line("Players", e.people), line("When", e.when));
      if (e.message) rows.push(line("Note", e.message));
      break;
    case "contact":
      rows.push(line("Enquiry type", e.contactTopic));
      rows.push(line("Message", e.message));
      break;
  }

  rows.push("", line("Branch", e.branch), line("Name", e.name), line("Phone", e.phone), line("Preferred contact", e.contactMethod));
  return rows.join("\n");
}
