import cors from 'cors';
import express from 'express';
import inventoryRoutes from './src/routes/inventoryRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas da API
app.use('/api', inventoryRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor a rodar em http://localhost:${PORT}`);
}); 