import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const fallbackUrl = "https://fvtlkspegtzzaoynrumd.supabase.co";
const fallbackKey = "sb_publishable_o5yAaWtGaSnKx6pL4lWKZQ_8xhsvtF5";

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || fallbackUrl;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabasePublishableKey = String(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallbackKey).trim();

export const isSupabaseReady =
  Boolean(supabaseUrl) &&
  supabasePublishableKey.length > 20 &&
  !supabasePublishableKey.includes("PASTE_");

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabasePublishableKey || "missing-key", {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock
  }
});

if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

function normalizeSupabaseUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed.includes("PASTE_")) return "";

  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!url.hostname.endsWith(".supabase.co")) return "";
    return `https://${url.hostname}`;
  } catch {
    return "";
  }
}
