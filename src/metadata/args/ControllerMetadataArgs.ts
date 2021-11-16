import { ClassType } from '../../container';

/**
 * Controller metadata used to storage information about registered controller.
 */
export interface ControllerMetadataArgs {
  /**
   * Indicates object which is used by this controller.
   */
  target: ClassType;

  /**
   * Base route for all actions registered in this controller.
   */
  route?: string;

  /**
   * Controller type. Can be json-typed (default) or text-typed. Json-typed controllers operate with json requests and responses.
   */
  type: 'json' | 'text';
}
