# NearLoop Expo Mobile App

This is a real React Native + Expo app. It does not use WebView. It talks directly to your existing Supabase backend.

## File Structure

```text
nearloop-expo-app/
  App.js
  app.json
  eas.json
  package.json
  .env.example
  .eas/workflows/build.yml
  .eas/workflows/submit.yml
  assets/README.md
  src/
    constants.js
    theme.js
    components/
      Avatar.js
      Button.js
      Card.js
      CityPicker.js
      EventCard.js
      Screen.js
    context/
      AuthContext.js
    lib/
      mappers.js
      supabase.js
    navigation/
      RootNavigator.js
    screens/
      AuthScreen.js
      ChatListScreen.js
      ChatScreen.js
      CreateEventScreen.js
      EventDetailScreen.js
      EventsScreen.js
      HomeScreen.js
      OnboardingScreen.js
      ProfileScreen.js
    services/
      api.js
```

## Features Included

```text
Email/password login and signup
Persistent Supabase session
Onboarding profile setup
Home feed
Events feed
Create event
Join event
Delete your own event
People suggestions and follow
Chat list
Realtime chat plus 2.5-second fallback refresh
Profile edit
Avatar upload to Supabase Storage
Bottom tab navigation
Modern mobile UI
Expo Go preview
EAS cloud build config
```

## Supabase Setup

1. Open Supabase Dashboard.
2. Open your project.
3. Go to Authentication > Providers > Email.
4. Keep Email provider enabled.
5. For instant email/password login, turn off Confirm email.
6. Go to Project Settings > API.
7. Copy Project URL.
8. Copy Publishable key.
9. Open `src/lib/supabase.js`.
10. Replace:

```js
const fallbackUrl = "PASTE_SUPABASE_URL_HERE";
const fallbackKey = "PASTE_SUPABASE_PUBLISHABLE_KEY_HERE";
```

with your real values.

For production, use Expo environment variables instead:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Required Supabase SQL

Your current schema already contains most of this. Make sure this event delete policy exists:

```sql
drop policy if exists "Creators delete events" on public.events;
create policy "Creators delete events" on public.events
for delete using (auth.uid() = created_by);
```

Make sure realtime has events and messages enabled:

```sql
do $$
begin
  alter publication supabase_realtime add table public.events;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
```

Make sure the avatar bucket exists:

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
```

## Preview Using Expo Snack

1. Open https://snack.expo.dev.
2. Click Create Snack.
3. In the left file panel, create the same files and folders from the structure above.
4. Paste each file from this project.
5. Open `package.json` and make sure the dependencies are pasted.
6. Open `src/lib/supabase.js` and paste your Supabase URL and publishable key.
7. Install Expo Go on your Android or iPhone.
8. In Snack, click the QR code or Share button.
9. Scan the QR code with Expo Go.

Snack is best for previewing. For store builds, use GitHub + EAS.

## Web-Based EAS Build Flow

1. Create a new GitHub repository.
2. Upload the contents of `nearloop-expo-app` to the repository root.
3. Open https://expo.dev and sign in.
4. Create or open your Expo project.
5. Open Project Settings > GitHub.
6. Install the Expo GitHub App.
7. Link your GitHub repository.
8. Open Project Settings > Environment variables.
9. Add:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

10. Open Builds.
11. Click Build from GitHub.
12. Choose branch `main`.
13. Choose platform `Android`.
14. Choose profile `preview`.
15. Start build.
16. Download the APK from the build page and install it on your Android phone.

For iOS preview, choose platform `iOS`. iOS device builds require an Apple Developer account and Apple signing credentials.

## Store Builds

Android Play Store:

1. In Expo Builds, click Build from GitHub.
2. Choose Android.
3. Choose profile `production`.
4. Wait for the `.aab`.
5. Open Google Play Console.
6. Click Create app.
7. Open Testing > Internal testing.
8. Click Create new release.
9. Upload the `.aab` from Expo.
10. Complete store listing, privacy policy, app access, data safety, and content rating.
11. Submit for review.

iOS App Store:

1. Join Apple Developer Program.
2. Create the app in App Store Connect.
3. In Expo, configure iOS credentials for bundle id `com.yourname.nearloop`.
4. Run the `Build and Submit Stores` workflow from Expo Workflows, or build iOS production and submit it from Expo.
5. In App Store Connect, complete screenshots, privacy, age rating, and app review information.
6. Submit for review.

## Important Edits Before Release

```text
app.json > expo.ios.bundleIdentifier
app.json > expo.android.package
app.json > expo.extra.eas.projectId
assets/icon.png
assets/splash.png
assets/adaptive-icon.png
```

Use unique identifiers, for example:

```text
com.shouryashukla.nearloop
```

## Upload These Files

Upload the whole `nearloop-expo-app` folder to GitHub. Do not upload `node_modules`.
