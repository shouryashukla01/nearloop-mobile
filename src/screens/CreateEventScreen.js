import { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
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
  return date;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function safeDate(value) {
  const next = value instanceof Date ? value : new Date(value);
  return Number.isNaN(next.getTime()) ? defaultDateTime() : next;
}

function mergePickedValue(current, picked, mode) {
  const next = safeDate(current);
  if (mode === "date") next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  else next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
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
  const [iosPickerMode, setIosPickerMode] = useState(null);
  const [saving, setSaving] = useState(false);

  function openDateTimePicker(mode) {
    const value = safeDate(dateTime);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: false,
        minimumDate: mode === "date" ? new Date() : undefined,
        onChange: (event, picked) => {
          if (event.type === "set" && picked) {
            setDateTime((current) => mergePickedValue(current, picked, mode));
          }
        }
      });
      return;
    }

    setIosPickerMode(mode);
  }

  async function submit() {
    const selectedDateTime = safeDate(dateTime);
    if (!title.trim() || !description.trim() || !locationName.trim() || Number.isNaN(selectedDateTime.getTime())) {
      Alert.alert("Missing details", "Fill title, description, location, and date/time.");
      return;
    }
    setSaving(true);
    try {
      const created = await createEvent(user, { title, description, city, capacity, locationName, dateTime: selectedDateTime });
      Alert.alert("Event created", "Invite friends and fill the plan.");
      navigation.replace("EventDetail", { id: created.id });
    } catch (error) {
      Alert.alert("Event was not created", error.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedDateTime = safeDate(dateTime);

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
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={() => openDateTimePicker("date")} style={[input, pickerButton, { flex: 1 }]}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.coral} />
            <Text style={pickerText}>{formatDate(selectedDateTime)}</Text>
          </Pressable>
          <Pressable onPress={() => openDateTimePicker("time")} style={[input, pickerButton, { flex: 1 }]}>
            <Ionicons name="time-outline" size={20} color={theme.colors.coral} />
            <Text style={pickerText}>{formatTime(selectedDateTime)}</Text>
          </Pressable>
        </View>
        {Platform.OS === "ios" && iosPickerMode ? (
          <>
            <DateTimePicker
              value={selectedDateTime}
              mode={iosPickerMode}
              display="spinner"
              minimumDate={iosPickerMode === "date" ? new Date() : undefined}
              onChange={(_event, picked) => {
                if (picked) setDateTime((current) => mergePickedValue(current, picked, iosPickerMode));
              }}
            />
            <Button title="Done selecting date/time" variant="secondary" onPress={() => setIosPickerMode(null)} />
          </>
        ) : null}
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

const pickerButton = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingRight: 10
};

const pickerText = {
  flex: 1,
  color: theme.colors.ink,
  fontSize: 15,
  fontWeight: "800"
};
