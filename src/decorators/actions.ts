import { getMetadataArgsStorage } from '../index';
import { MiddlewareType } from '../metadata/args/MiddlewareMetadataArgs';
import { ActionType } from '../metadata/types/ActionType';

function actionFactory(type: ActionType, route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return function (object: any, methodName: string) {
    if (Array.isArray(route)) {
      middlewares = route;
      route = undefined;
    }
    getMetadataArgsStorage().actions.push({ type, target: object.constructor, method: methodName, route });
    middlewares.forEach((middleware) =>
      getMetadataArgsStorage().middlewares.push({ target: object.constructor, method: methodName, middleware })
    );
  };
}

export function All(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('all', route, middlewares);
}

export function Delete(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('delete', route, middlewares);
}

export function Get(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('get', route, middlewares);
}

export function Head(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('head', route, middlewares);
}

export function Method(
  method: ActionType,
  route?: string | RegExp | MiddlewareType[],
  middlewares = [] as MiddlewareType[]
) {
  return actionFactory(method, route, middlewares);
}

export function Options(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('options', route, middlewares);
}
export function Patch(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('patch', route, middlewares);
}

export function Post(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('post', route, middlewares);
}

export function Put(route?: string | RegExp | MiddlewareType[], middlewares = [] as MiddlewareType[]) {
  return actionFactory('put', route, middlewares);
}
