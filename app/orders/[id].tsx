import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Alert, ActivityIndicator, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Colors } from '@/constants/Colors'; // Import Colors
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme
// import { Button, Card, List, Divider, Menu } from 'react-native-paper'; // Example

// Mock API call functions (replace with actual API calls)
const getOrderDetailsAPI = async (orderId: string) => {
  console.log('Fetching order details for:', orderId);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          id: orderId,
          order_number: `ORD-${orderId}`,
          client_name: 'Тестовый Клиент Имя',
          client_contact: '123-456-7890',
          status: 'new', // 'new', 'processing', 'ready', 'completed', 'cancelled'
          total_amount: 150.75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            { id: 1, item_name: 'Товар А', quantity: 2, unit_price: 50.00, item_total_amount: 100.00 },
            { id: 2, item_name: 'Услуга Б', quantity: 1, unit_price: 50.75, item_total_amount: 50.75 },
          ],
        },
      });
    }, 500);
  });
};

const updateOrderStatusAPI = async (orderId: string, status: string) => {
  console.log(`Updating order ${orderId} to status ${status}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { status } });
    }, 500);
  });
};


const STATUS_OPTIONS = [
  { label: 'Новый', value: 'new' },
  { label: 'В обработке', value: 'processing' },
  { label: 'Готов', value: 'ready' },
  { label: 'Выполнен', value: 'completed' },
  { label: 'Отменен', value: 'cancelled' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme(); // Get current color scheme
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);


  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (order && order.order_number) {
      navigation.setOptions({ headerTitle: `Заказ #${order.order_number}` }); // Use headerTitle here too
    }
  }, [order, navigation]);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response: any = await getOrderDetailsAPI(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить детали заказа.');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке заказа.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !order) return;
    setMenuVisible(false);
    setIsUpdatingStatus(true);
    try {
      const response: any = await updateOrderStatusAPI(id, newStatus);
      if (response.success) {
        setOrder((prevOrder: any) => ({ ...prevOrder, status: newStatus, updated_at: new Date().toISOString() }));
        Alert.alert('Успех', 'Статус заказа обновлен.');
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить статус.');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при обновлении статуса.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Загрузка деталей заказа...</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Не удалось загрузить информацию о заказе.</ThemedText>
        {/* <Button onPress={() => router.back()}>Назад</Button> */}
         <ThemedText style={styles.buttonTextLink} onPress={() => router.back()}>Назад</ThemedText>
      </ThemedView>
    );
  }

  const currentStatusLabel = STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title is now set in header, so we can remove this ThemedText title or keep for content area */}
        {/* <ThemedText type="title" style={styles.title}>Заказ #{order.order_number}</ThemedText> */}

        {/* Replace with Card from react-native-paper or custom component */}
        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedText type="subtitle">Информация о клиенте</ThemedText>
            <ThemedText>Имя: {order.client_name}</ThemedText>
            <ThemedText>Контакт: {order.client_contact || 'Не указан'}</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedText type="subtitle">Детали заказа</ThemedText>
            <ThemedText>Статус: {currentStatusLabel} {isUpdatingStatus ? '(Обновление...)' : ''}</ThemedText>
            <ThemedText>Сумма: {order.total_amount.toFixed(2)} руб.</ThemedText>
            <ThemedText>Создан: {new Date(order.created_at).toLocaleString()}</ThemedText>
            <ThemedText>Обновлен: {new Date(order.updated_at).toLocaleString()}</ThemedText>

            {/* Placeholder for status change button/menu */}
            <TouchableOpacity style={styles.buttonContainer} onPress={() => setMenuVisible(true)}>
                <Text style={styles.buttonText}>
                    Изменить статус
                </Text>
            </TouchableOpacity>
            {/* Example Menu (needs react-native-paper or custom implementation) */}
            {menuVisible && (
                <ThemedView style={[styles.menuContainer, {backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
                    {STATUS_OPTIONS.map((statusOpt) => (
                        <TouchableOpacity key={statusOpt.value} onPress={() => handleUpdateStatus(statusOpt.value)}>
                            <ThemedText style={styles.menuItem}>
                                {statusOpt.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                     <TouchableOpacity onPress={() => setMenuVisible(false)}>
                        <ThemedText style={[styles.menuItem, styles.menuItemCancel]}>
                            Отмена
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            )}
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedText type="subtitle">Позиции заказа</ThemedText>
            {order.items.map((item: any, index: number) => (
                <View key={item.id} style={styles.itemContainer}>
                    <ThemedText style={styles.itemName}>{index + 1}. {item.item_name}</ThemedText>
                    <ThemedText>Количество: {item.quantity}</ThemedText>
                    <ThemedText>Цена за ед.: {item.unit_price.toFixed(2)} руб.</ThemedText>
                    <ThemedText>Сумма: {item.item_total_amount.toFixed(2)} руб.</ThemedText>
                    {index < order.items.length - 1 && <View style={[styles.divider, {backgroundColor: Colors[colorScheme ?? 'light'].icon }]} />}
                </View>
            ))}
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { // Added SafeAreaView
    flex: 1,
  },
  container: { // This is now the ScrollView's direct child if SafeAreaView is the root
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    // marginBottom: 20, // Title removed from here
    textAlign: 'center',
  },
  card: { // Card styles are now more adaptive
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: { // Placeholder for Divider component
    height: 1,
    // backgroundColor will be set dynamically
    marginVertical: 10,
  },
  buttonContainer: { // Changed ThemedView to TouchableOpacity for better press handling
    marginTop: 20,
    backgroundColor: '#007AFF', // Standard button blue, consider theming later
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLink: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 20,
  },
  menuContainer: { // Placeholder for Menu
    marginTop: 10,
    borderWidth: 1,
    // borderColor: '#ccc', // Use themed border or remove if card bg is enough
    borderRadius: 5,
    // backgroundColor will be set by ThemedView
  },
  menuItem: {
    padding: 15,
    // borderBottomWidth: 1, // Use themed border or remove
    // borderBottomColor: '#eee',
  },
  menuItemCancel: {
      color: 'red',
      borderBottomWidth: 0,
  }
});
