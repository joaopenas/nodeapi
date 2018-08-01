import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';
import { Routes } from './src/config/routes';


class App {

    private server: Server;
    private port: number = process.env.ADDRESS || 5000;
    private address: string = process.env.ADDRESS || '0.0.0.0';
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.database();
        this.init();
    }

    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(morgan('dev'));
        this.express.use(cookieParser());
        this.express.use(cors());
        this.express.options('*', cors());
    }

    private routes(): void {
        const routes = new Routes(this.express);
    }

    private database(): void {
        const database = Database.getInstance();
    }

    private init(): void {
        this.server = this.express.listen(this.port, this.address, () => {
            console.log('Express server listening on %d, in %s mode', this.port, this.express.get('env'));
        });
    }
}

export default new App().express;
