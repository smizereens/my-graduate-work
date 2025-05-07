import React from 'react';
import { StyleSheet, View, Button, Linking, Alert, SafeAreaView, TouchableOpacity, Text } from 'react-native'; // Import TouchableOpacity, Text
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants'; // To get app version
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme
import { Colors } from '@/constants/Colors'; // Import Colors

export default function ProfileScreen() {
  const colorScheme = useColorScheme(); // Get color scheme
  const appVersion = Constants.expoConfig?.version || 'N/A';
  const appName = Constants.expoConfig?.name || 'Мое Приложение';

  const handleLogout = () => {
    // TODO: Implement actual logout logic when authentication is added
    Alert.alert('Выход', 'Функция выхода будет реализована позже.');
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Ошибка', `Не удалось открыть ссылку: ${url}`);
    }
  };

  return (
    // Wrap everything in SafeAreaView and apply background color
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* ThemedView is still useful for content padding and potentially different background if needed */}
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Профиль</ThemedText>

        {/* Use ThemedView for sections if background adaptation is needed */}
      <View style={styles.infoSection}>
        {/* Ensure all text is within ThemedText */}
        <ThemedText type="defaultSemiBold" style={styles.infoLabel}>Название приложения:</ThemedText>
        <ThemedText type="default" style={styles.infoValue}>{appName}</ThemedText>
      </View>

      <View style={styles.infoSection}>
        <ThemedText type="defaultSemiBold" style={styles.infoLabel}>Версия:</ThemedText>
        <ThemedText type="default" style={styles.infoValue}>{appVersion}</ThemedText>
      </View>

      {/* Example Links - replace or remove as needed */}
      <View style={styles.linksSection}>
        <ThemedText type="subtitle" style={styles.linksTitle}>Полезные ссылки</ThemedText>
        {/* Using standard Button, which might not adapt to theme well */}
        <Button title="Веб-сайт поддержки" onPress={() => openLink('https://example.com/support')} />
        <View style={styles.buttonSpacer} />
        <Button title="Политика конфиденциальности" onPress={() => openLink('https://example.com/privacy')} />
      </View>

      {/* Replace standard Button with TouchableOpacity and ThemedText */}
      <TouchableOpacity style={styles.logoutButtonTouchable} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выход</Text>
      </TouchableOpacity>
      {/* <View style={styles.logoutButtonContainer}>
        <Button
          title="Выход"
          onPress={handleLogout}
          color="#FF3B30" // Red color for logout
        />
      </View> */}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { // Style for SafeAreaView
    flex: 1,
  },
  container: { // Style for the inner ThemedView
    flex: 1,
    padding: 20,
    // No need for flex: 1 here if SafeAreaView has it
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Use themed color later
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
  },
  linksSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  linksTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 10,
  },
  // logoutButtonContainer: { // Style for the old Button View wrapper
  //   marginTop: 30,
  //   marginBottom: 20,
  // },
  logoutButtonTouchable: { // Style for the new TouchableOpacity
    marginTop: 40, // Increased margin slightly
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FF3B30', // Red background
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: { // Style for the text inside the TouchableOpacity
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
});
