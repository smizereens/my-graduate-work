// import prisma from '../../config/db'; // TODO: Uncomment when DB is ready
// import { Prisma } from '@prisma/client'; // TODO: Uncomment when DB is ready

// Define an interface for the order data payload for creation
export interface CreateOrderPayload {
  client_name: string;
  client_contact?: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number; // Should be a number, Prisma will handle Decimal conversion
  }>;
}

// Define an interface for the order data returned by the service
// This can be expanded based on Prisma model
export interface OrderData {
  id: number;
  order_number: string;
  client_name: string;
  client_contact?: string | null;
  status: string;
  total_amount: number; // Prisma Decimal will be converted to number or string
  created_at: Date;
  updated_at: Date;
  items: Array<{
    id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    item_total_amount: number;
  }>;
}


export const createOrder = async (orderData: CreateOrderPayload): Promise<Partial<OrderData>> => {
  // TODO: Implement actual order creation logic with Prisma
  // 1. Calculate item_total_amount for each item and total_amount for the order.
  // 2. Generate order_number.
  // 3. Use prisma.$transaction to create Order and OrderItems.
  console.log('Order service: createOrder called with data:', orderData);
  const mockOrderId = Math.floor(Math.random() * 1000);
  const mockOrderNumber = `ORD-${new Date().getFullYear()}${mockOrderId}`;
  let calculatedTotalAmount = 0;
  orderData.items.forEach(item => {
    calculatedTotalAmount += item.quantity * item.unit_price;
  });

  return {
    id: mockOrderId,
    order_number: mockOrderNumber,
    client_name: orderData.client_name,
    client_contact: orderData.client_contact,
    status: 'new',
    total_amount: calculatedTotalAmount,
    created_at: new Date(),
    updated_at: new Date(),
    items: orderData.items.map((item, index) => ({
      id: Math.floor(Math.random() * 10000) + index,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      item_total_amount: item.quantity * item.unit_price,
    })),
  };
};

export const getAllOrders = async (): Promise<Partial<OrderData>[]> => {
  // TODO: Implement fetching all orders with Prisma
  console.log('Order service: getAllOrders called');
  return [
    {
      id: 1,
      order_number: 'ORD-2024-001',
      client_name: 'Mock Client 1',
      status: 'new',
      total_amount: 100.50,
      created_at: new Date(),
    }
  ];
};

export const getOrderById = async (id: number): Promise<Partial<OrderData> | null> => {
  // TODO: Implement fetching order by ID with Prisma
  console.log(`Order service: getOrderById called with id: ${id}`);
  if (id === 1) {
    return {
      id: 1,
      order_number: 'ORD-2024-001',
      client_name: 'Mock Client 1',
      client_contact: '123-456-7890',
      status: 'new',
      total_amount: 100.50,
      created_at: new Date(),
      updated_at: new Date(),
      items: [
        { id: 101, item_name: 'Mock Item A', quantity: 2, unit_price: 25.25, item_total_amount: 50.50 }
      ],
    };
  }
  return null;
};

export const updateOrderStatus = async (id: number, status: string): Promise<Partial<OrderData> | null> => {
  // TODO: Implement updating order status with Prisma
  console.log(`Order service: updateOrderStatus called for id: ${id} with status: ${status}`);
   if (id === 1) {
    return {
      id: 1,
      order_number: 'ORD-2024-001',
      client_name: 'Mock Client 1',
      status: status, // updated status
      total_amount: 100.50,
      created_at: new Date(),
      updated_at: new Date(), // should be updated
      items: [
        { id: 101, item_name: 'Mock Item A', quantity: 2, unit_price: 25.25, item_total_amount: 50.50 }
      ],
    };
  }
  return null;
};
