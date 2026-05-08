import { useCallback, useState } from "react";
import {
  cacheDirectory,
  documentDirectory,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useGlobalAlert } from "@/components/hooks/useGlobalAlert";
import { useI18n } from "@/components/providers/i18n-provider";
import { buildDataExportFileName, serializeDataExportSnapshot } from "../lib/buildDataExportFile";
import { getDataExportSnapshot } from "../queries/getDataExportSnapshot";

export function useDataExport() {
  const { t } = useI18n();
  const { showAlert, alertElement } = useGlobalAlert();
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(() => {
    if (isExporting) {
      return;
    }

    void (async () => {
      setIsExporting(true);

      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (!isSharingAvailable) {
          showAlert({
            title: t("settings.dataExportUnavailableTitle"),
            message: t("settings.dataExportUnavailableMessage"),
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        const snapshot = await getDataExportSnapshot();
        const fileContents = serializeDataExportSnapshot(snapshot);
        const baseDirectory = cacheDirectory ?? documentDirectory;

        if (!baseDirectory) {
          throw new Error("No writable directory available for export.");
        }

        const fileUri = `${baseDirectory}${buildDataExportFileName(snapshot.exportedAt)}`;

        await writeAsStringAsync(fileUri, fileContents, {
          encoding: EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
          dialogTitle: t("settings.dataExportShareDialogTitle"),
          mimeType: "application/json",
          UTI: "public.json",
        });
      } catch {
        showAlert({
          title: t("settings.dataExportErrorTitle"),
          message: t("settings.dataExportErrorMessage"),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } finally {
        setIsExporting(false);
      }
    })();
  }, [isExporting, showAlert, t]);

  return {
    alertElement,
    exportData,
    isExporting,
  };
}
