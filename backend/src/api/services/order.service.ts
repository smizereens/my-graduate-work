import prisma from '../../config/db'; 
import { Prisma } from '@prisma/client'; // Only import Prisma namespace

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

// Define PrismaOrderItem type at module level for reusability
type PrismaOrderItem = {
  id: number;
  order_id: number;
  item_name: string;
  quantity: number;
  unit_price: { toNumber: () => number }; // Prisma.Decimal like object
  item_total_amount: { toNumber: () => number }; // Prisma.Decimal like object
  created_at: Date;
  updated_at: Date;
};

// Helper function to generate a simple order number
const generateOrderNumber = (): string => {
    const date = new Date(); // Keep this helper
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
    return `ORD-${year}${month}${day}-${randomSuffix}`;
};

// Use OrderData for return type, Prisma handles Decimal conversion internally
export const createOrder = async (orderData: CreateOrderPayload): Promise<OrderData> => {
  const orderNumber = generateOrderNumber();
  let totalAmount = 0; // Use number for calculation here

  const itemsToCreate = orderData.items.map(item => {
    const itemTotal = item.quantity * item.unit_price;
    totalAmount += itemTotal;
    return {
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price, // Pass as number, Prisma converts to Decimal
      item_total_amount: itemTotal, // Pass as number
    };
  });

  const newOrder = await prisma.order.create({
    data: {
      order_number: orderNumber,
      client_name: orderData.client_name,
      client_contact: orderData.client_contact,
      status: 'new',
      total_amount: totalAmount, // Pass as number
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
    },
  });

  // Manually convert Decimal types from Prisma to number for the OrderData interface
  // Manually convert Decimal types from Prisma to number for the OrderData interface
  // Add explicit type for 'item' in map function, using the generated type for OrderItem
  // This assumes 'OrderItem' is the name of your model in schema.prisma
  // Type definition moved to module level

  return {
    ...newOrder,
    total_amount: newOrder.total_amount.toNumber(), // Convert Decimal to number
    items: newOrder.items.map((item: PrismaOrderItem) => ({
      id: item.id, // Explicitly map fields to match OrderData['items'][number]
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price.toNumber(),
      item_total_amount: item.item_total_amount.toNumber(),
      // created_at and updated_at are not in OrderData['items'][number], so we omit them
      // or add them to the interface if needed. For now, omitting.
    })),
  };
};


export const getAllOrders = async (): Promise<OrderData[]> => {
  console.log('Order service: getAllOrders called');
  const orders = await prisma.order.findMany({
    orderBy: {
      created_at: 'desc', // Sort by creation date, newest first
    },
    include: {
      items: true, // Include items for potential future use, though maybe not needed for list view
    },
  });

  // Remove PrismaOrderWithItems as OrderGetPayload is problematic
  // Use 'any' for order type in map, as we know the structure and convert it
  // Convert Decimal fields to numbers for consistency with OrderData interface
  return orders.map((order: any) => ({ // Use any for order type here
    id: order.id, // Explicitly map fields to match OrderData
    order_number: order.order_number,
    client_name: order.client_name,
    client_contact: order.client_contact,
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
    total_amount: order.total_amount.toNumber(),
    items: order.items.map((item: PrismaOrderItem) => ({ // Use PrismaOrderItem type defined above
        id: item.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price.toNumber(),
        item_total_amount: item.item_total_amount.toNumber(),
    })),
  }));
};


export const getOrderById = async (id: number): Promise<OrderData | null> => {
  console.log(`Order service: getOrderById called with id: ${id}`);
  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      items: true, // Include related items
    },
  });

  if (!order) {
    return null; // Return null if order not found
  }

  // Convert Decimal fields to numbers
  return {
    ...order,
    total_amount: order.total_amount.toNumber(),
    items: order.items.map((item: PrismaOrderItem) => ({
      id: item.id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price.toNumber(),
      item_total_amount: item.item_total_amount.toNumber(),
    })),
  };
};


export const updateOrderStatus = async (id: number, status: string): Promise<OrderData | null> => {
  console.log(`Order service: updateOrderStatus called for id: ${id} with status: ${status}`);
  try {
    // Validate if the status is one of the allowed values (optional but recommended)
    const allowedStatuses = ['new', 'processing', 'ready', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        // Consider throwing a specific error or returning null/error indicator
        console.error(`Invalid status value provided: ${status}`);
        return null; // Or throw new Error('Invalid status value');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { 
        status: status,
        // updated_at is handled automatically by Prisma @updatedAt
      },
      include: {
        items: true, // Include items in the response
      },
    });

    // Convert Decimal fields to numbers
    return {
        ...updatedOrder,
        total_amount: updatedOrder.total_amount.toNumber(),
        items: updatedOrder.items.map((item: PrismaOrderItem) => ({
          id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price.toNumber(),
          item_total_amount: item.item_total_amount.toNumber(),
        })),
      };

  } catch (error: any) {
    // Handle potential errors, e.g., order not found (P2025)
    // Check error code directly without instanceof
    if (error && error.code === 'P2025') { 
      console.log(`Order with ID ${id} not found for update.`);
      return null; 
    }
    // Re-throw other errors to be caught by the controller
    console.error(`Error updating status for order ${id}:`, error);
    throw error; 
  }
};
