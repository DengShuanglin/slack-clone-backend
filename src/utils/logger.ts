/**
 * @file App logger
 * @module utils/logger
 * @author Name6
 */

import chalk from 'chalk';

enum LoggerLevel {
  Debug = 'dubug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const renderTime = () => {
  const now = new Date();
  return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
};

const renderModule = (message: string) => {
  if (typeof message === 'string' && message.startsWith('[') && message.endsWith(']')) {
    return chalk.green.underline(message.substring(1, message.length - 1));
  } else return message;
};

const renderMessage = (color: chalk.Chalk, messages: any[]) => {
  return messages.map((m) => (typeof m === 'string' ? color(m) : m));
};

const renderLog = (method: LoggerLevel, levelLabel: string, messageColor: chalk.Chalk) => {
  return (message: string, ...args: any) => {
    // FIXME: 当method为‘debug’时报错console[method] is not a function
    if (method === 'dubug')
      return console.debug(
        chalk.greenBright('[EDU] - '),
        renderTime(),
        levelLabel,
        renderModule(message),
        ...renderMessage(messageColor, args),
      );
    return console[method](
      chalk.greenBright('[EDU] - '),
      renderTime(),
      levelLabel,
      renderModule(message),
      ...renderMessage(messageColor, args),
    );
  };
};

const createLogger = () => {
  return {
    debug: renderLog(LoggerLevel.Debug, chalk.cyan('[DEBUG]'), chalk.cyanBright),
    info: renderLog(LoggerLevel.Info, chalk.blue('[_INFO]'), chalk.greenBright),
    warn: renderLog(LoggerLevel.Warn, chalk.yellow('[_WARN]'), chalk.yellowBright),
    error: renderLog(LoggerLevel.Error, chalk.red('[ERROR]'), chalk.redBright),
  };
};

const logger = createLogger();
export default logger;
