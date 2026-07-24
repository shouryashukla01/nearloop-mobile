import { View } from "react-native";
import { shadow, theme } from "../theme";

export function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.line,
          borderWidth: 1,
          borderRadius: theme.radius,
          padding: theme.space
        },
        shadow,
        style
      ]}
    >
      {children}
    </View>
  );
}
