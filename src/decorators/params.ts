import { getMetadataArgsStorage } from '../index';
import { ParamType } from '../metadata/types/ParamType';

function paramFactory(type: ParamType, name?: string, required = false) {
  return function (object: any, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type,
      object,
      method: methodName,
      index,
      name,
      required,
    });
  };
}

export function Body(options?: { required?: boolean }) {
  return paramFactory('body', undefined, options?.required);
}

export function HeaderParam(name: string, options?: { required?: boolean }) {
  return paramFactory('header', name, options?.required);
}

export function Param(name: string) {
  return paramFactory('param', name, true);
}

export function Req() {
  return paramFactory('request');
}

export function Res() {
  return paramFactory('response');
}

export function UploadedFile(name: string, options?: { required?: boolean }) {
  return paramFactory('file', name, options?.required);
}
