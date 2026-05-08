import type { DataExportSnapshot } from "../queries/getDataExportSnapshot";

function sanitizeTimestamp(value: string) {
  return value.replace(/[:.]/g, "-");
}

export function buildDataExportFileName(exportedAt: string) {
  return `gym-log-backup-${sanitizeTimestamp(exportedAt)}.json`;
}

export function serializeDataExportSnapshot(snapshot: DataExportSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}
