import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

export function Screen({ children, scroll = true, style }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 360 ? 14 : 18;
  const topPadding = Math.max(insets.top + 12, Platform.OS === "android" ? 34 : 16);
  const bottomPadding = Math.max(insets.bottom + 104, 124);
  const keyboardOffset = Platform.OS === "android" ? Math.max(insets.top, 24) : 0;
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingTop: topPadding, paddingBottom: bottomPadding, gap: 16 }, style]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: horizontalPadding, paddingTop: topPadding, paddingBottom: bottomPadding }, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={keyboardOffset} style={{ flex: 1, backgroundColor: theme.colors.paper }}>
      {content}
    </KeyboardAvoidingView>
  );
}
