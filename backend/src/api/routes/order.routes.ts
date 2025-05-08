import { Router, Request, Response, NextFunction } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
// import { validateCreateOrder } from '../middlewares/validator'; // TODO: Create validator

const router = Router();

// Explicitly handle async controller and catch errors
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createOrder(req, res, next);
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
}); 

// TODO: Uncomment and implement other routes similarly
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getOrders(req, res, next); // Use the imported controller function
  } catch (error) { // Ensure catch block is complete
    next(error);
  }
}); 

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getOrderById(req, res, next);
  } catch (error) {
    next(error);
  }
}); 
router.put('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateOrderStatus(req, res, next);
  } catch (error) {
    next(error);
  }
}); 

router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Order routes are working!' });
});


module.exports = router; // Use CommonJS export
