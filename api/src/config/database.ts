import * as mysql from 'mysql';
import { apiConfig } from '../../api-config';

export class Database {

    private static instance: Database;
    private static pool: mysql.Pool;

    private constructor() {
        Database.initPool();
    }

    public static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private static checkConnection() {
        this.pool.getConnection((err: mysql.MysqlError, conn: mysql.PoolConnection) => {
            // connected! (unless `err` is set)
            if (err) {
                console.error('Connections Unavailable.');
            } else {
                console.log('Connections Available.');
                conn.release();
            }
        });
    }

    public static getConnection(next: (err: mysql.MysqlError, conn: mysql.PoolConnection) => void): void {
        this.pool.getConnection((err: mysql.MysqlError, conn: mysql.PoolConnection) => {
            err ? next(err, undefined) : next(undefined, conn);
        });
    }

    public static startTransaction(next: (err: mysql.MysqlError, conn: mysql.PoolConnection) => void): void {
        this.pool.getConnection((err: mysql.MysqlError, conn: mysql.PoolConnection): void => {
            if (err) {
                next(err, undefined);
            } else {
                conn.beginTransaction((err: mysql.MysqlError) => {
                    if (err) {
                        conn.release();
                        next(err, undefined);
                    }
                    next(undefined, conn);
                });
            }
        });
    }

    public static commitTransaction(conn: mysql.PoolConnection, next: (err: mysql.MysqlError) => void): void {
        conn.commit((err: mysql.MysqlError): void => {
            if (err) {
                conn.rollback((): void => {
                    conn.release();
                    next(err);
                });
            } else {
                next(undefined);
            }
        });
    }

    public static rollbackTransaction(conn: mysql.PoolConnection, next: (err: mysql.MysqlError) => void): void {
        conn.rollback((err: mysql.MysqlError): void => {
            conn.release();
            next(err);
        });
    }


    private static initPool(): void {
        console.log('Init Database Module!');
        this.pool = mysql.createPool(apiConfig.database);

        this.pool.on('connection', (con: mysql.PoolConnection) => {
            console.log(`Connection ${con.threadId} connected.`);
        });

        this.pool.on('acquire', (con: mysql.PoolConnection) => {
            console.log(`Connection ${con.threadId} acquired.`);
        });

        this.pool.on('release', (con: mysql.PoolConnection) => {
            console.log(`Connection ${con.threadId} released.`);
        });

        this.pool.on('enqueue', (con: mysql.PoolConnection) => {
            console.log('Waiting for available connection slot.');
        });
    }
}


