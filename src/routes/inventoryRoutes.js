import { Router } from 'express';
import { addProduct, getMovements, getProducts, getReport, postMovement } from '../controllers/inventoryController.js';

const router = Router();

router.get('/produtos', getProducts); 
router.post('/produtos', addProduct); 
router.get('/movimentacoes', getMovements); 
router.post('/movimentacoes', postMovement); 
router.get('/relatorios/pesquisa', getReport);
export default router;