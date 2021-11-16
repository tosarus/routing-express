import { NextFunction, Request, Response } from 'express';

// Controller action properties.
export interface Action {
  request: Request;
  response: Response;
  next: NextFunction;
}
