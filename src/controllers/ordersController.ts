import { Request, Response } from 'express';
import { readFolderFiles, validateOrders, validateNotes, generatePendingOrders, OrderItem,NoteItem } from '../services/ordersService';
import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';

export function readOrders(req: Request, res: Response): void {
  const requests = readFolderFiles<OrderItem>('../data/pedidos');
  const grades = readFolderFiles<NoteItem>('../data/notas');

  validateOrders(requests);
  validateNotes(grades, requests);
 generatePendingOrders(requests, grades);

  res.status(httpStatus.OK).json({ message: 'Pedidos lidos e pendentes gerados com sucesso' });
}

export function generateOrders(req: Request, res: Response): void {
  const { requests, grades } = req.body;

  validateOrders(requests);
  validateNotes(grades, requests);
 generatePendingOrders(requests, grades);

  const fileName = 'pedidosPendentes.txt';
  const pathFile = path.join(__dirname, '..', '..', fileName);

  fs.readFile(pathFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Erro ao ler o arquivo' });
      return;
    }

    res.status(httpStatus.OK).send(data);
  });
}