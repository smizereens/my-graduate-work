import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Alert, ActivityIndicator, SafeAreaView, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Base URL for the backend API (ensure this is correct for your setup)
const API_BASE_URL = 'http://192.168.0.105:3000/api'; // Updated IP

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
  const colorScheme = useColorScheme() ?? 'light'; 
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);


  useEffect(() => {
    if (id && typeof id === 'string') { 
      fetchOrderDetails(id);
    } else {
        console.error("Invalid or missing order ID:", id);
        Alert.alert('Ошибка', 'Некорректный ID заказа.');
        setIsLoading(false); 
    }
  }, [id]);

  useEffect(() => {
    if (order && order.order_number) {
      navigation.setOptions({ headerTitle: `Заказ #${order.order_number}` });
    } else if (!isLoading) {
        navigation.setOptions({ headerTitle: 'Детали заказа' });
    }
  }, [order, navigation, isLoading]);

  const fetchOrderDetails = async (orderId: string) => {
    console.log(`Fetching order details from API for ID: ${orderId}`);
    setIsLoading(true);
    setOrder(null); 
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (!response.ok) {
        if (response.status === 404) {
            Alert.alert('Ошибка', 'Заказ не найден.');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        setOrder(null); 
      } else {
        const data = await response.json();
        setOrder(data); 
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
      Alert.alert('Ошибка сети', 'Не удалось загрузить детали заказа.');
      setOrder(null); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || typeof id !== 'string' || !order) return;
    setStatusModalVisible(false); 
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setOrder(responseData); // Update local state with the full updated order from backend
        Alert.alert('Успех', 'Статус заказа обновлен.'); // Removed "(локально)"
      } else {
        Alert.alert('Ошибка', responseData.error || responseData.message || 'Не удалось обновить статус.');
      }
    } catch (error: any) {
      console.error('API call failed (updateStatus):', error);
      Alert.alert('Ошибка сети', 'Не удалось обновить статус заказа.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = () => {
    if (!id || typeof id !== 'string' || !order) return;

    Alert.alert(
      "Подтверждение удаления",
      `Вы уверены, что хотите удалить заказ #${order.order_number}? Это действие необратимо.`,
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive", 
          onPress: async () => {
            setIsLoading(true); // Use general loading indicator
            try {
              const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'DELETE',
              });
              if (response.ok) { // Status 204 No Content is also ok
                Alert.alert('Успех', 'Заказ успешно удален.');
                router.back(); // Go back to the list
              } else {
                const responseData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty if fails
                Alert.alert('Ошибка', responseData.error || responseData.message || 'Не удалось удалить заказ.');
              }
            } catch (error: any) {
              console.error('API call failed (deleteOrder):', error);
              Alert.alert('Ошибка сети', 'Не удалось связаться с сервером.');
            } finally {
              setIsLoading(false);
            }
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <ThemedText>Загрузка деталей заказа...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.centered}>
            <ThemedText>Не удалось загрузить информацию о заказе.</ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.buttonTextLink}>Назад к списку</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusLabel = STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
            <ThemedText type="subtitle">Информация о клиенте</ThemedText>
            <ThemedText>Имя: {order.client_name}</ThemedText>
            <ThemedText>Контакт: {order.client_contact || 'Не указан'}</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
            <ThemedText type="subtitle">Детали заказа</ThemedText>
            <ThemedText>Статус: {currentStatusLabel} {isUpdatingStatus ? '(Обновление...)' : ''}</ThemedText>
            <ThemedText>Сумма: {order.total_amount.toFixed(2)} руб.</ThemedText>
            <ThemedText>Создан: {new Date(order.created_at).toLocaleString()}</ThemedText>
            <ThemedText>Обновлен: {new Date(order.updated_at).toLocaleString()}</ThemedText>

            <TouchableOpacity style={styles.buttonContainer} onPress={() => setStatusModalVisible(true)}>
                <Text style={styles.buttonText}>
                    Изменить статус
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={statusModalVisible}
                onRequestClose={() => {
                    setStatusModalVisible(!statusModalVisible);
                }}>
                <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
                    <Pressable style={[styles.modalView, { backgroundColor: Colors[colorScheme].card }]}>
                        <ThemedText style={styles.modalTitle}>Изменить статус заказа</ThemedText>
                        {STATUS_OPTIONS.map((statusOpt) => (
                            <TouchableOpacity
                                key={statusOpt.value}
                                style={styles.modalOption}
                                onPress={() => handleUpdateStatus(statusOpt.value)}>
                                <ThemedText style={styles.modalOptionText}>{statusOpt.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.modalOption, styles.modalCancelButton]} onPress={() => setStatusModalVisible(false)}>
                             <Text style={styles.modalCancelButtonText}>Отмена</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
            <ThemedText type="subtitle">Позиции заказа</ThemedText>
            {order.items && order.items.length > 0 ? order.items.map((item: any, index: number) => (
                <View key={item.id || index} style={styles.itemContainer}>
                    <ThemedText style={styles.itemName}>{index + 1}. {item.item_name}</ThemedText>
                    <ThemedText>Количество: {item.quantity}</ThemedText>
                    <ThemedText>Цена за ед.: {item.unit_price.toFixed(2)} руб.</ThemedText>
                    <ThemedText>Сумма: {item.item_total_amount.toFixed(2)} руб.</ThemedText>
                    {index < order.items.length - 1 && <View style={[styles.divider, {backgroundColor: Colors[colorScheme].icon }]} />}
                </View>
            )) : (
              <ThemedText style={styles.noItemsText}>Нет позиций в этом заказе.</ThemedText>
            )}
        </ThemedView>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButtonContainer} onPress={handleDeleteOrder}>
            <Text style={styles.deleteButtonText}>Удалить заказ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    // flex: 1, 
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
  card: {
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
  divider: {
    height: 1,
    marginVertical: 10,
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: '#007AFF',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25, 
    alignItems: 'stretch', 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', 
  },
  modalTitle: {
    marginBottom: 20, 
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOption: {
    paddingVertical: 16, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 5, 
  },
  modalOptionText: {
    fontSize: 17, 
  },
  modalCancelButton: {
    marginTop: 15, 
    paddingVertical: 16, 
    width: '100%',
    alignItems: 'center',
  },
  modalCancelButtonText: {
      color: '#FF3B30', 
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
  },
  noItemsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    // color: Colors[useColorScheme() ?? 'light'].icon, // Use a subtle color
  },
  deleteButtonContainer: {
    marginTop: 20,
    marginBottom: 20, // Add some margin at the bottom
    backgroundColor: '#FF3B30', // Red color for delete
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
