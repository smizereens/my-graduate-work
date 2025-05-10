import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, View, Text, TextInput, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, useRouter, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { IconSymbol } from '@/components/ui/IconSymbol';

// --- Removed Mock API call function ---

// Base URL for the backend API (ensure this is correct for your setup)
const API_BASE_URL = 'http://192.168.0.105:3000/api'; // Updated IP

// Define status styles at the module level
const baseStatusStyles = {
  new: { color: '#007AFF', fontWeight: 'bold' as const },
  processing: { color: '#FF9500', fontWeight: 'bold' as const },
  ready: { color: '#34C759', fontWeight: 'bold' as const },
  completed: { color: '#8E8E93', fontWeight: 'normal' as const },
  cancelled: { color: '#FF3B30', fontWeight: 'normal' as const, textDecorationLine: 'line-through' as const },
};

// Translations for statuses
const statusTranslations = {
  new: 'Новый',
  processing: 'В обработке',
  ready: 'Готов',
  completed: 'Выполнен',
  cancelled: 'Отменен',
};

// Helper function to get status style safely, now accepts colorScheme
const getStatusStyle = (status: string, colorScheme: 'light' | 'dark') => {
  const defaultStyle = { color: Colors[colorScheme].text, fontWeight: 'normal' as const };
  return baseStatusStyles[status as keyof typeof baseStatusStyles] || defaultStyle;
};

export default function OrdersListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(''); // Value directly from TextInput
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // Debounced value for filtering
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null); // null means 'All'

  // Debounce effect for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInputValue);
    }, 300); // 300ms delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  // Memoized filtered list - now uses debouncedSearchQuery
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeStatusFilter) {
      result = result.filter(order => order.status === activeStatusFilter);
    }
    if (debouncedSearchQuery.trim()) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter(order =>
        order.client_name.toLowerCase().includes(lowerCaseQuery) ||
        order.order_number.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return result;
  }, [orders, debouncedSearchQuery, activeStatusFilter]);

  // Remove initial useEffect fetch
  // useEffect(() => {
  //   fetchOrders();
  // }, []); 

  // Function to fetch orders from the real backend (remove useCallback)
  const fetchOrders = async () => { 
    console.log('Fetching orders from API...');
    // Set loading true here, as it's called by both focus effect and refresh
    setIsLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) {
        // Handle HTTP errors like 404 or 500
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data); // Set the orders received from the API
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // Optionally show an error message to the user
      // Alert.alert('Ошибка', 'Не удалось загрузить список заказов.');
      setOrders([]); // Clear orders on error
    } finally {
      // Set loading false here now
      setIsLoading(false); 
      setIsRefreshing(false); 
    }
  }; // Removed useCallback wrapper

  // Use useFocusEffect to fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Don't set isLoading here, fetchOrders does it
      fetchOrders(); // Just call fetchOrders
      
      // Optional: Return a cleanup function if needed
      // return () => console.log('Screen is unfocused');
    }, []) // Empty dependency array, effect runs on focus/blur
  );


  const onRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/orders/[id]' as any, params: { id: item.id.toString() } })}>
      <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle">Заказ #{item.order_number}</ThemedText>
          <ThemedText style={[styles.statusText, getStatusStyle(item.status, colorScheme)]}>
            {statusTranslations[item.status as keyof typeof statusTranslations] || item.status}
          </ThemedText>
        </View>
        <ThemedText>Клиент: {item.client_name}</ThemedText>
        <ThemedText>Сумма: {item.total_amount.toFixed(2)} руб.</ThemedText>
        <ThemedText style={styles.dateText}>Создан: {new Date(item.created_at).toLocaleDateString()}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View style={styles.searchFilterContainer}>
      <TextInput
        style={[styles.searchInput, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].icon }]}
        placeholder="Поиск по клиенту или номеру..."
        value={searchInputValue}
        onChangeText={setSearchInputValue}
        placeholderTextColor={Colors[colorScheme].icon}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterButtonsScroll}>
        <TouchableOpacity
          style={[styles.filterButton, !activeStatusFilter ? styles.filterButtonActive : {}, { backgroundColor: !activeStatusFilter ? Colors[colorScheme].tint : Colors[colorScheme].card, borderColor: Colors[colorScheme].tint }]}
          onPress={() => setActiveStatusFilter(null)}>
          <Text style={[styles.filterButtonText, { color: !activeStatusFilter ? (colorScheme === 'dark' ? Colors.dark.text : '#fff') : Colors[colorScheme].text }]}>Все</Text>
        </TouchableOpacity>
        {Object.entries(statusTranslations).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, activeStatusFilter === key ? styles.filterButtonActive : {}, { backgroundColor: activeStatusFilter === key ? Colors[colorScheme].tint : Colors[colorScheme].card, borderColor: Colors[colorScheme].tint }]}
            onPress={() => setActiveStatusFilter(key)}>
            <Text style={[styles.filterButtonText, { color: activeStatusFilter === key ? '#fff' : Colors[colorScheme].text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyListComponent = () => (
     <View style={styles.centered}>
       <IconSymbol name="doc.text.magnifyingglass" size={64} color={Colors[colorScheme].icon} style={styles.emptyIcon} />
       <ThemedText style={styles.emptyText}>{debouncedSearchQuery || activeStatusFilter ? 'Заказы не найдены' : 'Нет доступных заказов.'}</ThemedText>
       {!debouncedSearchQuery && !activeStatusFilter && (
          <TouchableOpacity onPress={onRefresh} style={[styles.refreshButton, { backgroundColor: Colors[colorScheme].tint }]}>
            <Text style={styles.refreshButtonText}>Обновить</Text>
          </TouchableOpacity>
       )}
     </View>
  );

  // Determine content based on loading and filtered data state
  let content;
  if (isLoading && !isRefreshing) {
    content = (
        <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <ThemedText>Загрузка заказов...</ThemedText>
        </View>
    );
  } else if (filteredOrders.length > 0) {
    content = (
        <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            // ListHeaderComponent={renderListHeader} // Rendered outside now
            // ListEmptyComponent={renderEmptyListComponent} // Handled conditionally now
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
        />
    );
  } else {
    content = renderEmptyListComponent();
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
      {/* Render Header (Search/Filter) always */}
      {renderListHeader()}
      {/* Render content (Loading, List, or Empty State) */}
      <View style={styles.contentContainer}>
        {content}
      </View>
      {/* FAB removed */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: { // Added container for conditional content
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchFilterContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    // Ensure background matches the main background
    // backgroundColor: Colors[useColorScheme() ?? 'light'].background, // Apply background if needed
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  filterButtonsScroll: {
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    // borderColor is set dynamically
  },
  filterButtonActive: {
    // backgroundColor is set dynamically
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80, // Keep padding for FAB
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    color: '#666', // Consider theming this color too
    marginTop: 5,
  },
  // fab styles removed
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
