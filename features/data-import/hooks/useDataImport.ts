import { useCallback, useState } from "react";

import { useGlobalAlert } from "@/components/hooks/useGlobalAlert";
import { useI18n } from "@/components/providers/i18n-provider";
import { runBackupImportPreflight } from "../lib/runBackupImportPreflight";

export function useDataImport() {
  const { t } = useI18n();
  const { showAlert, alertElement } = useGlobalAlert();
  const [isImporting, setIsImporting] = useState(false);

  const importFromText = useCallback(
    async (rawText: string) => {
      if (isImporting) {
        return;
      }

      setIsImporting(true);

      try {
        const preflightResult = runBackupImportPreflight(rawText);

        if (preflightResult.status === "error") {
          showAlert({
            title: t("settings.dataImportInvalidTitle"),
            message: preflightResult.issues[0] ?? t("settings.dataImportInvalidMessage"),
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        showAlert({
          title: t("settings.dataImportPreflightOkTitle"),
          message: t("settings.dataImportPreflightOkMessage", {
            workouts: preflightResult.backup.counts.workouts,
            exercises: preflightResult.backup.counts.exercises,
          }),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } finally {
        setIsImporting(false);
      }
    },
    [isImporting, showAlert, t],
  );

  const showNotReadyMessage = useCallback(() => {
    showAlert({
      title: t("settings.dataImportAction"),
      message: t("settings.dataImportNotReadyMessage"),
      buttonLabel: t("workouts.postFinishCloseCta"),
    });
  }, [showAlert, t]);

  return {
    alertElement,
    importFromText,
    isImporting,
    showNotReadyMessage,
  };
}
