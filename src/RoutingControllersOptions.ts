import { ClassType } from './container';

export interface RoutingControllersOptions {
  /**
   * List of controllers to register in the framework
   */
  controllers?: ClassType[];

  /**
   * Indicates if development mode is enabled.
   * By default its enabled if your NODE_ENV is not equal to "production".
   */
  development?: boolean;

  /**
   * Indicates if default routing-controller's error handler is enabled or not.
   * Enabled by default.
   */
  defaultErrorHandler?: boolean;

  /**
   * Default settings
   */
  defaults?: {
    /**
     * If set, all null responses will return specified status code by default
     */
    nullResultCode?: number;

    /**
     * If set, all undefined responses will return specified status code by default
     */
    undefinedResultCode?: number;

    /**
     * Default param options
     */
    paramOptions?: {
      /**
       * If true, all non-set parameters will be required by default
       */
      required?: boolean;
    };
  };
}
