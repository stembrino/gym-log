import { GymLogBackupFile } from "../../data-transfer/types/backup";

/**
 * Parses a JSON backup file and validates its structure.
 * @param fileContent - The raw JSON string from the selected file.
 * @returns A parsed GymLogBackupFile object or an error result.
 */
export function parseBackupFile(
  fileContent: string,
):
  | { status: "ok"; data: GymLogBackupFile }
  | { status: "parse_error"; message: string }
  | { status: "unsupported_file"; message: string } {
  try {
    const parsed = JSON.parse(fileContent);

    // Basic validation for top-level structure
    if (
      typeof parsed !== "object" ||
      parsed.format !== "gym-log-backup" ||
      typeof parsed.version !== "number" ||
      typeof parsed.exportedAt !== "string" ||
      !parsed.data ||
      !parsed.counts
    ) {
      return { status: "unsupported_file", message: "Invalid backup file format." };
    }

    return { status: "ok", data: parsed as GymLogBackupFile };
  } catch (error) {
    return { status: "parse_error", message: "Failed to parse JSON: " + (error as Error).message };
  }
}
