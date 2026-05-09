import {
  BACKUP_COLLECTION_KEYS,
  BACKUP_FORMAT,
  type BackupCollectionKey,
  GymLogBackupFile,
} from "@/features/data-transfer/types/backup";

export type BackupContractValidationResult =
  | {
      status: "valid_contract";
      backup: GymLogBackupFile;
    }
  | {
      status: "invalid_contract";
      issues: string[];
    };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isObject(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "number");
}

function hasAllRequiredCollections(data: Record<string, unknown>) {
  return BACKUP_COLLECTION_KEYS.every((key) => Array.isArray(data[key]));
}

function collectMissingCollections(data: Record<string, unknown>): BackupCollectionKey[] {
  return BACKUP_COLLECTION_KEYS.filter((key) => !Array.isArray(data[key]));
}

export function validateBackupContract(input: unknown): BackupContractValidationResult {
  const issues: string[] = [];

  if (!isObject(input)) {
    return {
      status: "invalid_contract",
      issues: ["Payload deve ser um objeto JSON."],
    };
  }

  if (input.format !== BACKUP_FORMAT) {
    issues.push("Campo format inválido.");
  }

  if (typeof input.version !== "number") {
    issues.push("Campo version ausente ou inválido.");
  }

  if (typeof input.exportedAt !== "string") {
    issues.push("Campo exportedAt ausente ou inválido.");
  }

  if (!isObject(input.data)) {
    issues.push("Campo data ausente ou inválido.");
  }

  if (!isNumberRecord(input.counts)) {
    issues.push("Campo counts ausente ou inválido.");
  }

  if (isObject(input.data) && !hasAllRequiredCollections(input.data)) {
    const missingCollections = collectMissingCollections(input.data);
    issues.push(`Coleções ausentes ou inválidas: ${missingCollections.join(", ")}.`);
  }

  return issues.length === 0
    ? { status: "valid_contract", backup: input as GymLogBackupFile }
    : { status: "invalid_contract", issues };
}
