import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getEvents } from "../services/api";
import { theme, typeScale } from "../theme";
import { CityPicker } from "../components/CityPicker";
import { EventCard } from "../components/EventCard";

export function EventsScreen({ navigation }) {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const type = typeScale();
  const horizontalPadding = width < 360 ? 14 : 18;
  const topPadding = Math.max(insets.top + 12, 24);
  const bottomPadding = Math.max(insets.bottom + 124, 150);
  const [city, setCity] = useState(profile?.city || "Bangalore");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextCity = city) => {
    setLoading(true);
    try {
      setEvents(await getEvents({ city: nextCity }));
    } catch (error) {
      Alert.alert("Could not load events", error.message);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useFocusEffect(useCallback(() => { load(city); }, [city, load]));

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.paper }}
      contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: topPadding, paddingBottom: bottomPadding, gap: 14 }}
      data={events}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>EVENTS</Text>
          <Text style={{ marginTop: 4, marginBottom: 16, fontSize: type.title, lineHeight: type.titleLine, fontWeight: "900" }}>
            Join what is filling up nearby.
          </Text>
          <CityPicker
            value={city}
            onChange={(nextCity) => {
              setCity(nextCity);
              load(nextCity);
            }}
          />
          {loading ? <ActivityIndicator style={{ marginTop: 18 }} color={theme.colors.coral} /> : null}
        </>
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          navigation={navigation}
          onDeleted={(id) => setEvents((current) => current.filter((event) => event.id !== id))}
          onChanged={() => load(city)}
        />
      )}
    />
  );
}
