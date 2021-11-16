import { ClassType, getFromContainer } from '../container';
import { ActionMetadata } from './ActionMetadata';
import { MiddlewareMetadata } from './MiddlewareMetadata';
import { ControllerMetadataArgs } from './args/ControllerMetadataArgs';

/**
 * Controller metadata.
 */
export class ControllerMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Controller actions.
   */
  actions: ActionMetadata[] = [];

  /**
   * Indicates object which is used by this controller.
   */
  target: ClassType;

  /**
   * Base route for all actions registered in this controller.
   */
  route: string;

  /**
   * Controller type. Can be default or json-typed. Json-typed controllers operate with json requests and responses.
   */
  type: 'json' | 'text';

  /**
   * Middleware applied to a whole controller.
   */
  middlewares: MiddlewareMetadata[] = [];

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(args: ControllerMetadataArgs) {
    this.target = args.target;
    this.route = args.route ?? '';
    this.type = args.type;
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /**
   * Gets instance of the controller.
   * @param action Details around the request session
   */
  getInstance(): any {
    return getFromContainer(this.target);
  }
}
