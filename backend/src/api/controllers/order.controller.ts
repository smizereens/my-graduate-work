import { Request, Response, NextFunction } from 'express'; // Removed RequestHandler import
import * as orderService from '../services/order.service'; // Import the service

// Add async keyword back
export const createOrder = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    // TODO: Add validation for req.body using a middleware or library like Zod
    const orderData = req.body; 
    // Basic validation example (replace with proper validation)
    if (!orderData || !orderData.client_name || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Invalid order data provided.' });
    }

    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder); // Send back the created order data
  } catch (error) {
     console.error("Error in createOrder controller:", error); // Log the actual error
     // Pass error to the global error handler
     next(error); 
  }
};

// Add async keyword back
export const getOrders = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders); // Send the actual orders
  } catch (error) {
     console.error("Error in getOrders controller:", error); // Log errors
     next(error);
  }
};

// Add async keyword back
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
    }
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    next(error);
  }
};

// Add async keyword back
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    // Basic validation
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
    }
    if (!status || typeof status !== 'string') {
       return res.status(400).json({ error: 'Invalid or missing status in request body.' });
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      // Service returns null if order not found or status invalid
      return res.status(404).json({ error: 'Order not found or status update failed.' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    next(error);
  }
};
