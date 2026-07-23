export function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    bio: row.bio || "",
    avatarUrl: row.avatar_url || null,
    instagramUrl: row.instagram_url || "",
    city: row.city || "Bangalore",
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    interests: row.interests || [],
    followers: Number(row.followers || 0),
    following: Number(row.following || 0),
    eventsAttended: Number(row.events_attended || 0),
    referralCode: row.referral_code || "NEWUSER",
    activeThisWeekend: Boolean(row.active_this_weekend),
    mutuals: Number(row.mutuals || 0),
    isFollowing: Boolean(row.is_following)
  };
}

export function mapEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    city: row.city,
    locationName: row.location_name,
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    dateTime: row.date_time,
    createdBy: row.created_by,
    createdAt: row.created_at,
    capacity: Number(row.capacity || 30),
    imageUrl: row.image_url,
    creator: {
      id: row.created_by,
      username: row.creator_username || "host",
      avatarUrl: row.creator_avatar_url || null
    },
    participantCount: Number(row.participant_count || 0),
    distanceKm: row.distance_km || null,
    participants: Array.isArray(row.participants) ? row.participants.map(mapProfile) : []
  };
}

export function mapMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message,
    createdAt: row.created_at,
    seen: Boolean(row.seen)
  };
}

export function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function compactDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
