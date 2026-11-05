import type { NextConfig } from "next";

/**
 * Content-Security-Policy. `script-src 'unsafe-inline'` is required today because pages are
 * statically rendered and Next/the theme boot script emit inline scripts; moving to nonces needs
 * dynamic rendering (see README). React and Turbopack also require `unsafe-eval` for development
 * debugging, but it is deliberately excluded from production.
 */
const scriptSrc = [
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com https://apis.google.com",
  process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "",
]
  .filter(Boolean)
  .join(" ");

// Allow only the configured auth host, never arbitrary environment text in CSP.
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
const authOrigin = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(authDomain) ? `https://${authDomain}` : "";
const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://framerusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.razorpay.com https://checkout.razorpay.com ${authOrigin}`,
  `frame-src https://api.razorpay.com https://checkout.razorpay.com ${authOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // SPA navigation retains the original document policy, including Home -> Cart.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["firebase-admin"],
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      // Uploaded artwork uses dynamic ?v= values; the routes validate current versions.
      // Omit search only on these image endpoints, not across all local paths.
      { pathname: "/api/inventory/*/image" },
      { pathname: "/api/banners/*/image" },
      { pathname: "/api/franchise/*/image" },
      { pathname: "/api/homepage-images/*" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85],
    remotePatterns: [{ protocol: "https", hostname: "framerusercontent.com", pathname: "/images/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
