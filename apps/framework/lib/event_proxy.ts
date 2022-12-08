import { uuidv4, RateLimiter, type LimiterOptions, logger } from "./";
import { ResponseTypes } from "@typings";

// Server-side code stuff
// Original Code from : https://github.com/project-error/npwd/blob/master/apps/game/server/lib/PromiseNetEvents/onNetPromise.ts

export interface ServerPromiseResp<T = undefined> {
  errorMsg?: string;
  status: "ok" | "error";
  data?: T;
}

export interface PromiseRequest<T = any> {
  data: T;
  src: number;
}

export type PromiseEventResp<T> = (returnData: ServerPromiseResp<T>) => void;

export type CBSignature<T, P> = (reqObj: PromiseRequest<T>, resp: PromiseEventResp<P>) => void;

export function onNetPromise<T = any, P = any>(eventName: string, cb: CBSignature<T, P>, rateLimiter?: RateLimiter, rateLimitOptions?: LimiterOptions) {
  rateLimiter?.registerNewEvent(eventName, rateLimitOptions);

  onNet(eventName, async (respEventName: string, data: T) => {
    const startTime = process.hrtime.bigint();
    const src = global.source;

    if (!respEventName) return logger.warn(`[onNetPromise] No response event name provided for ${eventName}`);

    const promiseRequest: PromiseRequest<T> = {
      src,
      data,
    };

    logger.debug(`[onNetPromise] ${eventName} request from ${src} with data: ${promiseRequest}`);

    const promiseResp: PromiseEventResp<P> = (data: ServerPromiseResp<P>) => {
      const endTime = process.hrtime.bigint();
      const diff = Number(endTime - startTime) / 1e6;
      logger.debug(`[onNetPromise] ${eventName} response to ${src} with data: ${data} in ${diff}ms`);

      emitNet(respEventName, data);
    };

    if (rateLimiter?.isPlayerRateLimited(eventName, src)) {
      return promiseResp({ status: "error", errorMsg: ResponseTypes.RATE_LIMITED });
    } else {
      rateLimiter?.rateLimitPlayer(eventName, src);
    }

    Promise.resolve(cb(promiseRequest, promiseResp)).catch((e) => {
      logger.error(`[onNetPromise] ${eventName} error: ${e}`);
      promiseResp({ status: "error", errorMsg: ResponseTypes.UNKNOWN });
    });
  });
}

// create a decorator to make it easier to use
export function onNetPromiseDecorator(eventName: string, rateLimiter?: RateLimiter, rateLimitOptions?: LimiterOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    onNetPromise(eventName, descriptor.value, rateLimiter, rateLimitOptions);
  };
}

// Client-side Code stuff
// Original Code from : https://github.com/project-error/npwd/blob/master/apps/game/client/cl_utils.ts

export function emitNetPromise<T = any>(eventName: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (IsDuplicityVersion()) reject(new Error("Function [emitNetPromise] is not callable on the server side."));
    let timeout = false;

    setTimeout(() => {
      timeout = true;
      reject(new Error(`Event ${eventName} timed out after 15000ms`));
    }, 15000);

    const uuid = uuidv4();

    const listener = `${eventName}:${uuid}`;

    emitNet(eventName, listener, ...args);

    const handler = (data: T) => {
      removeEventListener(listener, handler);
      if (timeout) return;
      resolve(data);
    };

    onNet(listener, handler);
  });
}

export function registerNuiProxy(eventName: string) {
  if (IsDuplicityVersion()) return new Error(`Function [registerNuiProxy] is not callable on the server side.`);

  RegisterNuiCallbackType(eventName);
  on(`__cfx_nui:${eventName}`, async (data: unknown, cb: Function) => {});
}

// export a function registerNuiCB that is a callable function and is a decorator

type CallbackFn<T> = (data: T, cb: Function) => void;

export function registerNuiCB<T = any>(eventName: string, callback: Function) {
  if (IsDuplicityVersion()) return new Error(`Function [registerNuiCB] is not callable on the server side.`);

  RegisterNuiCallbackType(eventName);
  on(`__cfx_nui:${eventName}`, callback);
}
