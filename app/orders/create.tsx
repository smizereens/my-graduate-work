import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, TextInput, Button, View } from 'react-native'; // Removed Text import as it's not directly used for Button title
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme
import { Colors } from '@/constants/Colors'; // Import Colors
import { useRouter } from 'expo-router'; // Import useRouter
// import { TextInput as PaperTextInput, Button as PaperButton } from 'react-native-paper'; // Example if using react-native-paper
// import { useNavigation } from 'expo-router';

// Mock API call function (replace with actual API call)
const createOrderAPI = async (orderData: any) => {
  console.log('Submitting order:', orderData);
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // Simulate success
        resolve({ success: true, data: { ...orderData, id: Date.now(), order_number: `ORD-${Date.now()}` } });
      } else { // Simulate failure
        reject(new Error('Failed to create order. Please try again.'));
      }
    }, 1000);
  });
};


export default function CreateOrderScreen() {
  const router = useRouter(); // Initialize router
  // const navigation = useNavigation();
  const colorScheme = useColorScheme(); // Get current color scheme
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [itemName, setItemName] = useState(''); // For a single item in MVP for simplicity
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitOrder = async () => {
    if (!clientName.trim() || !itemName.trim() || !quantity.trim() || !unitPrice.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const orderData = {
      client_name: clientName,
      client_contact: clientContact,
      items: [
        {
          item_name: itemName,
          quantity: parseInt(quantity, 10),
          unit_price: parseFloat(unitPrice),
        },
      ],
    };

    setIsLoading(true);
    try {
      const response: any = await createOrderAPI(orderData);
      if (response.success) {
        Alert.alert(
          'Успех', 
          `Заказ ${response.data.order_number} успешно создан!`,
          [{ text: 'OK', onPress: () => router.back() }] // Add redirect on OK press
        );
        // Clear form after showing alert and potentially navigating back
        setClientName('');
        setClientContact('');
        setItemName('');
        setQuantity('');
        setUnitPrice('');
      } else {
        Alert.alert('Ошибка', 'Не удалось создать заказ. Пожалуйста, попробуйте снова.');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла неизвестная ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <ThemedText type="title" style={styles.title}>Создание нового заказа</ThemedText> Removed, title is in header */}

        <ThemedText style={styles.label}>Имя клиента (обязательно)</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
          placeholder="Введите имя клиента"
          value={clientName}
          onChangeText={setClientName}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon} // Use a themed placeholder color
        />

        <ThemedText style={styles.label}>Контакт клиента</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
          placeholder="Телефон или email"
          value={clientContact}
          onChangeText={setClientContact}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
        />

        <ThemedText type="subtitle" style={styles.subtitle}>Позиция заказа</ThemedText>
        <ThemedText style={styles.label}>Наименование товара/услуги (обязательно)</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
          placeholder="Название товара или услуги"
          value={itemName}
          onChangeText={setItemName}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
        />

        <ThemedText style={styles.label}>Количество (обязательно)</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
          placeholder="0"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
        />

        <ThemedText style={styles.label}>Цена за единицу (обязательно)</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
          placeholder="0.00"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
        />

        <View style={styles.buttonWrapper}>
          <Button
            title={isLoading ? 'Создание...' : 'Создать заказ'}
            onPress={handleSubmitOrder}
            disabled={isLoading}
            color="#007AFF"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    // color: styles.container.backgroundColor === '#000' ? '#fff' : '#000' // Adjust label color for theme
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // Default border color
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
    // color: styles.container.backgroundColor === '#000' ? '#fff' : '#000', // Adjust text color for theme
    // backgroundColor: styles.container.backgroundColor === '#000' ? '#333' : '#fff', // Adjust background for theme
  },
  buttonWrapper: {
    marginTop: 30,
    borderRadius: 8, // For Android ripple effect if needed
    overflow: 'hidden', // For Android ripple effect
  }
  // Removed buttonContainer and buttonText as react-native Button handles its own styling mostly
});
