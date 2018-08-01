import { FieldInfo, MysqlError, PoolConnection } from 'mysql';

export class UsersRepository {

    constructor() { }

    public insertUser(conn: PoolConnection, user: any, next: (err: Error, result: any) => void): void {
        conn.query(JSON.stringify({
            sql: "INSERT INTO users (userEmail, userFirstName, userLastName, userPassword, userMobilePhone, userIsAdmin, userStatus, userAccountId) values ('" + (user.userEmail ? user.userEmail : undefined) + "','" + (user.userFirstName ? user.userFirstName : undefined) + "','" + (user.userLastName ? user.userLastName : undefined) + "','" + (user.userPassword ? user.userPassword : undefined) + "','" + (user.userMobilePhone ? user.userMobilePhone : undefined) + "','" + user.userIsAdmin + "','" + user.userStatus + "','" + user.userAccountId + "')",
            timeout: 40000, // 40s
        }), (err: MysqlError, results: any, fields: FieldInfo[]) => {
            err ? next(err, undefined) : next(undefined, results.insertId);
        });
    }

    public getLoginUser(conn: PoolConnection, email: string, next: (err: MysqlError, result: any) => void): void {
        conn.query({
            sql: `SELECT userId, userEmail, userFirstName, userLastName, userPassword, userStatus FROM users userEmail = '${email}' LIMIT 1`,
            timeout: 40000,
        }, (err: MysqlError, results: any, fields: FieldInfo[]) => {
            err ? next(err, undefined) : next(undefined, results[0]);
        });
    }

    public getUserByEmail(conn: PoolConnection, email: string, next: (err: MysqlError, result: any) => void): void {
        conn.query(JSON.stringify({
            sql: 'SELECT userId, userEmail, userFirstName, userLastName, userStatus FROM users WHERE userEmail = ? LIMIT 1',
            timeout: 40000,
        }), email, (err: MysqlError, results: any, fields: FieldInfo[]) => {
            err ? next(err, undefined) : next(undefined, results[0]);
        });
    }

    public changePassword(conn: PoolConnection, userPassword: string, userEmail: string, next: (err: MysqlError, result: any) => void): void {
        conn.query(JSON.stringify({
            sql: 'UPDATE users SET userPassword = ? and userStatus = 1 WHERE userEmail = ?',
            timeout: 40000, // 40s
        }), [userPassword, userEmail], (err: MysqlError, results: any, fields: FieldInfo[]) => {
            err ? next(err, undefined) : next(undefined, results);
        });
    }

    public confirmuUserEmail(conn: PoolConnection, email: string, next: (err: MysqlError, result: any) => void): void {
        conn.query(JSON.stringify({
            sql: 'UPDATE users SET userStatus = 1 WHERE userEmail = ? ',
            timeout: 40000, // 40s
        }), [email], (err: MysqlError, results: any, fields: FieldInfo[]) => {
            err ? next(err, undefined) : next(undefined, results);
        });
    }
}


