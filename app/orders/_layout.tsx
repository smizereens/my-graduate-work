import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Assuming IconSymbol can be used for header buttons

export default function OrdersStackLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        // Default options for the stack - show header by default
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Заказы', // Still attempt to set back title globally
        headerTitleAlign: 'center',
      }}
    >
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> // This is incorrect here */}
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> // This is incorrect here */}
      <Stack.Screen
        name="create"
        options={{
          // headerShown: true, // Inherited from screenOptions
          headerTitle: 'Новый заказ',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          // headerShown: true, // Inherited from screenOptions
          headerTitle: '', // Set specific title to empty, rely on component to set it
        }}
      />
    </Stack>
  );
}
