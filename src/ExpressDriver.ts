import { NextFunction, Request, RequestHandler, Response, ErrorRequestHandler, Router } from 'express';
import multer from 'multer';
import { Action } from './Action';
import { ActionParameterHandler } from './ActionParameterHandler';
import { ErrorMiddleware } from './ErrorMiddleware';
import { Middleware } from './Middleware';
import { RoutingControllersOptions } from './RoutingControllersOptions';
import { ClassType, getFromContainer } from './container';
import { HttpError } from './http-error/HttpError';
import { NotFoundError } from './http-error/NotFoundError';
import { MetadataBuilder } from './metadata-builder/MetadataBuilder';
import { ActionMetadata } from './metadata/ActionMetadata';
import { MiddlewareMetadata } from './metadata/MiddlewareMetadata';
import { ParamMetadata } from './metadata/ParamMetadata';
import { isPromiseLike } from './util/isPromiseLike';

/**
 * Integration with express framework.
 */
export class ExpressDriver {
  /**
   * Indicates if default routing-controllers error handler should be used or not.
   */
  isDefaultErrorHandlingEnabled: boolean;

  /**
   * Indicates if routing-controllers should operate in development mode.
   */
  developmentMode: boolean;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  private metadataBuilder: MetadataBuilder;
  private parameterHandler: ActionParameterHandler;

