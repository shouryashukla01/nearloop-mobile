import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";
import { AuthScreen } from "../screens/AuthScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { EventsScreen } from "../screens/EventsScreen";
import { EventDetailScreen } from "../screens/EventDetailScreen";
import { CreateEventScreen } from "../screens/CreateEventScreen";
import { ChatListScreen } from "../screens/ChatListScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { FloatingCreateButton } from "../components/FloatingCreateButton";
import { CityEventNotifier } from "../components/CityEventNotifier";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.paper }}>
      <ActivityIndicator color={theme.colors.coral} />
    </View>
  );
}

function Tabs({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.paper }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.ink,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
          tabBarStyle: {
            height: 78,
            paddingTop: 7,
            paddingBottom: 12,
            borderTopColor: theme.colors.line,
            backgroundColor: theme.colors.white
          },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: "home-outline",
              Events: "calendar-outline",
              Chat: "chatbubble-outline",
              Profile: "person-circle-outline"
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Chat" component={ChatListScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <CityEventNotifier navigation={navigation} />
      <FloatingCreateButton navigation={navigation} />
    </View>
  );
}

export function RootNavigator() {
  const { loading, session, needsOnboarding } = useAuth();
  if (loading) return <LoadingScreen />;

  if (!session) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (needsOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
    </Stack.Navigator>
  );
}
