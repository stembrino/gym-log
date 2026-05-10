import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { monoFont } from "@/constants/retroTheme";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type ControlledSearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  variant?: "default" | "compact";
  testID?: string;
  showClearButton?: boolean;
  showLeadingIcon?: boolean;
  leadingIconName?: "search" | "pencil";
  autoFocus?: boolean;
  maxLength?: number;
};

export function ControlledSearchInput({
  value,
  onChangeText,
  placeholder,
  variant = "default",
  testID,
  showClearButton = false,
  showLeadingIcon = true,
  leadingIconName = "search",
  autoFocus = false,
  maxLength,
}: ControlledSearchInputProps) {
  const palette = useRetroPalette();
  const [focused, setFocused] = useState(false);

  const isCompact = variant === "compact";

  const containerStyle = useMemo(
    () => [
      styles.container,
      isCompact ? styles.containerCompact : styles.containerDefault,
      {
        backgroundColor: palette.inputBg,
        borderColor: !isCompact && focused ? palette.accent : palette.inputBorder,
        borderWidth: !isCompact && focused ? 2 : 1,
      },
    ],
    [focused, isCompact, palette.accent, palette.inputBg, palette.inputBorder],
  );

  return (
    <View style={containerStyle} testID={testID ?? "controlled-search-input-container"}>
      {showLeadingIcon ? (
        <FontAwesome
          testID="controlled-search-input-leading-icon"
          name={leadingIconName}
          size={14}
          color={palette.textSecondary}
        />
      ) : null}
      <TextInput
        testID="controlled-search-input-field"
        style={[styles.input, { color: palette.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={palette.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showClearButton && value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear input"
          testID="controlled-search-input-clear-button"
          onPress={() => onChangeText("")}
          hitSlop={8}
          style={styles.clearButton}
        >
          <FontAwesome name="times" size={14} color={palette.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  containerDefault: {
    borderRadius: 2,
  },
  containerCompact: {
    borderRadius: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: monoFont,
    fontSize: 14,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
