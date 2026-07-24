import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const fallbackUrl = "PASTE_SUPABASE_URL_HERE";
const fallbackKey = "PASTE_SUPABASE_PUBLISHABLE_KEY_HERE";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || fallbackUrl;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallbackKey;

export const isSupabaseReady =
  supabaseUrl.startsWith("https://") &&
  supabasePublishableKey.length > 20 &&
  !supabaseUrl.includes("PASTE_") &&
  !supabasePublishableKey.includes("PASTE_");

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
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
