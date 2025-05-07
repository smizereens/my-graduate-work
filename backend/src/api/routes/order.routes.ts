import { Router } from 'express';
// import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
// import { validateCreateOrder } from '../middlewares/validator'; // TODO: Create validator

const router = Router();

// TODO: Uncomment and implement controller methods and validator
// router.post('/', validateCreateOrder, createOrder);
// router.get('/', getOrders);
// router.get('/:id', getOrderById);
// router.put('/:id/status', updateOrderStatus);

router.get('/test', (req, res) => {
  res.json({ message: 'Order routes are working!' });
});


export default router;
