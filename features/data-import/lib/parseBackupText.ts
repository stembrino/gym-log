export type BackupParseResult =
  | {
      status: "ok";
      value: unknown;
    }
  | {
      status: "parse_error" | "unsupported_file";
      message: string;
    };

export function parseBackupText(rawText: string): BackupParseResult {
  if (rawText.trim().length === 0) {
    return {
      status: "unsupported_file",
      message: "Arquivo vazio.",
    };
  }

  try {
    const parsed = JSON.parse(rawText) as unknown;

    return {
      status: "ok",
      value: parsed,
    };
  } catch {
    return {
      status: "parse_error",
      message: "JSON inválido.",
    };
  }
}
