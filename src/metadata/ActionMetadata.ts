import { Action } from '../Action';
import { RoutingControllersOptions } from '../RoutingControllersOptions';
import { ClassType } from '../container';
import { ControllerMetadata } from './ControllerMetadata';
import { MiddlewareMetadata } from './MiddlewareMetadata';
import { ParamMetadata } from './ParamMetadata';
import { ResponseHandlerMetadata } from './ResponseHandleMetadata';
import { ActionMetadataArgs } from './args/ActionMetadataArgs';
import { ActionType } from './types/ActionType';

/**
 * Action metadata.
 */
export class ActionMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Action's controller.
   */
  controllerMetadata: ControllerMetadata;

  /**
   * Action's parameters.
   */
  params: ParamMetadata[] = [];

  /**
   * Action's metadatas.
   */
  middlewares: MiddlewareMetadata[] = [];

  /**
   * Class on which's method this action is attached.
   */
  target: ClassType;

  /**
   * Object's method that will be executed on this action.
   */
  method: string;

  /**
   * Action type represents http method used for the registered route. Can be one of the value defined in ActionTypes
   * class.
   */
  type: ActionType;

  /**
   * Route to be registered for the action.
   */
  route?: string | RegExp;

  /**
   * Full route to this action (includes controller base route).
   */
  fullRoute?: string | RegExp;

  /**
   * Indicates if this action uses Uploaded File.
   */
  isFileUsed: boolean;

  /**
   * Indicates if controller of this action is json-typed.
   */
  isJsonTyped?: boolean;

  /**
   * Http code to be used on undefined action returned content.
   */
  undefinedResultCode?: number | (new (action: Action) => any);

  /**
   * Http code to be used on null action returned content.
   */
  nullResultCode?: number | (new (action: Action) => any);

  /**
   * Http code to be set on successful response.
   */
  successHttpCode?: number;

  /**
   * Response headers to be set.
   */
  headers: { [name: string]: any } = {};

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(
    controllerMetadata: ControllerMetadata,
    args: ActionMetadataArgs,
    private globalOptions: RoutingControllersOptions
  ) {
    this.controllerMetadata = controllerMetadata;
    this.route = args.route;
    this.target = args.target;
    this.method = args.method;
    this.type = args.type;
    this.isFileUsed = false;
  }

  // -------------------------------------------------------------------------
  // Static Methods
  // -------------------------------------------------------------------------

  /**
   * Appends base route to a given regexp route.
   */
  static appendBaseRoute(baseRoute: string, route: RegExp | string) {
    const prefix = `${baseRoute.length > 0 && baseRoute.indexOf('/') < 0 ? '/' : ''}${baseRoute}`;
    if (typeof route === 'string') {
      return `${prefix}${route}`;
    }

    if (!baseRoute || baseRoute === '') {
      return route;
    }

    const fullPath = `^${prefix}${route.toString().substr(1)}?$`;

    return new RegExp(fullPath, route.flags);
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Builds everything action metadata needs.
   * Action metadata can be used only after its build.
   */
  build(responseHandlers: ResponseHandlerMetadata[]) {
    const undefinedResultHandler = responseHandlers.find((handler) => handler.type === 'on-undefined');
    const nullResultHandler = responseHandlers.find((handler) => handler.type === 'on-null');
    const successCodeHandler = responseHandlers.find((handler) => handler.type === 'success-code');
    const contentTypeHandler = responseHandlers.find((handler) => handler.type === 'content-type');

    this.undefinedResultCode = undefinedResultHandler?.value ?? this.globalOptions.defaults?.undefinedResultCode;
    this.nullResultCode = nullResultHandler?.value ?? this.globalOptions.defaults?.nullResultCode;
    this.successHttpCode = successCodeHandler?.value;
    this.isFileUsed = !!this.params.find((param) => param.type === 'file');
    this.isJsonTyped =
      contentTypeHandler !== undefined ? /json/.test(contentTypeHandler.value) : this.controllerMetadata.type === 'json';
    this.fullRoute = this.buildFullRoute();
    this.headers = this.buildHeaders(responseHandlers);
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Calls action method.
   * Action method is an action defined in a user controller.
   */
  callMethod(params: any[]) {
    const controllerInstance = this.controllerMetadata.getInstance();
    return controllerInstance[this.method](...params);
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  /**
   * Builds full action route.
   */
  private buildFullRoute(): string | RegExp {
    if (this.route instanceof RegExp) {
      if (this.controllerMetadata.route) {
        return ActionMetadata.appendBaseRoute(this.controllerMetadata.route, this.route);
      }
      return this.route;
    }

    let path = '';
    if (this.controllerMetadata.route) {
      path += this.controllerMetadata.route;
    }
    if (this.route && typeof this.route === 'string') {
      path += this.route;
    }
    return path;
  }

  /**
   * Builds action response headers.
   */
  private buildHeaders(responseHandlers: ResponseHandlerMetadata[]) {
    const contentTypeHandler = responseHandlers.find((handler) => handler.type === 'content-type');
    const locationHandler = responseHandlers.find((handler) => handler.type === 'location');

    const headers: { [name: string]: string } = {};
    if (locationHandler) {
      headers['Location'] = locationHandler.value;
    }

    if (contentTypeHandler) {
      headers['Content-type'] = contentTypeHandler.value;
    }

    const headerHandlers = responseHandlers.filter((handler) => handler.type === 'header');
    if (headerHandlers) {
      headerHandlers.map((handler) => (headers[handler.value] = handler.secondaryValue));
    }

    return headers;
  }
}
