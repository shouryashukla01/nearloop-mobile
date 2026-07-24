import { Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shadow, theme } from "../theme";

export function FloatingCreateButton({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => navigation.navigate("CreateEvent")}
      style={({ pressed }) => [
        {
          position: "absolute",
          right: 18,
          bottom: Math.max(insets.bottom + 82, 100),
          minHeight: 52,
          borderRadius: 999,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: theme.colors.ink,
          opacity: pressed ? 0.86 : 1
        },
        shadow
      ]}
    >
      <Ionicons name="add" size={22} color={theme.colors.white} />
      <Text style={{ color: theme.colors.white, fontWeight: "900", fontSize: 14 }}>Create</Text>
    </Pressable>
  );
}
