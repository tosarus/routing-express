import { ClassType } from '../container';
import { ActionMetadataArgs } from '../metadata/args/ActionMetadataArgs';
import { ControllerMetadataArgs } from '../metadata/args/ControllerMetadataArgs';
import { MiddlewareMetadataArgs } from '../metadata/args/MiddlewareMetadataArgs';
import { ParamMetadataArgs } from '../metadata/args/ParamMetadataArgs';
import { ResponseHandlerMetadataArgs } from '../metadata/args/ResponseHandleMetadataArgs';

/**
 * Storage all metadatas read from decorators.
 */
export class MetadataArgsStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Registered controller metadata args.
   */
  controllers: ControllerMetadataArgs[] = [];

  /**
   * Registered middleware metadata args.
   */
  middlewares: MiddlewareMetadataArgs[] = [];

  /**
   * Registered action metadata args.
   */
  actions: ActionMetadataArgs[] = [];

  /**
   * Registered param metadata args.
   */
  params: ParamMetadataArgs[] = [];

  /**
   * Registered response handler metadata args.
   */
  responseHandlers: ResponseHandlerMetadataArgs[] = [];

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------
  /**
   * Filters registered controllers by a given classes.
   */
  filterControllerMetadatasForClasses(classes: ClassType[]): ControllerMetadataArgs[] {
    return this.controllers.filter((ctrl) => {
      return classes.filter((cls) => ctrl.target === cls).length > 0;
    });
  }

  /**
   * Filters registered actions by a given classes.
   */
  filterActionsWithTarget(target: ClassType): ActionMetadataArgs[] {
    return this.actions.filter((action) => action.target === target);
  }

  /**
   * Filters registered middlewares by a given target class and method name.
   */
  filterMiddlewaresWithTargetAndMethod(target: ClassType, methodName?: string): MiddlewareMetadataArgs[] {
    return this.middlewares.filter((use) => {
      return use.target === target && use.method === methodName;
    });
  }

  /**
   * Filters parameters by a given classes.
   */
  filterParamsWithTargetAndMethod(target: ClassType, methodName: string): ParamMetadataArgs[] {
    return this.params.filter((param) => {
      return param.object.constructor === target && param.method === methodName;
    });
  }

  /**
   * Filters response handlers by a given class.
   */
  filterResponseHandlersWithTarget(target: ClassType): ResponseHandlerMetadataArgs[] {
    return this.responseHandlers.filter((property) => {
      return property.target === target;
    });
  }

  /**
   * Filters response handlers by a given classes.
   */
  filterResponseHandlersWithTargetAndMethod(target: ClassType, methodName: string): ResponseHandlerMetadataArgs[] {
    return this.responseHandlers.filter((property) => {
      return property.target === target && property.method === methodName;
    });
  }

  /**
   * Removes all saved metadata.
   */
  reset() {
    this.controllers = [];
    this.middlewares = [];
    this.actions = [];
    this.params = [];
    this.responseHandlers = [];
  }
}
