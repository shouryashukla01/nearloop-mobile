import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Share, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { compactDate } from "../lib/mappers";
import { deleteEvent, getEventDetail, joinEvent } from "../services/api";
import { theme } from "../theme";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";

export function EventDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const [event, setEvent] = useState(route.params?.event || null);
  const [count, setCount] = useState(route.params?.event?.participantCount || 0);
  const eventId = route.params?.id || route.params?.event?.id;

  const load = useCallback(async () => {
    try {
      const nextEvent = await getEventDetail(eventId);
      setEvent(nextEvent);
      setCount(nextEvent.participantCount);
    } catch (error) {
      Alert.alert("Could not load event", error.message);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  if (!event) return <Screen><Text>Loading event...</Text></Screen>;

  const mine = user?.id === event.createdBy;

  async function join() {
    try {
      await joinEvent(user, event.id);
      setCount((value) => value + 1);
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
            navigation.replace("Tabs", { screen: "Events" });
          } catch (error) {
            Alert.alert("Could not delete", error.message);
          }
        }
      }
    ]);
  }

  async function shareEvent() {
    await Share.share({ message: `I'm going to ${event.title}. Join me on NearLoop.` });
  }

  return (
    <Screen>
      {event.imageUrl ? <Image source={{ uri: event.imageUrl }} style={{ width: "100%", height: 260, borderRadius: theme.radius }} /> : null}
      <Text style={{ color: theme.colors.coral, fontWeight: "900", letterSpacing: 1 }}>{event.city}</Text>
      <Text style={{ fontSize: 38, lineHeight: 42, fontWeight: "900" }}>{event.title}</Text>
      <Text style={{ fontSize: 16, lineHeight: 25, color: theme.colors.muted }}>{event.description}</Text>
      <Card style={{ gap: 10 }}>
        <Row icon="calendar-outline" text={compactDate(event.dateTime)} />
        <Row icon="location-outline" text={`${event.locationName}, ${event.city}`} />
        <Row icon="people-outline" text={`${count} of ${event.capacity} going`} />
      </Card>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar uri={event.creator.avatarUrl} username={event.creator.username} />
        <View>
          <Text style={{ color: theme.colors.muted }}>Hosted by</Text>
          <Text style={{ fontWeight: "900" }}>@{event.creator.username}</Text>
        </View>
      </Card>
      <View style={{ gap: 10 }}>
        <Button title="Join and unlock chat" onPress={join} />
        <Button title="Share event" variant="secondary" onPress={shareEvent} />
        {mine ? <Button title="Delete event" variant="danger" onPress={confirmDelete} /> : null}
        <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

function Row({ icon, text }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Ionicons name={icon} size={20} color={theme.colors.coral} />
      <Text style={{ flex: 1, color: theme.colors.muted }}>{text}</Text>
    </View>
  );
}