  constructor(options: RoutingControllersOptions) {
    this.metadataBuilder = new MetadataBuilder(options);
    this.parameterHandler = new ActionParameterHandler(this);

    this.developmentMode = options.development ?? process.env.NODE_ENV !== 'production';
    this.isDefaultErrorHandlingEnabled = options.defaultErrorHandler ?? true;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------
  /**
   * Registers controller in the driver.
   */

  registerControllers(classes?: ClassType[]): Router {
    const rootRouter = Router();

    this.metadataBuilder.createControllers(classes).forEach((controller) => {
      const router = Router();

      controller.actions.forEach((actionMetadata) => {
        const middlewares = this.prepareMiddlewares([...controller.middlewares, ...actionMetadata.middlewares]);

        const actionMiddlewares = this.prepareActionMiddlewares(actionMetadata);

        const routeHandler = (request: Request, response: Response, next: NextFunction) => {
          return this.executeAction(actionMetadata, { request, response, next });
        };

        router[actionMetadata.type](actionMetadata.fullRoute!, ...middlewares, ...actionMiddlewares, routeHandler);
      });

      rootRouter.use(router);
    });

    return rootRouter;
  }

  private prepareActionMiddlewares(actionMetadata: ActionMetadata) {
    const middlewares = [] as RequestHandler[];

    if (actionMetadata.isFileUsed) {
      actionMetadata.params
        .filter((param) => param.type === 'file')
        .forEach((param) => {
          middlewares.push(multer({ storage: multer.memoryStorage() }).single(param.name) as RequestHandler);
        });
    }

    return middlewares;
  }

  /**
   * Executes given controller action.
   */
  private executeAction(actionMetadata: ActionMetadata, action: Action) {
    // compute all parameters
    const paramsPromises = actionMetadata.params
      .sort((param1, param2) => param1.index - param2.index)
      .map((param) => this.parameterHandler.handle(action, param));

    // after all parameters are computed
    return Promise.all(paramsPromises)
      .then((params) => {
        // execute action and handle result
        const result = actionMetadata.callMethod(params);
        return this.handleCallMethodResult(result, actionMetadata, action);
      })
      .catch((error) => {
        // otherwise simply handle error without action execution
        return this.handleError(error, actionMetadata, action);
      });
  }

  /**
   * Handles result of the action method execution.
   */
  private handleCallMethodResult(result: any, action: ActionMetadata, options: Action): any {
    if (isPromiseLike(result)) {
      return result
        .then((data: any) => {
          return this.handleCallMethodResult(data, action, options);
        })
        .catch((error: any) => {
          return this.handleError(error, action, options);
        });
    } else {
      return this.handleSuccess(result, action, options);
    }
  }

  /**
   * Gets param from the request.
   */
  getParamFromRequest(action: Action, param: ParamMetadata): any {
    const request = action.request;
    switch (param.type) {
      case 'body':
        return request.body;

      case 'param':
        return request.params[param.name];

      case 'header':
        return request.headers[param.name.toLowerCase()];

      case 'file':
        return request.file;
    }
  }

  /**
   * Handles result of successfully executed controller action.
   */
  handleSuccess(result: any, action: ActionMetadata, options: Action): void {
    // if the action returned the response object itself, short-circuits
    if (result && result === options.response) {
      return;
    }

    // set http status code
    if (result === undefined && action.undefinedResultCode) {
      if (action.undefinedResultCode instanceof Function) {
        throw new action.undefinedResultCode(options);
      }
      options.response.status(action.undefinedResultCode);
    } else if (result === null) {
      if (action.nullResultCode) {
        if (action.nullResultCode instanceof Function) {
          throw new action.nullResultCode(options);
        }
        options.response.status(action.nullResultCode);
      } else {
        options.response.status(204);
      }
    } else if (action.successHttpCode) {
      options.response.status(action.successHttpCode);
    }

    // apply http headers
    Object.keys(action.headers).forEach((name) => {
      options.response.header(name, action.headers[name]);
    });

    if (result === undefined) {
      // throw NotFoundError on undefined response

      if (action.undefinedResultCode) {
        if (action.isJsonTyped) {
          options.response.json();
        } else {
          options.response.send();
        }
      } else {
        throw new NotFoundError();
      }
    } else if (result === null) {
      // send null response
      if (action.isJsonTyped) {
        options.response.json(null);
      } else {
        options.response.send(null);
      }
    } else if (result instanceof Buffer) {
      // check if it's binary data (Buffer)
      options.response.end(result, 'binary');
    } else if (result instanceof Uint8Array) {
      // check if it's binary data (typed array)
      options.response.end(Buffer.from(result as any), 'binary');
    } else if (result.pipe instanceof Function) {
      result.pipe(options.response);
    } else {
      // send regular result
      if (action.isJsonTyped) {
        options.response.json(result);
      } else {
        options.response.send(result);
      }
    }
  }

  /**
   * Handles result of failed executed controller action.
   */
  handleError(error: any, action: ActionMetadata | undefined, options: Action): any {
    if (this.isDefaultErrorHandlingEnabled) {
      if (this.developmentMode) {
        console.log(error);
      }

      const response = options.response;

      // set http code
      // note that we can't use error instanceof HttpError properly anymore because of new typescript emit process
      if (error.httpCode) {
        response.status(error.httpCode);
      } else {
        response.status(500);
      }

      // apply http headers
      if (action) {
        Object.keys(action.headers).forEach((name) => {
          response.header(name, action.headers[name]);
        });
      }

      // send error content
      if (action && action.isJsonTyped) {
        response.json(this.processJsonError(error));
      } else {
        response.send(this.processTextError(error));
      }
    }
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  private processJsonError(error: any) {
    if (!this.isDefaultErrorHandlingEnabled) {
      return error;
    }

    if (typeof error.toJSON === 'function') {
      return error.toJSON();
    }

    if (error instanceof Error) {
      const processedError: any = {};

      const name = error.name && error.name !== 'Error' ? error.name : error.constructor.name;
      processedError.name = name;

      if (error.message) {
        processedError.message = error.message;
      }
      if (this.developmentMode && error.stack) {
        processedError.stack = error.stack;
      }

      Object.keys(error)
        .filter(
          (key) =>
            key !== 'stack' && key !== 'name' && key !== 'message' && (!(error instanceof HttpError) || key !== 'httpCode')
        )
        .forEach((key) => (processedError[key] = (error as any)[key]));

      return Object.keys(processedError).length > 0 ? processedError : undefined;
    }

    return error;
  }

  private processTextError(error: any) {
    if (!this.isDefaultErrorHandlingEnabled) {
      return error;
    }

    if (error instanceof Error) {
      if (this.developmentMode && error.stack) {
        return error.stack;
      } else if (error.message) {
        return error.message;
      }
    }
    return error;
  }

  /**
   * Creates middlewares from the given "use"-s.
   */
  private prepareMiddlewares(middlwares: MiddlewareMetadata[]) {
    const middlewareFunctions = [] as (RequestHandler | ErrorRequestHandler)[];
    middlwares.forEach((metadata: MiddlewareMetadata) => {
      if (metadata.middleware.prototype && metadata.middleware.prototype.use) {
        // if this is function instance of MiddlewareInterface
        middlewareFunctions.push((request: Request, response: Response, next: NextFunction) => {
          try {
            const useResult = getFromContainer<Middleware>(metadata.middleware).use(request, response, next);
            if (isPromiseLike(useResult)) {
              useResult.catch((error: Error) => {
                this.handleError(error, undefined, { request, response, next });
                return error;
              });
            }

            return useResult;
          } catch (error) {
            this.handleError(error, undefined, { request, response, next });
          }
        });
      } else if (metadata.middleware.prototype && metadata.middleware.prototype.error) {
        // if this is function instance of ErrorMiddlewareInterface
        middlewareFunctions.push((error: Error, request: Request, response: Response, next: NextFunction) => {
          return getFromContainer<ErrorMiddleware>(metadata.middleware).error(error, request, response, next);
        });
      } else {
        middlewareFunctions.push(metadata.middleware as RequestHandler | ErrorRequestHandler);
      }
    });
    return middlewareFunctions;
  }
}
