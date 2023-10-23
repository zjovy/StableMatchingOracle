import {
  FLAWED_STABLE_MATCHING_SOLUTION_1_TRACE,
  STABLE_MATCHING_SOLUTION_1_TRACE,
} from "../include/stableMatching.js";
import { generateInput, stableMatchingRunOracle } from "./oracles.js";

function debugPrint(prefix: string, x: unknown): void {
  console.log(`${prefix} ${JSON.stringify(x, undefined, 2)}`);
}

stableMatchingRunOracle(STABLE_MATCHING_SOLUTION_1_TRACE);
