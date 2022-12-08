// @ts-nocheck
import "reflect-metadata";

export function Command(name?: string): MethodDecorator {
  return (target: Object, methodName: string | symbol): void => {
    if (!Reflect.hasMetadata("Commands", target.constructor)) {
      Reflect.defineMetadata("Commands", [], target.constructor);
    }

    const commands = Reflect.getMetadata("Commands", target.constructor) as Array<any>;

    commands.push({
      name: name ?? <string>methodName,
      method: methodName,
    });

    Reflect.defineMetadata("Commands", commands, target.constructor);
  };
}
export function CommandHandler() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const commands = Reflect.getMetadata("Commands", constructor) as Array<any>;

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (commands) {
          for (const command of commands) {
            RegisterCommand(command.name, this[command.method].bind(this), false);
          }
        }
      }
    };
  };
}
