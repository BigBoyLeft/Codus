import chalk from "chalk";
import { config } from "./config";

export class logger {
  static success(message: string) {
    console.log(chalk.green(message));
  }

  static warn(message: string) {
    console.warn(chalk.yellow(message));
  }

  static error(message: string) {
    console.error(chalk.red(message));
  }

  static debug(message: string) {
    if (config.debug) {
      console.log(chalk.blue(message));
    }
  }
}
