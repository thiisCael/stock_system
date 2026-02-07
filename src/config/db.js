import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD, // <--- Aqui que está o erro, ele está chegando vazio
  port: process.env.DB_PORT,
});


//funcao que cria as tabelas automaticamente 
export const initDb = async() => { 
  const client = await pool.connect(); 
  try{ 
    //1 cria a tabela de produtos se não existir 
    await client.query(` 
        CREATE TABLE IF NOT EXISTS produtos ( 
        id SERIAL PRIMARY KEY, 
        nome VARCHAR(255) NOT NULL, 
        categoria VARCHAR(100), 
        sku VARCHAR(50) NOT NULL, 
        lote VARCHAR(50), 
        saldo_atual INTEGER DEFAULT 0, 
        data_vencimento DATE,
        data_cadastro DATE DEFAULT CURRENT_DATE
        );
    `);
    //2 cria a tabel de movimentacoes se não existir 
    await client.query(`
      CREATE TABLE IF NOT EXISTS movimentacoes( 
        id SERIAL PRIMARY KEY,
        produto_id INTEGER REFERENCES produtos(id),
        tipo VARCHAR(20) NOT NULL, 
        quantidade INTEGER NOT NULL, 
        responsavel VARCHAR(100), 
        data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
      );
    `);
    console.log("Banco de dados verificado/criado com sucesso!"); 
  }catch(error) { 
      console.error("Erro ao iniciar banco de dados", error); 
  }finally{ 
    client.release();
  }
};
export default pool;
