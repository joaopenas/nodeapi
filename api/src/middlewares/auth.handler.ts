import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { apiConfig } from '../../api-config';
import { User } from '../models/user.model';

export class AuthHandler {

    constructor() { }

    public getLoginToken(user: User): string {
        return jwt.sign({ user: user }, apiConfig.secret, { expiresIn: '24h' });
    }

    public getConfirmationToken(user: User): string {
        return jwt.sign(user.userEmail, apiConfig.secret, { audience: user.userEmail, expiresIn: '5d' });
    }

    private extractToken(req: Request): string {
        let token = undefined;

        if (req.headers && req.headers.authorization) {
            const tokenParts: string[] = req.headers.authorization.toString().split(' ');
            if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
                token = tokenParts[1];
            }
        } else if (req.params && req.query.Bearer) {
            token = req.query.Bearer;
        }

        return token;
    }

    public handleStaticAuthorization(req: Request, res: Response, next: NextFunction): void {
        // Extract token
        const token = this.extractToken(req);

        // Verify token
        if (!token) {
            res.setHeader('WWW-Autheticate', 'Bearer token_type="JWT');
            res.status(401).json({ message: 'Authenthication token required.' });
        } else {

            jwt.verify(token, apiConfig.secret, (err, decoded) => {
                return decoded ? next() : res.status(401).json({ message: 'Unauthorized.' });
            });
        }
    }

    public handleAuthorization(req: Request, res: Response, next: NextFunction): void {
        // Extract token
        const token = this.extractToken(req);
        const audience = req.body.audience;

        // Decode token
        req.headers.token = JSON.stringify(jwt.decode(token));

        // Verify token
        if (!token) {
            res.setHeader('WWW-Autheticate', 'Bearer token_type="JWT');
            res.status(401).json({ message: 'Authenthication token required' });
        } else {
            if (audience) {
                jwt.verify(token, apiConfig.secret, { audience: audience }, (err, decoded) => {
                    return decoded ? next() : res.status(401).json({ message: 'Unauthorized.' });
                });
            } else {
                jwt.verify(token, apiConfig.secret, (err, decoded) => {
                    return decoded ? next() : res.status(401).json({ message: 'Unauthorized.' });
                });
            }
        }
    }
}