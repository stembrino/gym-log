type ParseRoutineSetRepsTargetsArgs = {
  setsTarget: number | null;
  repsTarget: string | null;
};

function normalizeRepsValue(value: string | number | null | undefined): string {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? String(Math.round(value)) : "";
  }

  if (typeof value !== "string") {
    return "";
  }

  const firstNumber = value.trim().match(/\d+/)?.[0] ?? "";
  return firstNumber;
}

function parseDelimitedRepsTargets(trimmed: string): string[] {
  if (!/[;,|/\n]/.test(trimmed)) {
    return [];
  }

  const normalized = trimmed
    .split(/[;,|/\n]/)
    .map((entry) => normalizeRepsValue(entry))
    .filter((entry) => entry.length > 0);

  return normalized;
}

export function parseRoutineSetRepsTargets({
  setsTarget,
  repsTarget,
}: ParseRoutineSetRepsTargetsArgs): string[] {
  const safeSets = Math.max(1, setsTarget ?? 1);

  if (!repsTarget || !repsTarget.trim()) {
    return Array.from({ length: safeSets }, () => "");
  }

  const trimmed = repsTarget.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((value) => normalizeRepsValue(value as string | number));

        if (normalized.length > 0) {
          return normalized;
        }
      }
    } catch {
      // Fall through to legacy parsing.
    }
  }

  const delimited = parseDelimitedRepsTargets(trimmed);
  if (delimited.length > 0) {
    return delimited;
  }

  const numericTokens = trimmed.match(/\d+/g) ?? [];
  if (numericTokens.length > 1 && (/\s/.test(trimmed) || numericTokens.length === safeSets)) {
    return numericTokens;
  }

  if (trimmed.includes(",")) {
    const normalized = trimmed.split(",").map((entry) => normalizeRepsValue(entry));

    if (normalized.some((value) => value.length > 0)) {
      return normalized;
    }
  }

  const legacyReps = normalizeRepsValue(trimmed);
  return Array.from({ length: safeSets }, () => legacyReps);
}

export function serializeRoutineSetRepsTargets(setRepsTargets: number[]): {
  setsTarget: number | null;
  repsTarget: string | null;
} {
  const normalized = setRepsTargets.map((reps) =>
    Number.isFinite(reps) && reps > 0 ? Math.round(reps) : 0,
  );

  if (normalized.length === 0) {
    return {
      setsTarget: 1,
      repsTarget: null,
    };
  }

  return {
    setsTarget: normalized.length,
    repsTarget: JSON.stringify(normalized),
  };
}
