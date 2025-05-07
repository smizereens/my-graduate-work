import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is healthy and running!' });
});

// TODO: Import and use order routes
import orderRoutes from './api/routes/order.routes';
app.use('/api/orders', orderRoutes);

// Global Error Handler (simple version)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
