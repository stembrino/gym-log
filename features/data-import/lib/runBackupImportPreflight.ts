import type {
  BackupCompatibilityResult,
  GymLogBackupFile,
} from "@/features/data-transfer/types/backup";
import { checkBackupCompatibility } from "./checkBackupCompatibility";
import { parseBackupText } from "./parseBackupText";
import { validateBackupContract } from "./validateBackupContract";
import { validateBackupSemantics } from "./validateBackupSemantics";

export type BackupImportPreflightResult =
  | {
      status: "ready";
      backup: GymLogBackupFile;
      compatibility: BackupCompatibilityResult;
    }
  | {
      status: "error";
      stage: "parse" | "contract" | "compatibility" | "semantic";
      issues: string[];
      compatibility?: BackupCompatibilityResult;
    };

export function runBackupImportPreflight(rawText: string): BackupImportPreflightResult {
  const parsed = parseBackupText(rawText);

  if (parsed.status !== "ok") {
    return {
      status: "error",
      stage: "parse",
      issues: [parsed.message],
    };
  }

  const contractValidation = validateBackupContract(parsed.value);

  if (contractValidation.status !== "valid_contract") {
    return {
      status: "error",
      stage: "contract",
      issues: contractValidation.issues,
    };
  }

  const compatibility = checkBackupCompatibility(contractValidation.backup);

  if (compatibility.status === "incompatible") {
    return {
      status: "error",
      stage: "compatibility",
      issues: compatibility.issues.map((issue) => issue.message),
      compatibility,
    };
  }

  const semanticValidation = validateBackupSemantics(contractValidation.backup);

  if (semanticValidation.status !== "valid_backup") {
    return {
      status: "error",
      stage: "semantic",
      issues: semanticValidation.issues,
      compatibility,
    };
  }

  return {
    status: "ready",
    backup: contractValidation.backup,
    compatibility,
  };
}
