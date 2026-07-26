import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { theme, typeScale } from "../theme";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";

export function AuthScreen() {
  const { isSupabaseReady, signIn, signUp } = useAuth();
  const type = typeScale();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!isSupabaseReady) {
      Alert.alert("Supabase missing", "Paste your Supabase URL and publishable key in src/lib/supabase.js or Expo environment variables.");
      return;
    }
    if (!email || password.length < 6) {
      Alert.alert("Almost there", "Enter an email and a password with at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
    } catch (error) {
      Alert.alert("Authentication failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={{ flexGrow: 1 }}>
      <View>
        <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>NEARLOOP</Text>
        <Text style={{ marginTop: 8, fontSize: type.hero, lineHeight: type.heroLine, fontWeight: "900", color: theme.colors.ink }}>
          Find plans before they blow up.
        </Text>
        <Text style={{ marginTop: 10, fontSize: type.body, lineHeight: type.bodyLine, color: theme.colors.muted }}>
          Nearby people, real events, invite-first growth loops, and email-password login.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {[
          "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=500&q=80"
        ].map((uri, index) => (
          <Image key={uri} source={{ uri }} style={{ flex: 1, height: index === 1 ? 126 : 104, borderRadius: 12, marginTop: index === 1 ? 18 : 0 }} />
        ))}
      </View>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", borderRadius: 12, backgroundColor: theme.colors.soft, padding: 4 }}>
          {[
            ["login", "Login"],
            ["signup", "Sign up"]
          ].map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setMode(key)}
              style={{ flex: 1, borderRadius: 10, paddingVertical: 12, backgroundColor: mode === key ? theme.colors.white : "transparent" }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: mode === key ? theme.colors.ink : theme.colors.muted }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={fieldLabel}>Email address</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          blurOnSubmit={false}
          keyboardType="email-address"
          placeholder="name@example.com"
          placeholderTextColor={theme.colors.muted}
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          style={input}
        />
        <Text style={fieldLabel}>Password</Text>
        <TextInput
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="At least 6 characters"
          placeholderTextColor={theme.colors.muted}
          returnKeyType="done"
          secureTextEntry
          textContentType={mode === "login" ? "password" : "newPassword"}
          value={password}
          onChangeText={setPassword}
          style={input}
        />
        <Button title={loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"} onPress={submit} disabled={loading} />
      </Card>
    </Screen>
  );
}

const input = {
  borderWidth: 1,
  borderColor: theme.colors.line,
  borderRadius: 12,
  paddingHorizontal: 14,
  minHeight: 54,
  backgroundColor: theme.colors.white,
  color: theme.colors.ink,
  fontSize: 16
};

const fieldLabel = {
  color: theme.colors.ink,
  fontSize: 13,
  fontWeight: "900",
  marginBottom: -4
};
