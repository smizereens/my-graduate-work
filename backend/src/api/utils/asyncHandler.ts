import { Request, Response, NextFunction, RequestHandler } from 'express';

// This utility wraps async route handlers to catch errors and pass them to the Express error handler
const asyncHandler = (fn: RequestHandler): RequestHandler => 
  (req: Request, res: Response, next: NextFunction): Promise<void> => 
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
