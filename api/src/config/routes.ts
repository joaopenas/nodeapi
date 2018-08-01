import * as express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UsersController } from '../controllers/users.controller';
import { AuthHandler } from '../middlewares/auth.handler';



export class Routes {

    private authHandler: AuthHandler;
    private usersController: UsersController;
    private authController: AuthController;

    constructor(app: express.Application) {
        this.authHandler = new AuthHandler();
        this.usersController = new UsersController();
        this.authController = new AuthController();

        this.configRouting(app);
    }

    private configRouting(app: express.Application): void {
        // Log Routing
        app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
            console.log(`Time: ${new Date().toUTCString()} / URL: ${req.url}`);
            next();
        });

        // Welcome
        app.use('/api/welcome', (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(200).json('Welcome to API!');
        });

        // Users
        app.use('/api/users', (req: express.Request, res: express.Response, next: express.NextFunction) => this.usersController.router(req, res, next));
        // Auth
        app.use('/api/auth', (req: express.Request, res: express.Response, next: express.NextFunction) => this.authController.router(req, res, next));

        // Error Routing
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
            res.status(400).json({ message: err.message });
        });
    }
}