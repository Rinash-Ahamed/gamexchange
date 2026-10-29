type SocialNetwork = "instagram" | "facebook" | "whatsapp";

/** Small inline vectors keep social links recognisable without external image requests. */
export function SocialIcon({ network }: { network: SocialNetwork }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true" focusable="false">
      {network === "instagram" && <g stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></g>}
      {network === "facebook" && <path fill="currentColor" d="M14.2 22v-9.1h3.1l.5-3.6h-3.6V7c0-1 .3-1.8 1.8-1.8H18V2.1C17.6 2 16.4 2 15.2 2c-2.9 0-4.8 1.7-4.8 4.9v2.4H7.2v3.6h3.2V22h3.8Z" />}
      {network === "whatsapp" && <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.8l1.5-4.7a8.5 8.5 0 1 1 16-4.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path fill="currentColor" d="M8.1 7.1c.2-.2.5-.2.7-.1l1.2 2.2c.1.2.1.4-.1.6l-.8.9c.7 1.3 1.7 2.3 3.1 2.9l.8-1c.2-.2.4-.3.7-.2l2.2 1c.3.1.4.3.3.6-.2 1.3-1.1 2.1-2.4 2-3.4-.4-6.4-3.2-7.1-6.4-.2-1 .3-2 1.4-2.5Z" /></>}
    </svg>
  );
}
