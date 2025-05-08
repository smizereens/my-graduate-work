import { Tabs, useRouter } from 'expo-router'; // Import useRouter
import React, { useState } from 'react'; // Import useState
import { Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics'; // Import Haptics

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const handleOrdersTabLongPress = () => {
    // Trigger haptic feedback when menu is about to show
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
    setIsContextMenuVisible(true);
  };

  const navigateToCreateOrder = () => {
    setIsContextMenuVisible(false);
    router.push('/orders/create');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Заказы',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.portrait.fill" color={color} />,
          // Pass onLongPress to the HapticTab component for this specific tab
          // This requires HapticTab to accept and use onLongPress
          // We will assume HapticTab passes {...props} to PlatformPressable which includes onLongPress
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onLongPress={handleOrdersTabLongPress}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      </Tabs>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isContextMenuVisible}
        onRequestClose={() => {
          setIsContextMenuVisible(!isContextMenuVisible);
        }}>
        <BlurView intensity={50} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsContextMenuVisible(false)} // Close on press outside
          >
            <View style={[styles.contextMenu, { backgroundColor: Colors[colorScheme].card }]}>
              <TouchableOpacity style={styles.contextMenuItem} onPress={navigateToCreateOrder}>
                {/* Text first */}
                <Text style={[styles.contextMenuText, { color: Colors[colorScheme].text }]}>Новый заказ</Text>
                {/* Icon second */}
                <IconSymbol name="plus.circle.fill" size={22} color={Colors[colorScheme].tint} style={styles.contextMenuIcon} />
              </TouchableOpacity>
              {/* Add other context menu items here if needed */}
            </View>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Position content at the bottom
    alignItems: 'flex-start', // Align menu to the left
    // Adjust paddingBottom and paddingLeft carefully to position above the first tab
    paddingBottom: Platform.OS === 'ios' ? 95 : 75, // Increased padding slightly more
    paddingLeft: 20, // Add left padding
  },
  contextMenu: {
    borderRadius: 14,
    // padding: 10, // Use padding inside items instead
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Shadow upwards
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 5,
    elevation: 10,
    minWidth: 200, // Can adjust width if needed
    overflow: 'hidden', // Ensure children respect border radius
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out text and icon
    paddingVertical: 12, // Adjusted padding back
    paddingHorizontal: 15, // Adjusted padding back
  },
  contextMenuIcon: {
    // marginRight: 18, // Remove margin, rely on space-between
    marginLeft: 15, // Add margin to the left of the icon (which is now on the right)
  },
  contextMenuText: {
    fontSize: 17,
    fontWeight: '500', // Slightly bolder text like Telegram
  },
});
