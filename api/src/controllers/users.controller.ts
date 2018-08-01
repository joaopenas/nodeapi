import { Router, Request, Response, NextFunction } from 'express';
import { Database } from '../config/database';
import { UsersRepository } from '../repositories/users.repository';
import { PoolConnection, MysqlError } from 'mysql';
import { User } from '../models/user.model';

export class UsersController {

    public router: Router;
    private usersRepository: UsersRepository;

    constructor() {
        this.router = Router();
        this.usersRepository = new UsersRepository();
        this.init();
    }

    private getUserByEmail(req: Request, res: Response, next: NextFunction): void {
        if (!req.params.email) {
            res.status(400).send({ message: 'You must send an email' });
        } else {
            Database.getConnection((err: MysqlError, conn: PoolConnection): void => {
                if (err) {
                    res.status(500).json({ message: 'Get Connection Failed', error: err.message });
                } else {
                    this.usersRepository.getUserByEmail(conn, req.params.email, (err: any, user: User) => {
                        conn.release();
                        if (!user) {
                            return res.status(201).send({ message: 'User is not exist!' });
                        } else {
                            res.status(200).send({ user: user });
                        }
                    });
                }
            });
        }
    }

    private init(): void {
        // this.router.get('/getUserByEmail:email', this.getUserByEmail);
        this.router.get('/getUserByEmail/:email', (req: Request, res: Response, next: NextFunction) => this.getUserByEmail(req, res, next));
    }

}
