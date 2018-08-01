export const apiConfig = {
    secret: 'apisecret',
    database: {
        connectionLimit: 10,
        host: 'localhost',
        port: 3300,
        user: 'admin',
        password: 'admin',
        database: 'database',
        multipleStatements: true,
        waitForConnections: true
    }
};
