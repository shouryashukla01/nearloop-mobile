import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getChatThreads } from "../services/api";
import { theme, typeScale } from "../theme";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";

export function ChatListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const type = typeScale();
  const horizontalPadding = width < 360 ? 14 : 18;
  const topPadding = Math.max(insets.top + 12, 24);
  const bottomPadding = Math.max(insets.bottom + 124, 150);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setThreads(await getChatThreads());
    } catch (error) {
      Alert.alert("Could not load chat", error.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.paper }}
      contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: topPadding, paddingBottom: bottomPadding, gap: 12 }}
      data={threads}
      keyExtractor={(item) => item.user.id}
      ListHeaderComponent={
        <>
          <Text style={{ color: theme.colors.coral, fontSize: type.eyebrow, fontWeight: "900", letterSpacing: 0 }}>CHAT</Text>
          <Text style={{ marginTop: 4, marginBottom: 12, fontSize: type.title, lineHeight: type.titleLine, fontWeight: "900" }}>Talk after intent.</Text>
          {loading ? <ActivityIndicator color={theme.colors.coral} /> : null}
          {!loading && !threads.length ? <Text style={{ color: theme.colors.muted }}>Join an event or follow someone to unlock chat.</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate("ChatRoom", { otherUser: item.user })}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar uri={item.user.avatarUrl} username={item.user.username} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: type.cardTitle, fontWeight: "900" }}>@{item.user.username}</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.muted }}>{item.lastMessage}</Text>
            </View>
            {item.unreadCount ? <Text style={{ color: theme.colors.coral, fontWeight: "900" }}>{item.unreadCount}</Text> : null}
          </Card>
        </Pressable>
      )}
    />
  );
}
