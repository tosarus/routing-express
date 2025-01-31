import { Action } from './Action';
import { ExpressDriver } from './ExpressDriver';
import { ParamNormalizationError } from './error/ParamNormalizationError';
import { ParamRequiredError } from './error/ParamRequiredError';
import { ParameterParseJsonError } from './error/ParameterParseJsonError';
import { ParamMetadata } from './metadata/ParamMetadata';
import { isPromiseLike } from './util/isPromiseLike';

/**
 * Handles action parameter.
 */
export class ActionParameterHandler {
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(private driver: ExpressDriver) {}

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Handles action parameter.
   */
  handle(action: Action, param: ParamMetadata): Promise<any> | any {
    if (param.type === 'request') {
      return action.request;
    }

    if (param.type === 'response') {
      return action.response;
    }

    // get parameter value from request and normalize it
    const value = this.normalizeParamValue(this.driver.getParamFromRequest(action, param), param);

    if (isPromiseLike(value)) {
      return value.then((value) => this.handleValue(value, action, param));
    }

    return this.handleValue(value, action, param);
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Handles non-promise value.
   */
  protected handleValue(value: any, action: Action, param: ParamMetadata): Promise<any> | any {
    // if transform function is given for this param then apply it
    if (param.transform) {
      value = param.transform(action, value);
    }

    // check cases when parameter is required but its empty and throw errors in this case
    if (param.required) {
      const isValueEmpty = value === null || value === undefined || value === '';
      const isValueEmptyObject = typeof value === 'object' && Object.keys(value).length === 0;

      if (param.type === 'body' && !param.name && (isValueEmpty || isValueEmptyObject)) {
        // body has a special check and error message
        return Promise.reject(new ParamRequiredError(action, param));
      } else if (param.name && isValueEmpty) {
        // regular check for all other parameters
        return Promise.reject(new ParamRequiredError(action, param));
      }
    }

    return value;
  }

  /**
   * Normalizes parameter value.
   */
  protected async normalizeParamValue(value: any, param: ParamMetadata): Promise<any> {
    if (value === null || value === undefined) {
      return value;
    }

    const isTargetPrimitive = ['number', 'string', 'boolean'].includes(param.targetName);
    const isTransformationNeeded = param.isTargetObject && param.type !== 'param';

    // if value is a string, normalize it to demanded type
    if (typeof value === 'string') {
      switch (param.targetName) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'date':
          return this.normalizeStringValue(value, param.name, param.targetName);
        case 'array':
          return [value];
      }
    } else if (Array.isArray(value)) {
      return value.map((v) => this.normalizeStringValue(v, param.name, param.targetName));
    }

    // if target type is not primitive, transform and validate it
    if (!isTargetPrimitive && isTransformationNeeded) {
      value = this.parseValue(value, param);
    }

    return value;
  }

  /**
   * Normalizes string value to number or boolean.
   */
  protected normalizeStringValue(value: string, parameterName: string, parameterType: string) {
    switch (parameterType) {
      case 'number': {
        if (value === '') {
          throw new ParamNormalizationError(value, parameterName, parameterType);
        }

        const valueNumber = +value;
        if (Number.isNaN(valueNumber)) {
          throw new ParamNormalizationError(value, parameterName, parameterType);
        }

        return valueNumber;
      }
      case 'boolean':
        if (value === 'true' || value === '1' || value === '') {
          return true;
        } else if (value === 'false' || value === '0') {
          return false;
        } else {
          throw new ParamNormalizationError(value, parameterName, parameterType);
        }

      case 'date': {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
          throw new ParamNormalizationError(value, parameterName, parameterType);
        }
        return parsedDate;
      }

      case 'string':
      default:
        return value;
    }
  }

  /**
   * Parses string value into a JSON object.
   */
  protected parseValue(value: any, paramMetadata: ParamMetadata): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (_error) {
        throw new ParameterParseJsonError(paramMetadata.name, value);
      }
    }
    return value;
  }
}
