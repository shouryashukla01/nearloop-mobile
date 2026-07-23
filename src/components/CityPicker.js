import { Pressable, ScrollView, Text } from "react-native";
import { MAJOR_INDIAN_CITIES } from "../constants";
import { theme } from "../theme";

export function CityPicker({ value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {MAJOR_INDIAN_CITIES.map((city) => {
        const active = city === value;
        return (
          <Pressable
            key={city}
            onPress={() => onChange(city)}
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? theme.colors.ink : theme.colors.line,
              backgroundColor: active ? theme.colors.ink : theme.colors.white,
              paddingHorizontal: 14,
              paddingVertical: 10
            }}
          >
            <Text style={{ color: active ? theme.colors.white : theme.colors.ink, fontWeight: "800" }}>{city}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
