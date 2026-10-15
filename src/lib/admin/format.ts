export const formatAdminDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));

export const titleCaseStatus = (value: string) =>
  value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
