import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getEvents, getSuggestedUsers, followUser } from "../services/api";
import { theme } from "../theme";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { EventCard } from "../components/EventCard";
import { Screen } from "../components/Screen";

export function HomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [nextEvents, nextSuggestions] = await Promise.all([getEvents({ city: profile?.city }), getSuggestedUsers()]);
      setEvents(nextEvents);
      setSuggestions(nextSuggestions);
    } catch (error) {
      Alert.alert("Could not load home", error.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, [profile?.city]));

  const header = (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={{ color: theme.colors.coral, fontWeight: "900", letterSpacing: 1 }}>{profile?.city || "NEARBY"}</Text>
          <Text style={{ marginTop: 4, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>Tonight is already moving.</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("CreateEvent")} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.ink, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={28} color={theme.colors.white} />
        </Pressable>
      </View>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name="radio-outline" size={22} color={theme.colors.coral} />
        <Text style={{ fontWeight: "900" }}>12 people near you are active now</Text>
      </Card>

      {suggestions.length ? (
        <View>
          <Text style={{ marginBottom: 10, fontSize: 22, fontWeight: "900" }}>People to meet</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={suggestions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={async () => {
                  try {
                    await followUser(item.id);
                    Alert.alert("Followed", `You followed @${item.username}.`);
                  } catch (error) {
                    Alert.alert("Could not follow", error.message);
                  }
                }}
              >
                <Card style={{ width: 150, alignItems: "center", gap: 8 }}>
                  <Avatar uri={item.avatarUrl} username={item.username} size={58} />
                  <Text numberOfLines={1} style={{ fontWeight: "900" }}>@{item.username}</Text>
                  <Text numberOfLines={1} style={{ color: theme.colors.muted }}>{item.city}</Text>
                </Card>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      <Text style={{ fontSize: 22, fontWeight: "900" }}>Trending plans</Text>
    </View>
  );

  if (loading) {
    return <Screen><ActivityIndicator color={theme.colors.coral} /></Screen>;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.paper }}
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      data={events}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <EventCard
          event={item}
          navigation={navigation}
          onDeleted={(id) => setEvents((current) => current.filter((event) => event.id !== id))}
          onChanged={load}
        />
      )}
    />
  );
}
