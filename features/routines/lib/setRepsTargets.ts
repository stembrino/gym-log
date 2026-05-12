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

  const digitsOnly = value.trim().replace(/\D+/g, "");
  return digitsOnly;
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
