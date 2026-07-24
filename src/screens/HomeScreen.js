import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getEvents, getSuggestedUsers, followUser } from "../services/api";
import { theme, typeScale } from "../theme";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { EventCard } from "../components/EventCard";
import { Screen } from "../components/Screen";

export function HomeScreen({ navigation }) {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const type = typeScale();
  const horizontalPadding = width < 360 ? 14 : 18;
  const topPadding = Math.max(insets.top + 12, 24);
  const bottomPadding = Math.max(insets.bottom + 124, 150);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
  }, [profile?.city]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const header = (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>{profile?.city || "NEARBY"}</Text>
        <Text style={{ marginTop: 4, maxWidth: width - horizontalPadding * 2, fontSize: type.hero, lineHeight: type.heroLine, fontWeight: "900" }}>
          Tonight is already moving.
        </Text>
      </View>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name="radio-outline" size={22} color={theme.colors.coral} />
        <Text style={{ flex: 1, fontSize: type.body, lineHeight: type.bodyLine, fontWeight: "900" }}>12 people near you are active now</Text>
      </Card>

      {suggestions.length ? (
        <View>
          <Text style={{ marginBottom: 10, fontSize: type.section, fontWeight: "900" }}>People to meet</Text>
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
                  <Text numberOfLines={1} style={{ fontSize: type.cardTitle, fontWeight: "900" }}>@{item.username}</Text>
                  <Text numberOfLines={1} style={{ color: theme.colors.muted }}>{item.city}</Text>
                </Card>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      <Text style={{ fontSize: type.section, fontWeight: "900" }}>Trending plans</Text>
    </View>
  );

  if (loading) {
    return <Screen><ActivityIndicator color={theme.colors.coral} /></Screen>;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.paper }}
      contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: topPadding, paddingBottom: bottomPadding, gap: 14 }}
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
