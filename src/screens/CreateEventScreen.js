import { useState } from "react";
import { Alert, Text, TextInput } from "react-native";
import { MAJOR_INDIAN_CITIES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { createEvent } from "../services/api";
import { theme, typeScale } from "../theme";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CityPicker } from "../components/CityPicker";
import { Screen } from "../components/Screen";

function defaultDateTime() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
}

export function CreateEventScreen({ navigation }) {
  const { user, profile } = useAuth();
  const type = typeScale();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState(profile?.city || MAJOR_INDIAN_CITIES[2]);
  const [capacity, setCapacity] = useState("30");
  const [locationName, setLocationName] = useState("");
  const [dateTime, setDateTime] = useState(defaultDateTime());
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim() || !description.trim() || !locationName.trim() || Number.isNaN(new Date(dateTime).getTime())) {
      Alert.alert("Missing details", "Fill title, description, location, and date/time.");
      return;
    }
    setSaving(true);
    try {
      const created = await createEvent(user, { title, description, city, capacity, locationName, dateTime });
      Alert.alert("Event created", "Invite friends and fill the plan.");
      navigation.replace("EventDetail", { id: created.id });
    } catch (error) {
      Alert.alert("Event was not created", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>NEW PLAN</Text>
      <Text style={{ fontSize: type.title, lineHeight: type.titleLine, fontWeight: "900" }}>Create event</Text>
      <Card style={{ gap: 12 }}>
        <TextInput placeholder="Event title" value={title} onChangeText={setTitle} style={input} />
        <TextInput
          placeholder="What makes this worth joining?"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[input, { height: 110, textAlignVertical: "top" }]}
        />
        <Text style={label}>City</Text>
        <CityPicker value={city} onChange={setCity} />
        <Text style={label}>Max people</Text>
        <TextInput keyboardType="number-pad" value={capacity} onChangeText={setCapacity} style={input} />
        <Text style={label}>Location name</Text>
        <TextInput placeholder="Shyam Nagar, Kanpur" value={locationName} onChangeText={setLocationName} style={input} />
        <Text style={label}>Date/time</Text>
        <TextInput placeholder="2026-07-24T19:00" value={dateTime} onChangeText={setDateTime} autoCapitalize="none" style={input} />
        <Button title={saving ? "Creating..." : "Create and invite"} onPress={submit} disabled={saving} />
        <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
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
  fontSize: 16
};

const label = { fontWeight: "900", color: theme.colors.muted };
