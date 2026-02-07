import cors from 'cors';
import express from 'express';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import pool, { initDb} from './src/config/db.js'; 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas da API
app.use('/api', inventoryRoutes);

const PORT = 3000;

initDb().then(() => { 
    app.listen(PORT, () => { 
        console.log(`Servidor rodando na porta ${PORT}`); 
    });
});

