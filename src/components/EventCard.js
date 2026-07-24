import { Alert, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { compactDate } from "../lib/mappers";
import { deleteEvent, joinEvent } from "../services/api";
import { shadow, theme } from "../theme";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

export function EventCard({ event, navigation, onDeleted, onChanged }) {
  const { user } = useAuth();
  const mine = user?.id === event.createdBy;

  async function join() {
    try {
      await joinEvent(user, event.id);
      onChanged?.();
      Alert.alert("Spot reserved", "Participant chat is now unlocked.");
    } catch (error) {
      Alert.alert("Could not join", error.message);
    }
  }

  function confirmDelete() {
    Alert.alert("Delete event", `Delete "${event.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(user, event.id);
            onDeleted?.(event.id);
          } catch (error) {
            Alert.alert("Could not delete", error.message);
          }
        }
      }
    ]);
  }

  return (
    <View style={[{ backgroundColor: theme.colors.white, borderRadius: theme.radius, overflow: "hidden", borderWidth: 1, borderColor: theme.colors.line }, shadow]}>
      <Pressable onPress={() => navigation.navigate("EventDetail", { id: event.id, event })}>
        {event.imageUrl ? <Image source={{ uri: event.imageUrl }} style={{ width: "100%", height: 180 }} /> : null}
      </Pressable>
      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: "900", color: theme.colors.ink }}>
              {event.title}
            </Text>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Avatar uri={event.creator.avatarUrl} username={event.creator.username} size={28} />
              <Text style={{ color: theme.colors.muted }}>@{event.creator.username}</Text>
            </View>
          </View>
          {mine ? (
            <Pressable onPress={confirmDelete} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, borderWidth: 1, borderColor: theme.colors.line }}>
              <Ionicons name="trash-outline" size={19} color={theme.colors.coral} />
            </Pressable>
          ) : null}
        </View>
        <Text numberOfLines={2} style={{ color: theme.colors.muted, lineHeight: 21 }}>
          {event.description}
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.muted }}>{compactDate(event.dateTime)}</Text>
          <Text style={{ color: theme.colors.muted }}>{event.locationName}, {event.city}</Text>
          <Text style={{ color: theme.colors.muted }}>{event.participantCount} of {event.capacity} going</Text>
        </View>
        <Button title="Join event" onPress={join} />
      </View>
    </View>
  );
}
