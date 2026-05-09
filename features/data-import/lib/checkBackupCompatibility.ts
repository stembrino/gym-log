import {
  BACKUP_VERSION,
  type BackupCompatibilityResult,
  type GymLogBackupFile,
} from "@/features/data-transfer/types/backup";

const APP_SCHEMA_VERSION = null;

export function checkBackupCompatibility(backup: GymLogBackupFile): BackupCompatibilityResult {
  const issues: BackupCompatibilityResult["issues"] = [];
  const warnings: BackupCompatibilityResult["warnings"] = [];
  const backupSchemaVersion = backup.schemaVersion ?? null;

  if (backup.version > BACKUP_VERSION) {
    issues.push({
      code: "unsupported_future_version",
      message: "Este backup foi criado em uma versão mais nova do app.",
      path: "version",
      severity: "error",
    });
  }

  if (backup.version < BACKUP_VERSION) {
    warnings.push({
      code: "older_backup_version",
      message: "Backup de versão anterior. Algumas normalizações podem ser necessárias.",
      path: "version",
      severity: "warning",
    });
  }

  if (backupSchemaVersion === null) {
    warnings.push({
      code: "missing_schema_version",
      message: "Backup sem schemaVersion. Continuando com validação estrutural.",
      path: "schemaVersion",
      severity: "warning",
    });
  }

  if (
    backupSchemaVersion !== null &&
    APP_SCHEMA_VERSION !== null &&
    backupSchemaVersion > APP_SCHEMA_VERSION
  ) {
    issues.push({
      code: "unsupported_schema_gap",
      message: "schemaVersion do backup é mais novo do que o suportado por esta build.",
      path: "schemaVersion",
      severity: "error",
    });
  }

  if (
    backupSchemaVersion !== null &&
    APP_SCHEMA_VERSION !== null &&
    backupSchemaVersion < APP_SCHEMA_VERSION
  ) {
    warnings.push({
      code: "older_schema_version",
      message: "Backup com schemaVersion mais antigo. Alguns campos podem estar ausentes.",
      path: "schemaVersion",
      severity: "warning",
    });
  }

  return {
    status:
      issues.length === 0
        ? warnings.length === 0
          ? "compatible"
          : "compatible-with-warnings"
        : "incompatible",
    issues,
    warnings,
    backupVersion: backup.version,
    expectedVersion: BACKUP_VERSION,
    backupSchemaVersion,
    appSchemaVersion: APP_SCHEMA_VERSION,
  };
}
