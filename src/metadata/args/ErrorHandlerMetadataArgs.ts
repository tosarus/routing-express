import { ClassType } from '../../container';

/**
 * Metadata used to store registered error handlers.
 */
export interface ErrorHandlerMetadataArgs {
  /**
   * Object class of the error handler class.
   */
  target: ClassType;

  /**
   * Execution priority of the error handler.
   */
  priority: number;
}
