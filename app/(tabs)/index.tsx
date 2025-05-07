import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, View, Text } from 'react-native'; // Added View, Text
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Import IconSymbol for empty state
// import { Card, FAB } from 'react-native-paper'; // Example

// Mock API call function (replace with actual API call)
const getOrdersAPI = async () => {
  console.log('Fetching orders list...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [
          { id: '101', order_number: 'ORD-101', client_name: 'Клиент Альфа', status: 'new', total_amount: 120.50, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: '102', order_number: 'ORD-102', client_name: 'Клиент Бета', status: 'processing', total_amount: 75.00, created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: '103', order_number: 'ORD-103', client_name: 'Клиент Гамма', status: 'ready', total_amount: 250.00, created_at: new Date().toISOString() },
        ],
      });
    }, 800);
  });
};


export default function OrdersListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme(); // Call hook at the top level
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response: any = await getOrdersAPI();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    // Replace with Card from react-native-paper or custom component
    // TODO: Remove 'as any' once Expo Router types are correctly generated for /orders/[id]
    <TouchableOpacity onPress={() => router.push({ pathname: '/orders/[id]' as any, params: { id: item.id.toString() } })}>
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <ThemedText type="subtitle">Заказ #{item.order_number}</ThemedText>
        <ThemedText>Клиент: {item.client_name}</ThemedText>
        <ThemedText>Статус: {item.status}</ThemedText>
        <ThemedText>Сумма: {item.total_amount.toFixed(2)} руб.</ThemedText>
        <ThemedText style={styles.dateText}>Создан: {new Date(item.created_at).toLocaleDateString()}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Загрузка заказов...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.container}>
        {orders.length === 0 && !isLoading ? (
          // Improved Empty State View
          <View style={styles.centered}>
            <IconSymbol name="doc.text.magnifyingglass" size={64} color={Colors[colorScheme ?? 'light'].icon} style={styles.emptyIcon} />
            <ThemedText style={styles.emptyText}>Нет доступных заказов.</ThemedText>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Обновить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
        )}
        {/* Replace with FAB from react-native-paper */}
        {/* TODO: Remove 'as any' once Expo Router types are correctly generated for /orders/create */}
        <Link href={{ pathname: '/orders/create' as any }} asChild>
          <TouchableOpacity style={styles.fab}>
            <ThemedText style={styles.fabText}>+</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80, // Increased paddingBottom to avoid FAB overlapping last item and tab bar
  },
  card: { // Card styles are now more adaptive
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  fab: { // Placeholder for FAB
    position: 'absolute',
    right: 16,
    bottom: 70, // Increased bottom margin to be above a typical tab bar (e.g., 50-60 for tab bar + 10-16 margin)
    backgroundColor: '#007AFF', // Example FAB color
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
  },
  // Styles for Empty State
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    // Use the colorScheme variable obtained at the top level
    // backgroundColor: Colors[colorScheme ?? 'light'].tint, // This needs to be applied dynamically or passed down
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff', // White text on tint background
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Removed linkText style as it's replaced by refreshButton
});
