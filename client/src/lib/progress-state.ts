export type RunProtocol = "http" | "https";
export type RunVpnMode = "off" | "on";

export type ExploredCombination = "http-off" | "http-on" | "https-off" | "https-on";

export interface ProgressState {
  httpExplored: boolean;
  httpsExplored: boolean;
  vpnOffExplored: boolean;
  vpnOnExplored: boolean;
  httpVpnOff: boolean;
  httpVpnOn: boolean;
  httpsVpnOff: boolean;
  httpsVpnOn: boolean;
}

export const DEFAULT_PROGRESS: ProgressState = {
  httpExplored: false,
  httpsExplored: false,
  vpnOffExplored: false,
  vpnOnExplored: false,
  httpVpnOff: false,
  httpVpnOn: false,
  httpsVpnOff: false,
  httpsVpnOn: false,
};

export function didJustComplete(previousComplete: boolean, currentComplete: boolean): boolean {
  return !previousComplete && currentComplete;
}

export function toExploredCombination(
  protocol: RunProtocol,
  vpnMode: RunVpnMode,
): ExploredCombination {
  return `${protocol}-${vpnMode}` as ExploredCombination;
}

export function toProgressStateKey(
  protocol: RunProtocol,
  vpnMode: RunVpnMode,
): keyof ProgressState {
  return `${protocol}Vpn${vpnMode === "off" ? "Off" : "On"}` as keyof ProgressState;
}

export function applyCompletedRunToExploredCombinations(
  current: Set<ExploredCombination>,
  protocol: RunProtocol,
  vpnMode: RunVpnMode,
  completed: boolean,
): Set<ExploredCombination> {
  if (!completed) return current;

  const combination = toExploredCombination(protocol, vpnMode);
  if (current.has(combination)) return current;

  const next = new Set(current);
  next.add(combination);
  return next;
}

export function applyCompletedRunToProgressState(
  current: ProgressState,
  protocol: RunProtocol,
  vpnMode: RunVpnMode,
  completed: boolean,
): ProgressState {
  if (!completed) return current;

  const next: ProgressState = { ...current };
  let changed = false;

  if (protocol === "http" && !next.httpExplored) {
    next.httpExplored = true;
    changed = true;
  }
  if (protocol === "https" && !next.httpsExplored) {
    next.httpsExplored = true;
    changed = true;
  }
  if (vpnMode === "off" && !next.vpnOffExplored) {
    next.vpnOffExplored = true;
    changed = true;
  }
  if (vpnMode === "on" && !next.vpnOnExplored) {
    next.vpnOnExplored = true;
    changed = true;
  }

  const combinationKey = toProgressStateKey(protocol, vpnMode);
  if (!next[combinationKey]) {
    next[combinationKey] = true;
    changed = true;
  }

  return changed ? next : current;
}

export function parseStoredProgressState(raw: string | null): ProgressState {
  if (!raw) return DEFAULT_PROGRESS;

  try {
    return normalizeProgressState(JSON.parse(raw));
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function normalizeProgressState(value: unknown): ProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_PROGRESS;
  const parsed = value as Partial<ProgressState>;
  return {
    httpExplored: parsed.httpExplored === true,
    httpsExplored: parsed.httpsExplored === true,
    vpnOffExplored: parsed.vpnOffExplored === true,
    vpnOnExplored: parsed.vpnOnExplored === true,
    httpVpnOff: parsed.httpVpnOff === true,
    httpVpnOn: parsed.httpVpnOn === true,
    httpsVpnOff: parsed.httpsVpnOff === true,
    httpsVpnOn: parsed.httpsVpnOn === true,
  };
}

export function loadExploredCombinationsFromProgressState(
  value: unknown,
): Set<ExploredCombination> {
  const combinations = new Set<ExploredCombination>();
  const progress = normalizeProgressState(value);

  if (progress.httpVpnOff) combinations.add("http-off");
  if (progress.httpVpnOn) combinations.add("http-on");
  if (progress.httpsVpnOff) combinations.add("https-off");
  if (progress.httpsVpnOn) combinations.add("https-on");

  return combinations;
}
