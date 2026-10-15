import { domMax } from "motion/react";

/** Loaded after first paint: keeps gesture/layout animation code off the critical path. */
export default domMax;
