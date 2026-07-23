import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

export function Screen({ children, scroll = true, style }) {
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: 16, paddingBottom: 110, gap: 16 }, style]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: 16 }, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.colors.paper, paddingTop: insets.top }}>
      {content}
    </KeyboardAvoidingView>
  );
}
