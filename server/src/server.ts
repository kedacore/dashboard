import chalk from 'chalk';
import express from 'express';
import http from 'http';
import ip from 'ip';
import os from 'os';
import path from 'path';
import program from 'commander';
import { setupApis } from './apis';

program
    .version('0.0.1', '-v, --version')
    .option('--production', 'serve static content from /public. Default: redirect to :3000')
    .parse(process.argv);

const app = express();
const server = http.createServer(app);

if (program.production) {
    console.log(chalk.blue('Running in production mode'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
} else {
    console.log(chalk.magenta('Running in development mode'));
    app.get('/', (req, res) => {
        const redirectUri = `http://${req.hostname}:3000/`;

        console.warn(chalk.bold.yellow(`redirecting to client ${redirectUri}`));
        res.redirect(redirectUri);
    });
}

setupApis(app);

const port = (() => {
    const val = process.env.PORT || '5000';
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
})();

server.listen(port, () => {
    console.log(chalk.bold.green(`API listening on http://localhost:${port}`))
    console.log(chalk.bold.green(`API listening on http://${ip.address()}:${port}`))
    console.log(chalk.bold.green(`API listening on http://${os.hostname()}:${port}`))
});