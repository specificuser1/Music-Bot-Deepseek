const chalk = require('chalk');

class Logger {
    static info(message) {
        console.log(chalk.blue('[INFO]') + ' ' + chalk.white(message));
    }

    static success(message) {
        console.log(chalk.green('[SUCCESS]') + ' ' + chalk.white(message));
    }

    static warn(message) {
        console.log(chalk.yellow('[WARNING]') + ' ' + chalk.white(message));
    }

    static error(message, error) {
        console.log(chalk.red('[ERROR]') + ' ' + chalk.white(message));
        if (error) {
            console.error(chalk.red(error.stack || error));
        }
    }

    static debug(message) {
        console.log(chalk.magenta('[DEBUG]') + ' ' + chalk.white(message));
    }

    static music(message) {
        console.log(chalk.cyan('[MUSIC]') + ' ' + chalk.white(message));
    }

    static command(user, command) {
        console.log(
            chalk.yellow('[COMMAND]') + ' ' + 
            chalk.white(`${user.tag} used `) + 
            chalk.cyan(`/${command}`)
        );
    }
}

module.exports = Logger;
