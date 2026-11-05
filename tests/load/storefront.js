import http from "k6/http";
import { check, group, sleep } from "k6";
import { stagingTarget, virtualUsers, testProductIds } from "./guards.js";

const base = stagingTarget();
const vus = virtualUsers();
const ids = testProductIds();
export const options = {
  scenarios: { storefront: { executor: "ramping-vus", startVUs: 0, stages: [{ duration: "30s", target: vus }, { duration: __ENV.HOLD || "2m", target: vus }, { duration: "30s", target: 0 }], gracefulRampDown: "15s" } },
  // Initial investigation targets, not measured capacity promises.
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<1500", "p(99)<3000"], checks: ["rate>0.99"] },
  summaryTrendStats: ["min", "med", "p(50)", "p(95)", "p(99)", "max"],
};
function visit(path, name) {
  const response = http.get(`${base}${path}`, { tags: { name }, timeout: "15s", redirects: 0, responseType: "none" });
  check(response, { "page returns 200": (value) => value.status === 200 });
}
export default function () {
  group("Browse and search", () => {
    visit("/products", "GET /products");
    visit(`/products?q=${encodeURIComponent(__ENV.SEARCH || "PlayStation")}&section=consoles&platform=PS5`, "GET /products?search-and-filters");
    visit(`/products/${ids[(__VU + __ITER) % ids.length]}`, "GET /products/[id]");
  });
  if (__ITER % 3 === 0) visit("/", "GET /");
  if (__ITER % 5 === 0) visit("/api/health", "GET /api/health");
  sleep(2 + Math.random() * 3);
}
