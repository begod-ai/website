import {
  AWVM_GROUP_LABELS,
  AWVM_PROBES,
  type AwvmGroup,
  type AwvmProbe,
} from "./registry";

const KNOWN_TOKENS = new Set(AWVM_PROBES.map((probe) => probe.id));
const TOKEN_CANDIDATE = /(?:^|[^A-Z0-9-])(AWVM-[A-Z0-9]+(?:-[A-Z0-9]+)*)(?=$|[^A-Z0-9-])/g;

export interface AwvmGroupScore {
  group: AwvmGroup;
  label: string;
  found: number;
  total: number;
  recoveryRate: number;
}

export interface AwvmScore {
  found: AwvmProbe[];
  missed: AwvmProbe[];
  unknownTokens: string[];
  total: number;
  recovered: number;
  recoveryRate: number;
  byGroup: AwvmGroupScore[];
}

export type AwvmObservationResult =
  | { status: "fetch_failure" }
  | { status: "scored"; score: AwvmScore };

export function extractReportedAwvmTokens(text: string): string[] {
  const matches = Array.from(text.matchAll(TOKEN_CANDIDATE), (match) => match[1]);
  return Array.from(new Set(matches));
}

export function scoreAwvmResponse(text: string): AwvmScore {
  const reported = extractReportedAwvmTokens(text);
  const reportedSet = new Set(reported);
  const found = AWVM_PROBES.filter((probe) => reportedSet.has(probe.id));
  const missed = AWVM_PROBES.filter((probe) => !reportedSet.has(probe.id));
  const unknownTokens = reported.filter((token) => !KNOWN_TOKENS.has(token));
  const groups = Array.from(new Set(AWVM_PROBES.map((probe) => probe.group)));
  const byGroup = groups.map((group) => {
    const groupProbes = AWVM_PROBES.filter((probe) => probe.group === group);
    const groupFound = groupProbes.filter((probe) => reportedSet.has(probe.id)).length;
    return {
      group,
      label: AWVM_GROUP_LABELS[group],
      found: groupFound,
      total: groupProbes.length,
      recoveryRate: groupFound / groupProbes.length,
    };
  });

  return {
    found,
    missed,
    unknownTokens,
    total: AWVM_PROBES.length,
    recovered: found.length,
    recoveryRate: found.length / AWVM_PROBES.length,
    byGroup,
  };
}

export function scoreAwvmObservation(
  fetchSucceeded: boolean,
  responseText = "",
): AwvmObservationResult {
  return fetchSucceeded
    ? { status: "scored", score: scoreAwvmResponse(responseText) }
    : { status: "fetch_failure" };
}
