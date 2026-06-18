'use strict';
const chalk = require('chalk');

function createLogger(agentName) {
  const prefix = chalk.gray(`[${agentName}]`);

  function info(message) {
    console.log(`${prefix} ${chalk.cyan('info')}  ${message}`);
  }

  function ok(message) {
    console.log(`${prefix} ${chalk.green('ok')}    ${message}`);
  }

  function warn(message) {
    console.warn(`${prefix} ${chalk.yellow('warn')}  ${message}`);
  }

  function error(message) {
    console.error(`${prefix} ${chalk.red('error')} ${message}`);
  }

  function table(rows) {
    const maxLen = Math.max(...rows.map(r => r[0].length));
    rows.forEach(([label, value, color]) => {
      const col = color === 'green' ? chalk.green : color === 'red' ? chalk.red : chalk.white;
      console.log(`${prefix}   ${label.padEnd(maxLen + 2)} ${col(value)}`);
    });
  }

  return { info, ok, warn, error, table };
}

module.exports = { createLogger };
