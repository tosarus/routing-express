import { RequestHandler, ErrorRequestHandler } from 'express';
import { ErrorMiddleware } from '../../ErrorMiddleware';
import { Middleware } from '../../Middleware';
import { ClassType } from '../../container';

export type MiddlewareType = ClassType<Middleware> | ClassType<ErrorMiddleware> | RequestHandler | ErrorRequestHandler;

/**
 * Metadata used to store registered middlewares.
 */
export interface MiddlewareMetadataArgs {
  /**
   * Object of the middleware class.
   */
  target: ClassType;

  /**
   * Method to which this "use" is applied.
   * If method is not given it means "use" is used on the controller. Then "use" applied to all controller's actions.
   */
  method?: string;

  /**
   * Middleware to be executed.
   */
  middleware: MiddlewareType;
}
