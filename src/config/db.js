import dotenv from 'dotenv'; // Importa o dotenv
import pkg from 'pg';

dotenv.config(); // Carrega as variáveis do arquivo .env

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('ERRO AO CONECTAR NO BANCO:', err.message);
    } else {
        console.log('CONEXÃO COM POSTGRES ESTABELECIDA COM SUCESSO!');
    }
});
export default pool;