import { CustomParameterDecorator } from './CustomParameterDecorator';
import { ExpressDriver } from './ExpressDriver';
import { RoutingControllersOptions } from './RoutingControllersOptions';
import { MetadataArgsStorage } from './metadata-builder/MetadataArgsStorage';

// -------------------------------------------------------------------------
// Main exports
// -------------------------------------------------------------------------

export { useContainer } from './container';

export * from './decorators';

export * from './http-error/HttpError';
export * from './http-error/InternalServerError';
export * from './http-error/BadRequestError';
export * from './http-error/ForbiddenError';
export * from './http-error/NotAcceptableError';
export * from './http-error/MethodNotAllowedError';
export * from './http-error/NotFoundError';
export * from './http-error/UnauthorizedError';

export * from './Middleware';
export * from './ErrorMiddleware';
export * from './metadata-builder/MetadataArgsStorage';
export * from './metadata/ActionMetadata';
export * from './metadata/ControllerMetadata';
export * from './metadata/ParamMetadata';
export * from './metadata/ResponseHandleMetadata';
export * from './metadata/MiddlewareMetadata';

export * from './RoutingControllersOptions';
export * from './CustomParameterDecorator';
export * from './Action';

export * from './ExpressDriver';

// -------------------------------------------------------------------------
// Main Functions
// -------------------------------------------------------------------------

/**
 * Gets metadata args storage.
 * Metadata args storage follows the best practices and stores metadata in a global variable.
 */
export function getMetadataArgsStorage(): MetadataArgsStorage {
  if (!(global as any).routingControllersMetadataArgsStorage) {
    (global as any).routingControllersMetadataArgsStorage = new MetadataArgsStorage();
  }

  return (global as any).routingControllersMetadataArgsStorage;
}

/**
 * Registers all loaded actions in your express application.
 */
export function useRoutingControllers(options: RoutingControllersOptions) {
  const driver = new ExpressDriver(options);
  return driver.registerControllers(options.controllers);
}

/**
 * Registers custom parameter decorator used in the controller actions.
 */
export function createParamDecorator(options: CustomParameterDecorator) {
  return function (object: any, method: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'custom-converter',
      object: object,
      method: method,
      index: index,
      required: options.required ?? false,
      transform: options.value,
    });
  };
}
