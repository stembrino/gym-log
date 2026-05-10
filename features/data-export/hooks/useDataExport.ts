import { useCallback, useState } from "react";
import {
  cacheDirectory,
  documentDirectory,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { useGlobalAlert } from "@/components/hooks/useGlobalAlert";
import { useI18n } from "@/components/providers/i18n-provider";
import { buildDataExportFileName, serializeDataExportSnapshot } from "../lib/buildDataExportFile";
import { getDataExportSnapshot } from "../queries/getDataExportSnapshot";
import { useExportFileNamePrompt } from "./useExportFileNamePrompt";

export function useDataExport() {
  const { t } = useI18n();
  const { showAlert, alertElement } = useGlobalAlert();
  const { promptForFileName, modalElement } = useExportFileNamePrompt();
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

        // Generate default name and ask user for custom name
        const defaultFileName = buildDataExportFileName(snapshot.exportedAt).replace(
          /\.json$/i,
          "",
        );
        const customFileName = await promptForFileName(defaultFileName);

        if (customFileName === null) {
          // User cancelled the prompt
          return;
        }

        const fileContents = serializeDataExportSnapshot(snapshot);
        const baseDirectory = cacheDirectory ?? documentDirectory;

        if (!baseDirectory) {
          throw new Error("No writable directory available for export.");
        }

        const normalizedBaseDirectory = baseDirectory.endsWith("/")
          ? baseDirectory
          : `${baseDirectory}/`;
        const finalFileName = customFileName.endsWith(".json")
          ? customFileName
          : `${customFileName}.json`;
        const fileUri = `${normalizedBaseDirectory}${finalFileName}`;

        await writeAsStringAsync(fileUri, fileContents, {
          encoding: EncodingType.UTF8,
        });

        if (Platform.OS === "android") {
          // Let Android infer type from the extension to maximize chooser compatibility in release builds.
          await Sharing.shareAsync(fileUri, {
            dialogTitle: t("settings.dataExportShareDialogTitle"),
          });
        } else {
          await Sharing.shareAsync(fileUri, {
            dialogTitle: t("settings.dataExportShareDialogTitle"),
            mimeType: "application/json",
            UTI: "public.json",
          });
        }

        showAlert({
          title: t("settings.dataExportSuccessTitle"),
          message: t("settings.dataExportSuccessMessage"),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Export error:", error);
        showAlert({
          title: t("settings.dataExportErrorTitle"),
          message: `${t("settings.dataExportErrorMessage")}\n\n${errorMessage}`,
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } finally {
        setIsExporting(false);
      }
    })();
  }, [isExporting, showAlert, t, promptForFileName]);

  return {
    alertElement,
    exportData,
    isExporting,
    fileNameModal: modalElement,
  };
}
