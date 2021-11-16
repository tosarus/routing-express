import { ClassType } from '../container';
import { MiddlewareMetadataArgs } from './args/MiddlewareMetadataArgs';

/**
 * Middleware metadata.
 */
export class MiddlewareMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Object class of the middleware class.
   */
  target: ClassType;

  /**
   * Method used.
   */
  method?: string;

  /**
   * Middleware to be executed.
   */
  middleware: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(args: MiddlewareMetadataArgs) {
    this.target = args.target;
    this.method = args.method;
    this.middleware = args.middleware;
  }
}
