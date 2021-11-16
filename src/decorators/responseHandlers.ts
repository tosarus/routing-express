import { Action } from '../Action';
import { getMetadataArgsStorage } from '../index';
import { ResponseHandlerType } from '../metadata/types/ResponseHandlerType';

function responseHandlerFactory(type: ResponseHandlerType, value: any, secondaryValue?: any) {
  return function (object: any, methodName: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type,
      target: object.constructor,
      method: methodName,
      value,
      secondaryValue,
    });
  };
}

export function ContentType(contentType: string) {
  return responseHandlerFactory('content-type', contentType);
}

export function Header(name: string, value: string) {
  return responseHandlerFactory('header', name, value);
}

export function HttpCode(code: number) {
  return responseHandlerFactory('success-code', code);
}

export function Location(url: string) {
  return responseHandlerFactory('location', url);
}

export function OnNull(codeOrError: number | (new (action: Action) => any)) {
  return responseHandlerFactory('on-null', codeOrError);
}

export function OnUndefined(codeOrError: number | (new (action: Action) => any)) {
  return responseHandlerFactory('on-undefined', codeOrError);
}
