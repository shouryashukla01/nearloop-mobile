import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { INTERESTS } from "../constants";
import { useAuth } from "../context/AuthContext";
import { uploadAvatar } from "../services/api";
import { theme, typeScale } from "../theme";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CityPicker } from "../components/CityPicker";
import { Screen } from "../components/Screen";

export function ProfileScreen() {
  const { user, profile, saveProfile, signOut } = useAuth();
  const type = typeScale();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagramUrl || "");
  const [city, setCity] = useState(profile?.city || "Bangalore");
  const [interests, setInterests] = useState(profile?.interests || []);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null);
  const [saving, setSaving] = useState(false);

  function toggleInterest(item) {
    setInterests((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  async function pickPhoto() {
    try {
      const nextUrl = await uploadAvatar(user);
      if (nextUrl) {
        setAvatarUrl(nextUrl);
        await saveProfile({ username, bio, instagramUrl, city, interests, avatarUrl: nextUrl });
        Alert.alert("Photo saved");
      }
    } catch (error) {
      Alert.alert("Photo not uploaded", error.message);
    }
  }

  async function submit() {
    setSaving(true);
    try {
      await saveProfile({ username, bio, instagramUrl, city, interests, avatarUrl });
      Alert.alert("Profile saved");
    } catch (error) {
      Alert.alert("Profile not saved", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>PROFILE</Text>
      <Text style={{ fontSize: type.title, lineHeight: type.titleLine, fontWeight: "900" }}>Your social signal.</Text>
      <Card style={{ gap: 8 }}>
        <Text style={{ fontWeight: "900" }}>Referral code</Text>
        <Text style={{ fontSize: 22, fontFamily: "monospace" }}>{profile?.referralCode || "NEWUSER"}</Text>
        <Text style={{ color: theme.colors.muted }}>3 invites to profile boost</Text>
      </Card>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar uri={avatarUrl} username={username} size={78} />
          <Button title="Upload photo" variant="secondary" onPress={pickPhoto} style={{ flex: 1 }} />
        </View>
        <Text style={fieldLabel}>Username</Text>
        <TextInput placeholder="your_username" placeholderTextColor={theme.colors.muted} value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" style={input} />
        <Text style={fieldLabel}>Short bio</Text>
        <TextInput placeholder="Tell people what you like" placeholderTextColor={theme.colors.muted} value={bio} onChangeText={setBio} multiline style={[input, { height: 100, textAlignVertical: "top" }]} />
        <Text style={fieldLabel}>Instagram URL</Text>
        <TextInput placeholder="https://instagram.com/yourname" placeholderTextColor={theme.colors.muted} value={instagramUrl} onChangeText={setInstagramUrl} autoCapitalize="none" style={input} />
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
        <Button title={saving ? "Saving..." : "Save profile"} onPress={submit} disabled={saving} />
        <Button title="Log out" variant="danger" onPress={signOut} />
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
