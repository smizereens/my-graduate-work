import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
// Removed duplicate imports
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  // Removed the onPressIn haptic feedback logic
  // Haptic feedback will now be triggered by the onLongPress handler in the layout
  return (
    <PlatformPressable
      {...props}
      delayLongPress={300} // Set delay directly here (e.g., 300ms)
      // Keep original onPressIn if it exists, but without haptics
      onPressIn={props.onPressIn}
    />
  );
}
