import React, { useState, useEffect } from 'react'; // Added useEffect here
import { StyleSheet, ScrollView, Alert, TextInput, Button, View, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter, useNavigation } from 'expo-router';

// --- Removed Mock API call function ---

// Base URL for the backend API
// IMPORTANT: Replace with your actual backend server address if not running locally
// For Android emulator, use 10.0.2.2 to refer to localhost of the host machine
// For iOS simulator or physical device on same network, use your machine's local IP address
const API_BASE_URL = 'http://192.168.0.105:3000/api'; // Updated IP

// Interface for a single order item in the state
interface OrderItemState {
  name: string;
  quantity: string;
  price: string;
}

// Removed duplicate import: import React, { useState, useEffect } from 'react'; 
// Need to add useEffect to the top import if it's used. Let's check if it is... yes, it is.

export default function CreateOrderScreen() {
  const router = useRouter();
  const navigation = useNavigation(); // Initialize navigation
  const colorScheme = useColorScheme();
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  // State for multiple items, initialized with one empty item
  const [items, setItems] = useState<OrderItemState[]>([{ name: '', quantity: '', price: '' }]);
  const [isLoading, setIsLoading] = useState(false);

  // Set header title using navigation
  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Новый заказ' });
  }, [navigation]);

  // Function to handle changes in item fields
  const handleItemChange = (index: number, field: keyof OrderItemState, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Function to add a new item row
  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '', price: '' }]);
  };

  // Function to remove an item row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
        Alert.alert('Ошибка', 'Должна быть хотя бы одна позиция в заказе.');
        return; // Keep at least one item row
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmitOrder = async () => {
    if (!clientName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя клиента.');
      return;
    }
    // Validate items: check if all fields in all items are filled
    const allItemsValid = items.every(item => item.name.trim() && item.quantity.trim() && item.price.trim());
    const hasAtLeastOneItem = items.length > 0;

    if (!hasAtLeastOneItem) {
       Alert.alert('Ошибка', 'Добавьте хотя бы одну позицию заказа.');
       return;
    }
    if (!allItemsValid) {
        Alert.alert('Ошибка', 'Пожалуйста, заполните все поля (Название, Кол-во, Цена) для каждой позиции заказа.');
        return;
    }

    // Prepare data for API (parse numbers)
    const orderData = {
      client_name: clientName,
      client_contact: clientContact,
      items: items.map(item => ({
        item_name: item.name,
        quantity: parseInt(item.quantity, 10) || 0, // Default to 0 if parsing fails
        unit_price: parseFloat(item.price) || 0.0, // Default to 0.0 if parsing fails
      })),
    };

     // Additional check for valid numbers after parsing
     const hasInvalidNumbers = orderData.items.some(item => isNaN(item.quantity) || item.quantity <= 0 || isNaN(item.unit_price) || item.unit_price < 0);
     if (hasInvalidNumbers) {
         Alert.alert('Ошибка', 'Пожалуйста, введите корректные числовые значения для количества (больше 0) и цены (0 или больше).');
         return;
     }


    setIsLoading(true);
    try {
      // Real API call using fetch
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert(
          'Успех',
          `Заказ ${responseData.order_number} успешно создан!`, // Use order_number from response
          [{ text: 'OK', onPress: () => router.back() }]
        );
        // Clear form
        setClientName('');
        setClientContact('');
        setItems([{ name: '', quantity: '', price: '' }]);
      } else {
        // Handle API errors (e.g., validation errors from backend)
        Alert.alert('Ошибка', responseData.error || responseData.message || 'Не удалось создать заказ.');
      }
    } catch (error: any) {
      console.error('API call failed:', error);
      Alert.alert('Ошибка сети', 'Не удалось связаться с сервером. Убедитесь, что он запущен.');
    } finally {
      setIsLoading(false);
    }
  };

  const themedInputStyle = {
      color: Colors[colorScheme ?? 'light'].text,
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderColor: Colors[colorScheme ?? 'light'].icon // Use icon color for border for subtle contrast
  };
  const themedPlaceholderColor = Colors[colorScheme ?? 'light'].icon;


  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.label}>Имя клиента (обязательно)</ThemedText>
        <TextInput
          style={[styles.input, themedInputStyle]}
          placeholder="Введите имя клиента"
          value={clientName}
          onChangeText={setClientName}
          placeholderTextColor={themedPlaceholderColor}
        />

        <ThemedText style={styles.label}>Контакт клиента</ThemedText>
        <TextInput
          style={[styles.input, themedInputStyle]}
          placeholder="Телефон или email"
          value={clientContact}
          onChangeText={setClientContact}
          placeholderTextColor={themedPlaceholderColor}
        />

        <ThemedText type="subtitle" style={styles.subtitle}>Позиции заказа</ThemedText>

        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInputs}>
              <ThemedText style={styles.itemLabel}>Позиция #{index + 1}</ThemedText>
              <TextInput
                style={[styles.input, themedInputStyle]}
                placeholder="Название товара/услуги"
                value={item.name}
                onChangeText={(value) => handleItemChange(index, 'name', value)}
                placeholderTextColor={themedPlaceholderColor}
              />
              <View style={styles.quantityPriceRow}>
                <TextInput
                  style={[styles.input, styles.quantityInput, themedInputStyle]}
                  placeholder="Кол-во"
                  value={item.quantity}
                  onChangeText={(value) => handleItemChange(index, 'quantity', value)}
                  keyboardType="numeric"
                  placeholderTextColor={themedPlaceholderColor}
                />
                <TextInput
                  style={[styles.input, styles.priceInput, themedInputStyle]}
                  placeholder="Цена за ед."
                  value={item.price}
                  onChangeText={(value) => handleItemChange(index, 'price', value)}
                  keyboardType="numeric"
                  placeholderTextColor={themedPlaceholderColor}
                />
              </View>
            </View>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeItemButton}>
                {/* Using Text for the 'X' symbol */}
                <Text style={styles.removeItemButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.addItemButtonContainer}>
            <Button title="Добавить позицию" onPress={handleAddItem} />
        </View>

        <View style={styles.submitButtonWrapper}>
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
    paddingBottom: 40, // Extra padding at bottom
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
  },
  itemLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    // borderColor: '#ccc', // Set dynamically
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee', // Use themed color later
  },
  itemInputs: {
    flex: 1,
  },
  quantityPriceRow: {
    flexDirection: 'row',
  },
  quantityInput: {
    flex: 1,
    marginRight: 5,
  },
  priceInput: {
    flex: 2,
    marginLeft: 5,
  },
  removeItemButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4, // Smaller padding
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25, // Align roughly with the top input label
  },
  removeItemButtonText: {
    color: '#FF3B30', // Red color for remove
    fontSize: 24, // Larger 'X'
    fontWeight: 'bold',
  },
  addItemButtonContainer: {
      marginTop: 10,
      marginBottom: 30,
  },
  submitButtonWrapper: {
    marginTop: 20, // Adjusted margin
    borderRadius: 8,
    overflow: 'hidden',
  }
});
