import { ClassType } from '../container';
import { getMetadataArgsStorage } from '../index';
import { MiddlewareType } from '../metadata/args/MiddlewareMetadataArgs';

function controllerFactory(type: 'json' | 'text', route?: string | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return function (target: ClassType) {
    if (Array.isArray(route)) {
      middlewares = route;
      route = undefined;
    }
    getMetadataArgsStorage().controllers.push({ type, target, route });
    middlewares.forEach((middleware) => getMetadataArgsStorage().middlewares.push({ target, middleware }));
  };
}

export function Controller(route?: string | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return controllerFactory('json', route, middlewares);
}

export function TextController(route?: string | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return controllerFactory('text', route, middlewares);
}
