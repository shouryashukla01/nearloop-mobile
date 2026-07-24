import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getEvents } from "../services/api";
import { theme } from "../theme";
import { CityPicker } from "../components/CityPicker";
import { EventCard } from "../components/EventCard";

export function EventsScreen({ navigation }) {
  const { profile } = useAuth();
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
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      data={events}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={{ color: theme.colors.coral, fontWeight: "900", letterSpacing: 1 }}>EVENTS</Text>
          <Text style={{ marginTop: 4, marginBottom: 16, fontSize: 34, lineHeight: 38, fontWeight: "900" }}>Join what is filling up nearby.</Text>
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
