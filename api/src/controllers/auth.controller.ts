import * as Bcrypt from 'bcrypt-nodejs';
import { NextFunction, Request, Response, Router } from 'express';
import { MysqlError, PoolConnection } from 'mysql';
import { Database } from '../config/database';
import { AuthHandler } from '../middlewares/auth.handler';
import { User } from '../models/user.model';
import { UsersRepository } from '../repositories/users.repository';

export class AuthController {

    public router: Router;
    private authHandler: AuthHandler;
    private usersRepository: UsersRepository;

    public constructor() {
        this.router = Router();
        this.authHandler = new AuthHandler();
        this.usersRepository = new UsersRepository();
        this.init();
    }

    private login(req: Request, res: Response, next: NextFunction): void {
        if (!req.body.userEmail || !req.body.userPassword) {
            res.status(400).json({ message: 'You must send the userEmail and userPassword', });
        } else {
            Database.getConnection((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Get Connection Failed', error: err.message });
                } else {
                    this.usersRepository.getLoginUser(conn, req.body.userEmail, (err: MysqlError, result: any): void => {
                        conn.release();
                        if (err) {
                            res.status(400).json({ message: err.message });
                        } else if (!result) {
                            res.status(400).json({ message: 'User Not Found' });
                        } else {
                            const user = new User(result);
                            // check if password matches
                            if (!Bcrypt.compareSync(req.body.userPassword, user.userPassword)) {
                                res.status(403).json({ message: 'Wrong password.' });
                            } else if (!user.userStatus) {
                                res.status(403).json({ message: 'Account is disabled.' });
                            } else {
                                user.userPassword = undefined;
                                user.userEmail = undefined;
                                user.userToken = this.authHandler.getLoginToken(user);

                                res.status(200).json({ message: 'Login Successfully!', data: user });
                            }
                        }
                    });
                }
            });
        }
    }

    private signup(req: Request, res: Response, next: NextFunction): void {
        if (!req.body.user) {
            res.status(400).json({ message: 'You must send  user and account information', });
        } else {
            Database.startTransaction((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Begin Transaction Failed', error: err.message });
                } else {

                    const user = new User(req.body.user);
                    // Set accound Id and Status
                    user.userStatus = 0;
                    user.userIsAdmin = 1;
                    // Encrypt password
                    user.userPassword = Bcrypt.hashSync(user.userPassword);
                    // Create a new user
                    this.usersRepository.insertUser(conn, user, (err: MysqlError, result: any) => {
                        if (err) {
                            Database.rollbackTransaction(conn, (err: MysqlError) => {
                                res.status(400).json({ message: 'SignUp failed. User already exist.' });
                            });
                        } else {
                            Database.commitTransaction(conn, (err: MysqlError) => {
                                if (err) {
                                    res.status(400).json({ message: 'SignUp failed. Something Unexpected Error' });
                                } else {
                                    res.status(200).json({ message: 'SignUp Successfully! Please check your email!' });
                                }
                            });
                        }
                    });

                }
            });
        }
    }

    private recoveryPassword(req: Request, res: Response, next: NextFunction): void {
        if (!req.body.userEmail) {
            res.status(400).json({ message: 'You must send email!' });
        } else {
            Database.getConnection((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Get Connection Failed', error: err.message });
                } else {
                    this.usersRepository.getUserByEmail(conn, req.body.userEmail, (err: MysqlError, result: any): void => {
                        conn.release();
                        if (err) {
                            res.status(400).json({ message: err.message });
                        } else if (result) {

                            const user = new User(result);
                            user.userToken = this.authHandler.getConfirmationToken(user);

                            res.status(200).json({ message: 'Email Sent!' });

                        } else {
                            res.status(400).json({ message: 'Email not found!' });
                        }
                    });
                }
            });
        }
    }

    private changePassword(req: Request, res: Response, next: NextFunction): void {
        if (!req.body.userEmail || !req.body.userToken || !req.body.userPassword) {
            res.status(400).json({ message: 'You must send userEmail, userPassword and userToken!' });
        } else {
            Database.getConnection((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Get Connection Failed', error: err.message });
                } else {
                    this.usersRepository.getUserByEmail(conn, req.body.userEmail, (err: MysqlError, result: any): void => {
                        conn.release();
                        if (err) {
                            res.status(400).json({ message: err.message });
                        } else if (result) {

                            const user = new User(result);
                            user.userPassword = Bcrypt.hashSync(req.body.userPassword);

                            this.usersRepository.changePassword(conn, user.userEmail, user.userPassword, (err: MysqlError, result: any) => {
                                conn.release();

                                if (err) {
                                    res.status(400).json({ message: 'Failure Change Password!' });
                                } else {
                                    res.status(200).json({ message: 'Successfully Change Password' });
                                }
                            });
                        } else {
                            res.status(200).json({ message: 'Email not found!' });
                        }
                    });
                }
            });
        }
    }

    private confirmEmail(req: Request, res: Response, next: NextFunction): void {
        if (!req.body.userEmail) {
            res.status(400).json({ message: 'You must send userEmail' });
        } else {
            Database.getConnection((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Get Connection Failed', error: err.message });
                } else {
                    this.usersRepository.confirmuUserEmail(conn, req.body.userEmail, (err: MysqlError, result: any): void => {
                        conn.release();
                        if (err) {
                            res.status(400).json({ message: err.message });
                        } else {
                            res.status(200).json({ message: 'Account Activated Successfully' });
                        }
                    });
                }
            });
        }
    }


    private init(): void {
        this.router.post('/login', (req: Request, res: Response, next: NextFunction) => this.login(req, res, next));
        this.router.post('/signup', (req: Request, res: Response, next: NextFunction) => this.signup(req, res, next));
        this.router.post('/recoveryPassword', (req: Request, res: Response, next: NextFunction) => this.recoveryPassword(req, res, next));
        this.router.post('/changePassword', (req: Request, res: Response, next: NextFunction) => this.changePassword(req, res, next));
        this.router.post('/confirmEmail', (req: Request, res: Response, next: NextFunction) => this.confirmEmail(req, res, next));
    }
}
