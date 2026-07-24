import { Image, Text, View } from "react-native";
import { theme } from "../theme";

export function Avatar({ uri, username = "U", size = 44 }) {
  const initials = username.slice(0, 2).toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.soft }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.ink }}>
      <Text style={{ color: theme.colors.white, fontWeight: "900" }}>{initials}</Text>
    </View>
  );
}
