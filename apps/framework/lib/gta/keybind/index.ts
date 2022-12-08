// @ts-nocheck
import "reflect-metadata";

export function Keybind(mapper: string, key: string, description: string, toggle: boolean = true): MethodDecorator {
  return (target: Object, methodName: string | symbol): void => {
    if (!Reflect.hasMetadata("Keybinds", target.constructor)) {
      Reflect.defineMetadata("Keybinds", [], target.constructor);
    }

    const keybinds = Reflect.getMetadata("Keybinds", target.constructor) as Array<any>;

    keybinds.push({
      name: GetCurrentResourceName() + ":" + <string>methodName,
      method: methodName,
      mapper: mapper,
      key: key,
      description: description,
      toggle: toggle,
    });

    Reflect.defineMetadata("Keybinds", keybinds, target.constructor);
  };
}
export function KeybindHandler() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const keybinds = Reflect.getMetadata("Keybinds", constructor) as Array<any>;

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        if (!keybinds) return;

        for (const keybind of keybinds) {
          if (keybind.toggle) {
            RegisterCommand(keybind.name, this[keybind.method].bind(this), false);
          } else {
            RegisterCommand(`+${keybind.name}`, this[keybind.method].bind(this)(true), false);
            RegisterCommand(`-${keybind.name}`, this[keybind.method].bind(this)(false), false);
          }
          RegisterKeyMapping((keybind.toggle ? "" : "+") + keybind.name, keybind.description, keybind.mapper, keybind.key);
        }
      }
    };
  };
}
