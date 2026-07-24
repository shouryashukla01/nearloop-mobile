import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { mapEvent, mapMessage, mapProfile, toSlug } from "../lib/mappers";

const eventImage = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80";

export async function getCurrentProfile(user) {
  if (!user) return null;
  const { data, error } = await supabase.rpc("current_profile");
  if (error) throw error;
  if (data) {
    const { data: ownRow } = await supabase.from("users").select("interests").eq("id", user.id).maybeSingle();
    return mapProfile({ ...data, interests: ownRow?.interests || [] });
  }

  const username = `user_${user.id.slice(0, 8)}`;
  const { error: createError } = await supabase.from("users").upsert({
    id: user.id,
    username,
    city: "Bangalore",
    interests: [],
    last_active_at: new Date().toISOString()
  });
  if (createError) throw createError;
  return getCurrentProfile(user);
}

export async function saveProfile(user, values) {
  const payload = {
    id: user.id,
    username: values.username.trim(),
    bio: values.bio || "",
    instagram_url: values.instagramUrl || "",
    city: values.city || "Bangalore",
    interests: values.interests || [],
    avatar_url: values.avatarUrl || null,
    last_active_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from("users").upsert(payload).select("*").single();
  if (error) throw error;
  return mapProfile(data);
}

export async function uploadAvatar(user) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Photo permission is needed.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
    base64: true
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.base64) throw new Error("Could not read this image.");

  const ext = asset.fileName?.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from("avatars").upload(path, decode(asset.base64), {
    contentType: asset.mimeType || "image/jpeg",
    upsert: true
  });
  if (error) throw error;

  const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(data.path);
  return publicData.publicUrl;
}

export async function getEvents({ city, radiusKm = 50, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc("nearby_events", {
    p_city: city || null,
    p_latitude: null,
    p_longitude: null,
    p_radius_km: radiusKm,
    p_limit: 30,
    p_offset: offset
  });
  if (error) throw error;
  return (data || []).map(mapEvent);
}

export async function getEventDetail(identifier) {
  const { data, error } = await supabase.rpc("event_detail", { p_identifier: identifier });
  if (error) throw error;
  return mapEvent(data);
}

export async function createEvent(user, values) {
  const slug = `${toSlug(values.title)}-${toSlug(values.city)}-${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: values.title.trim(),
      slug,
      description: values.description.trim(),
      city: values.city,
      location_name: values.locationName.trim(),
      date_time: new Date(values.dateTime).toISOString(),
      capacity: Number(values.capacity || 30),
      image_url: eventImage,
      created_by: user.id
    })
    .select("id,slug,title")
    .single();
  if (error) throw error;
  await supabase.from("event_participants").insert({ event_id: data.id, user_id: user.id });
  return data;
}

export async function joinEvent(user, eventId) {
  const { error } = await supabase.from("event_participants").insert({ event_id: eventId, user_id: user.id });
  if (error && error.code !== "23505") throw error;
}

export async function deleteEvent(user, eventId) {
  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("created_by", user.id);
  if (error) throw error;
}

export async function getSuggestedUsers() {
  const { data, error } = await supabase.rpc("suggested_users", { p_limit: 10 });
  if (error) throw error;
  return (data || []).map(mapProfile);
}

export async function followUser(userId) {
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) throw new Error("Login required.");
  const { error } = await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: userId });
  if (error && error.code !== "23505") throw error;
}

export async function getChatThreads() {
  const { data, error } = await supabase.rpc("chat_threads");
  if (error) throw error;
  return (data || []).map((row) => ({
    user: mapProfile(row),
    lastMessage: row.last_message || "Say hello",
    lastMessageAt: row.last_message_at || new Date().toISOString(),
    unreadCount: Number(row.unread_count || 0),
    unlocked: Boolean(row.unlocked),
    unlockReason: row.unlock_reason || "locked"
  }));
}

export async function getMessages(currentUserId, otherUserId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,receiver_id,message,created_at,seen")
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data || []).map(mapMessage);
}

export async function sendMessage(currentUserId, receiverId, message) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: currentUserId, receiver_id: receiverId, message })
    .select("id,sender_id,receiver_id,message,created_at,seen")
    .single();
  if (error) throw error;
  return mapMessage(data);
}
