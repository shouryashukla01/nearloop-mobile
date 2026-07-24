import { Pressable, Text } from "react-native";
import { theme } from "../theme";

export function Button({ title, onPress, variant = "primary", disabled, style }) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: theme.radius,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          backgroundColor: primary ? theme.colors.ink : theme.colors.white,
          borderWidth: primary ? 0 : 1,
          borderColor: variant === "danger" ? theme.colors.coral : theme.colors.line,
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1
        },
        variant === "danger" ? { backgroundColor: theme.colors.white } : null,
        style
      ]}
    >
      <Text style={{ color: primary ? theme.colors.white : variant === "danger" ? theme.colors.coral : theme.colors.ink, fontWeight: "800" }}>
        {title}
      </Text>
    </Pressable>
  );
}
