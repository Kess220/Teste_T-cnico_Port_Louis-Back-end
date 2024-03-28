import express from 'express';
import { generateOrders, readOrders } from '@/controllers/ordersController';

const pedidoRouter = express.Router();

pedidoRouter.get('/pedidos', readOrders);
pedidoRouter.post('/pedidos', generateOrders);


export { pedidoRouter };
