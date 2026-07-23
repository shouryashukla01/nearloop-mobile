import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { mapMessage } from "../lib/mappers";
import { supabase } from "../lib/supabase";
import { getMessages, sendMessage } from "../services/api";
import { theme } from "../theme";
import { Avatar } from "../components/Avatar";

export function ChatScreen({ route }) {
  const { user } = useAuth();
  const { otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const insets = useSafeAreaInsets();

  function merge(nextMessages) {
    setMessages((current) => {
      const ids = new Set(current.map((item) => item.id));
      const merged = [...current];
      nextMessages.forEach((message) => {
        if (!ids.has(message.id)) merged.push(message);
      });
      return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
  }

  async function load() {
    try {
      merge(await getMessages(user.id, otherUser.id));
    } catch (error) {
      Alert.alert("Could not load messages", error.message);
    }
  }

  useEffect(() => {
    load();
    const intervalId = setInterval(load, 2500);
    const pair = [user.id, otherUser.id].sort().join(":");
    const channel = supabase
      .channel(`chat:${pair}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const message = mapMessage(payload.new);
        const belongs =
          (message.senderId === user.id && message.receiverId === otherUser.id) ||
          (message.senderId === otherUser.id && message.receiverId === user.id);
        if (belongs) merge([message]);
      })
      .subscribe();
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [otherUser.id, user.id]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length]);

  async function submit() {
    const value = text.trim();
    if (!value) return;
    setText("");
    try {
      merge([await sendMessage(user.id, otherUser.id, value)]);
    } catch (error) {
      Alert.alert("Message not sent", error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.colors.paper, paddingTop: insets.top }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.line, backgroundColor: theme.colors.white }}>
        <Avatar uri={otherUser.avatarUrl} username={otherUser.username} />
        <View>
          <Text style={{ fontWeight: "900" }}>@{otherUser.username}</Text>
          <Text style={{ color: theme.colors.muted }}>chat unlocked</Text>
        </View>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14, gap: 8 }}
        renderItem={({ item }) => {
          const mine = item.senderId === user.id;
          return (
            <View style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
              <View style={{ maxWidth: "78%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: mine ? theme.colors.ink : theme.colors.white }}>
                <Text style={{ color: mine ? theme.colors.white : theme.colors.ink }}>{item.message}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: "row", gap: 8, padding: 12, paddingBottom: Math.max(12, insets.bottom), backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.line }}>
        <TextInput value={text} onChangeText={setText} placeholder="Message" style={{ flex: 1, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 999, paddingHorizontal: 16, minHeight: 48 }} />
        <Pressable onPress={submit} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.coral }}>
          <Ionicons name="send" color={theme.colors.white} size={20} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
