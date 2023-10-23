import assert from "assert";

import type { StableMatcher, StableMatcherWithTrace, Hire, Offer } from "../include/stableMatching.js";

export function generateInput(n: number): number[][] {
  // TODO
  const input: number[][] = [];
  for (let i = 0; i < n; i++) {
    const nums = generateInts(n);
    shuffle(nums, n);
    input.push(nums);
  }
  return input;
}

function generateInts(n: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < n; i++) {
    nums.push(i);
  }
  return nums;
}

function shuffle(a: number[], n: number) {
  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    const temp = a[j];
    a[j] = a[i];
    a[i] = temp;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

const NUM_TESTS = 20; // Change this to some reasonably large value
const N = 6; // Change this to some reasonable size

/**
 * Tests whether or not the supplied function is a solution to the stable matching problem.
 * @param makeStableMatching A possible solution to the stable matching problem
 * @throws An `AssertionError` if `makeStableMatching` in not a solution to the stable matching problem
 */
export function stableMatchingOracle(makeStableMatching: StableMatcher): void {
  for (let i = 0; i < NUM_TESTS; ++i) {
    const companies = generateInput(N);
    const candidates = generateInput(N);
    const hires = makeStableMatching(companies, candidates);

    assert(companies.length === hires.length, "Hires length is correct.");

    // TODO: More assertions go here.
    assert(companies.length === candidates.length, "No company or candidate is left out of matching.");

    const stableResult = [];
    for (let i = 0; i < hires.length; i++) {
      // for every matched pair in hires
      let stable = true;
      const cand = hires[i].candidate; // find the candidate in the pair
      const candPref = candidates[cand].slice(0, candidates[cand].indexOf(hires[i].company)); // find companies that cand prefers over the matched comp

      for (let j = 0; j < candPref.length; j++) {
        // for every comp the cand prefers over their matched comp
        const comp = candPref[j]; // get that company
        const compPref = companies[comp]; // find its preferences
        let matchedCand = 0;
        for (let k = 0; k < hires.length; k++) {
          if (hires[k].company === comp) matchedCand = hires[k].candidate;
        }
        if (compPref.indexOf(matchedCand) > compPref.indexOf(cand)) {
          // check if the comp prefers its own partner over the oringinal cand
          stable = false; // if it doesn't then it is unstable
          break;
        }
      }
      stableResult.push(stable);
    }
    assert(
      stableResult.every(e => e),
      "All matches are stable."
    );
  }
}

// Part B

class Party {
  constructor(prefs: number[][]) {
    this.prefs = prefs;
    this.inverse = prefs.map(inversePermutation);
    // Make an array to keep track of matches
    this.match = new Array<number>(N).fill(-1);
    // Make an array to keep track of number of offers a company/candidate has made
    // It can be used to access top preferences of a company/candidate
    this.offers = new Array<number>(N).fill(0);
    // Make an array to keep track of which company/candidate was proposed to already
    this.proposed = Array.from(Array(N), () => Array.from(Array(N), () => false));
  }
  prefs: number[][];
  inverse: number[][];
  match: number[];
  offers: number[];
  proposed: boolean[][];
}

function matching(from: Party, to: Party, offer: Offer) {
  assert(from.match[offer.from] < 0, "Party is already matched");
  assert(offer.to === from.prefs[offer.from][from.offers[offer.from]], "Party is not offering to its top choice");
  assert(!from.proposed[offer.from][offer.to], "Party is making a repeated offer");

  if (to.match[offer.to] < 0 || to.inverse[offer.to][to.match[offer.to]] > to.inverse[offer.to][offer.from]) {
    // Receiving party accepts the offer
    // when it is unmatched
    // or when the party that offered has a higher preference than its current match

    // Unmatch old partners and match new partners
    if (to.match[offer.to] != -1) from.match[to.match[offer.to]] = -1;
    from.match[offer.from] = offer.to;
    to.match[offer.to] = offer.from;
  }
  // Do nothing if receiving party rejects the offer

  // Increment the number of offers this party has sent
  from.offers[offer.from]++;

  // Inviting party cannot propose to this receiving party again
  from.proposed[offer.from][offer.to] = true;
}

function inversePermutation(arr: number[]): number[] {
  const result = [];
  for (let i = 0; i < N; i++) {
    result[arr[i]] = i;
  }
  return result;
}

/**
 * Tests whether or not the supplied function follows the supplied algorithm.
 * @param makeStableMatchingTrace A possible solution to the stable matching problem and its possible steps
 * @throws An `AssertionError` if `makeStableMatchingTrace` does not follow the specified algorithm, or its steps (trace)
 * do not match with the result (out).
 */
export function stableMatchingRunOracle(makeStableMatchingTrace: StableMatcherWithTrace): void {
  for (let i = 0; i < NUM_TESTS; ++i) {
    const companies = generateInput(N);
    const candidates = generateInput(N);
    const { trace, out } = makeStableMatchingTrace(companies, candidates);

    // TODO: Assertions go here.st
    const company = new Party(companies);
    const candidate = new Party(candidates);

    //Each offer must be valid
    trace.forEach(offer => offer.fromCo ? matching(company, candidate, offer) : matching(candidate, company, offer));

    // Add all matched pairs to a Hire[]
    const input: Hire[] = [];
    company.match.forEach(cand => {if (cand != -1) {input.push({ company: candidate.match[cand], candidate: cand })}});

    assert(input.length === out.length, "The number of matches is incorrect");
    assert(
      input.every(inputHire =>
        out.some(outputHire => inputHire.company === outputHire.company && inputHire.candidate === outputHire.candidate)
      ),
      "Not every match in input matches out"
    );
  }
}
