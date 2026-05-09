import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useImportBackup } from "../hooks/useImportBackup";

export function ImportBackupRow() {
  const { status, error, importBackup } = useImportBackup();
  const [isImporting, setIsImporting] = useState(false);

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });

    console.log("Document Picker Result:", result); // Log the file picker result

    if ((result as any).type === "cancel") {
      return;
    }

    const fileContent = await fetch((result as any).uri).then((res) => res.text());

    console.log("File Content:", fileContent); // Log the file content

    setIsImporting(true);
    await importBackup(fileContent);
    setIsImporting(false);

    if (status === "success") {
      Alert.alert("Import Successful", "Your data has been restored.");
    } else if (status === "error" && error) {
      Alert.alert("Import Failed", error);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Import Backup</Text>
      <Button title="Import Backup" onPress={handleImport} disabled={isImporting} />
      {isImporting && <Text style={{ marginTop: 8 }}>Importing...</Text>}
    </View>
  );
}
