import { RoutingControllersOptions } from '../RoutingControllersOptions';
import { ClassType } from '../container';
import { getMetadataArgsStorage } from '../index';
import { ActionMetadata } from '../metadata/ActionMetadata';
import { ControllerMetadata } from '../metadata/ControllerMetadata';
import { MiddlewareMetadata } from '../metadata/MiddlewareMetadata';
import { ParamMetadata } from '../metadata/ParamMetadata';
import { ResponseHandlerMetadata } from '../metadata/ResponseHandleMetadata';
import { ActionMetadataArgs } from '../metadata/args/ActionMetadataArgs';
import { ParamMetadataArgs } from '../metadata/args/ParamMetadataArgs';

/**
 * Builds metadata from the given metadata arguments.
 */
export class MetadataBuilder {
  constructor(private options: RoutingControllersOptions) {}

  /**
   * Creates controller metadata from a registered controller metadata args.
   */
  createControllers(classes?: ClassType[]): ControllerMetadata[] {
    const controllers = !classes
      ? getMetadataArgsStorage().controllers
      : getMetadataArgsStorage().filterControllerMetadatasForClasses(classes);
    return controllers.map((controllerArgs) => {
      const controller = new ControllerMetadata(controllerArgs);
      controller.actions = this.createActions(controller);
      controller.middlewares = this.createControllerMiddlewares(controller);
      return controller;
    });
  }

  /**
   * Creates action metadatas.
   */
  private createActions(controller: ControllerMetadata): ActionMetadata[] {
    let target = controller.target;
    const actionsWithTarget: ActionMetadataArgs[] = [];
    while (target) {
      const actions = getMetadataArgsStorage()
        .filterActionsWithTarget(target)
        .filter((action) => {
          return actionsWithTarget.map((a) => a.method).indexOf(action.method) === -1;
        });

      actions.forEach((a) => {
        a.target = controller.target;

        actionsWithTarget.push(a);
      });

      target = Object.getPrototypeOf(target);
    }

    return actionsWithTarget.map((actionArgs) => {
      const action = new ActionMetadata(controller, actionArgs, this.options);
      action.params = this.createParams(action);
      action.middlewares = this.createActionMiddlewares(action);
      action.build(this.createActionResponseHandlers(action));
      return action;
    });
  }

  /**
   * Creates param metadatas.
   */
  private createParams(action: ActionMetadata): ParamMetadata[] {
    return getMetadataArgsStorage()
      .filterParamsWithTargetAndMethod(action.target, action.method)
      .map((paramArgs) => new ParamMetadata(action, this.decorateDefaultParamOptions(paramArgs)));
  }

  /**
   * Creates response handler metadatas for action.
   */
  private createActionResponseHandlers(action: ActionMetadata): ResponseHandlerMetadata[] {
    return getMetadataArgsStorage()
      .filterResponseHandlersWithTargetAndMethod(action.target, action.method)
      .map((handlerArgs) => new ResponseHandlerMetadata(handlerArgs));
  }

  /**
   * Creates use metadatas for actions.
   */
  private createActionMiddlewares(action: ActionMetadata): MiddlewareMetadata[] {
    return getMetadataArgsStorage()
      .filterMiddlewaresWithTargetAndMethod(action.target, action.method)
      .map((middlewareArgs) => new MiddlewareMetadata(middlewareArgs));
  }

  /**
   * Creates use metadatas for controllers.
   */
  private createControllerMiddlewares(controller: ControllerMetadata): MiddlewareMetadata[] {
    return getMetadataArgsStorage()
      .filterMiddlewaresWithTargetAndMethod(controller.target)
      .map((middlewareArgs) => new MiddlewareMetadata(middlewareArgs));
  }

  /**
   * Decorate paramArgs with default settings
   */
  private decorateDefaultParamOptions(paramArgs: ParamMetadataArgs) {
    const options = this.options.defaults?.paramOptions;
    if (!options) {
      return paramArgs;
    }

    if (paramArgs.required === undefined) {
      paramArgs.required = options.required ?? false;
    }

    return paramArgs;
  }
}
