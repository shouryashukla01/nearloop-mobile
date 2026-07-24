import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { INTERESTS, MAJOR_INDIAN_CITIES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { theme, typeScale } from "../theme";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CityPicker } from "../components/CityPicker";
import { Screen } from "../components/Screen";

export function OnboardingScreen() {
  const { profile, saveProfile } = useAuth();
  const type = typeScale();
  const [username, setUsername] = useState(profile?.username?.startsWith("user_") ? "" : profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagramUrl || "");
  const [city, setCity] = useState(profile?.city || MAJOR_INDIAN_CITIES[2]);
  const [interests, setInterests] = useState(profile?.interests || ["Coffee", "Startups"]);
  const [saving, setSaving] = useState(false);

  function toggleInterest(item) {
    setInterests((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  async function submit() {
    if (!/^[a-zA-Z0-9_.]{3,24}$/.test(username)) {
      Alert.alert("Username needed", "Use 3-24 letters, numbers, underscores, or dots.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ username, bio, instagramUrl, city, interests, avatarUrl: profile?.avatarUrl });
    } catch (error) {
      Alert.alert("Profile not saved", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View>
        <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>NEARLOOP</Text>
        <Text style={{ marginTop: 8, fontSize: type.hero, lineHeight: type.heroLine, fontWeight: "900" }}>Set your city signal.</Text>
        <Text style={{ marginTop: 8, fontSize: type.body, lineHeight: type.bodyLine, color: theme.colors.muted }}>Your feed and chat unlocks become sharper once your profile is set.</Text>
      </View>
      <Card style={{ gap: 12 }}>
        <Text style={{ fontSize: type.section, fontWeight: "900" }}>Your public profile</Text>
        <Text style={fieldLabel}>Username</Text>
        <TextInput placeholder="your_username" placeholderTextColor={theme.colors.muted} value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" style={input} />
        <Text style={fieldLabel}>Short bio</Text>
        <TextInput placeholder="Tell people what you like" placeholderTextColor={theme.colors.muted} value={bio} onChangeText={setBio} multiline style={[input, { height: 100, textAlignVertical: "top" }]} />
        <Text style={fieldLabel}>Instagram URL</Text>
        <TextInput placeholder="https://instagram.com/yourname" placeholderTextColor={theme.colors.muted} value={instagramUrl} onChangeText={setInstagramUrl} autoCapitalize="none" style={input} />
      </Card>
      <Card style={{ gap: 12 }}>
        <Text style={{ fontSize: type.section, fontWeight: "900" }}>City and interests</Text>
        <Text style={fieldLabel}>Home city</Text>
        <CityPicker value={city} onChange={setCity} />
        <Text style={fieldLabel}>Interests</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INTERESTS.map((item) => {
            const active = interests.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggleInterest(item)}
                style={{ borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: active ? theme.colors.ink : theme.colors.white, borderWidth: 1, borderColor: theme.colors.line }}
              >
                <Text style={{ color: active ? theme.colors.white : theme.colors.ink, fontWeight: "800" }}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        <Button title={saving ? "Saving..." : "Enter NearLoop"} onPress={submit} disabled={saving} />
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
