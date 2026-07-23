import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getChatThreads } from "../services/api";
import { theme } from "../theme";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";

export function ChatListScreen({ navigation }) {
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
      contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12 }}
      data={threads}
      keyExtractor={(item) => item.user.id}
      ListHeaderComponent={
        <>
          <Text style={{ color: theme.colors.coral, fontWeight: "900", letterSpacing: 1 }}>CHAT</Text>
          <Text style={{ marginTop: 4, marginBottom: 12, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>Talk after intent.</Text>
          {loading ? <ActivityIndicator color={theme.colors.coral} /> : null}
          {!loading && !threads.length ? <Text style={{ color: theme.colors.muted }}>Join an event or follow someone to unlock chat.</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate("ChatRoom", { otherUser: item.user })}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar uri={item.user.avatarUrl} username={item.user.username} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900" }}>@{item.user.username}</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.muted }}>{item.lastMessage}</Text>
            </View>
            {item.unreadCount ? <Text style={{ color: theme.colors.coral, fontWeight: "900" }}>{item.unreadCount}</Text> : null}
          </Card>
        </Pressable>
      )}
    />
  );
}
