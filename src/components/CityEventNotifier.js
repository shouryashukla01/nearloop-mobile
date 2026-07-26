import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getEventDetail } from "../services/api";
import { shadow, theme } from "../theme";

export function CityEventNotifier({ navigation }) {
  const { profile, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!profile?.city || !user?.id) return undefined;

    const channel = supabase
      .channel(`city-events:${profile.city}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, async (payload) => {
        const row = payload.new;
        if (!row || row.city !== profile.city || row.created_by === user.id) return;

        const event = await getEventDetail(row.id).catch(() => null);
        setNotice({ id: row.id, title: row.title || "New plan", city: row.city, event });

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setNotice(null), 7000);
      })
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [profile?.city, user?.id]);

  if (!notice) return null;

  function openNotice() {
    setNotice(null);
    navigation.navigate("EventDetail", { id: notice.id, event: notice.event || undefined });
  }

  return (
    <Pressable
      onPress={openNotice}
      style={[
        {
          position: "absolute",
          left: 16,
          right: 16,
          top: Math.max(insets.top + 10, 28),
          zIndex: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.line,
          backgroundColor: theme.colors.white,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10
        },
        shadow
      ]}
    >
      <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.soft }}>
        <Ionicons name="notifications-outline" size={18} color={theme.colors.coral} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.coral, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 }}>NEW PLAN IN {notice.city?.toUpperCase()}</Text>
        <Text numberOfLines={1} style={{ marginTop: 2, fontWeight: "900", color: theme.colors.ink }}>{notice.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
    </Pressable>
  );
}
