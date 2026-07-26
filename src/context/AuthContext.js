import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { supabase, isSupabaseReady } from "../lib/supabase";
import { getCurrentProfile, saveProfile as saveProfileApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (nextSession) => {
    if (!nextSession?.user) {
      setProfile(null);
      return null;
    }
    const nextProfile = await getCurrentProfile(nextSession.user);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session).catch((error) => Alert.alert("Profile error", error.message));
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) await loadProfile(nextSession).catch(() => undefined);
      else setProfile(null);
    });

    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) Alert.alert("Check email settings", "Disable email confirmation in Supabase for instant login, or confirm this email first.");
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const saveProfile = useCallback(async (values) => {
    const nextProfile = await saveProfileApi(session.user, values);
    setProfile(nextProfile);
    return nextProfile;
  }, [session]);

  const reloadProfile = useCallback(() => loadProfile(session), [loadProfile, session]);

  const value = useMemo(
    () => ({
      isSupabaseReady,
      loading,
      session,
      user: session?.user || null,
      profile,
      needsOnboarding: Boolean(session && (!profile || profile.username?.startsWith("user_"))),
      signIn,
      signUp,
      signOut,
      saveProfile,
      reloadProfile
    }),
    [loading, session, profile, reloadProfile, saveProfile, signIn, signOut, signUp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
