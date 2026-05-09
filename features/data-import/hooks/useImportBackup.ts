import { useState } from "react";
import { parseBackupFile } from "../lib/parseBackupFile";
import { validateBackupContract } from "../lib/validateBackupContract";
import { checkBackupCompatibility } from "../lib/checkBackupCompatibility";
import { transactionalRestore } from "../restore/transactionalRestore";

/**
 * Hook to handle the import backup flow.
 */
export function useImportBackup() {
  const [status, setStatus] = useState<
    "idle" | "parsing" | "validating" | "checking" | "restoring" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function importBackup(fileContent: string) {
    setStatus("parsing");
    setError(null);

    // Parse the file
    const parseResult = parseBackupFile(fileContent);
    if (parseResult.status !== "ok") {
      setStatus("error");
      setError(parseResult.message);
      return;
    }

    const backup = parseResult.data;

    // Validate the contract
    setStatus("validating");
    const contractResult = validateBackupContract(backup);
    if (contractResult.status !== "valid_contract") {
      setStatus("error");
      setError(contractResult.issues.join(", "));
      return;
    }

    // Check compatibility
    setStatus("checking");
    const compatibilityResult = checkBackupCompatibility(backup);
    if (compatibilityResult.status === "incompatible") {
      setStatus("error");
      setError(compatibilityResult.issues.join(", "));
      return;
    }

    // Restore data
    setStatus("restoring");
    const restoreResult = await transactionalRestore(backup);
    if (restoreResult.status === "failed") {
      setStatus("error");
      setError(restoreResult.message);
      return;
    }

    setStatus("success");
  }

  return {
    status,
    error,
    importBackup,
  };
}
