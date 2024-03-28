import { invalidFormatError, notFoundError } from '@/errors';
import { duplicatedError } from '@/errors/duplicated-error';
import * as fs from 'fs';
import path = require('path');
import { basename } from 'path';


export interface OrderItem {
  número_item: number;
  código_produto: string;
  quantidade_produto: number;
  valor_unitário_produto: string;
}

export interface NoteItem {
  id_pedido: number;
  número_item: number;
  quantidade_produto: number;
}

export function readFolderFiles<T>(pasta: string): T[] {
  const pathFolder = path.join(__dirname, pasta);
  const files = fs.readdirSync(pathFolder);
  const filesJSON: T[] = [];

  for (const file of files) {
    const pathFile = path.join(pathFolder, file);
    const fileName = basename(file, path.extname(file)); // obtém o nome do arquivo sem a extensão
    const content = fs.readFileSync(pathFile, 'utf-8');
    const lines = content.split('\n');
  
    for (const line of lines) {
      try {
        const objeto = JSON.parse(line.trim()) as T;
        filesJSON.push({ ...objeto, id_pedido: fileName });
      } catch (error:any) {
        console.error(`Erro ao ler o arquivo ${pathFile}: ${error.message}`);
      }
    }
  }

  return filesJSON;
}

export function validateOrders(requests: OrderItem[]): void {
  const items = new Set<number>();
  for (const request of requests) {
    if (
      typeof request.número_item !== 'number' ||
      typeof request.código_produto !== 'string' ||
      typeof request.quantidade_produto !== 'number' ||
      typeof request.valor_unitário_produto !== 'string'
    ) {
      throw invalidFormatError('Pedido com formato inválido');
    }

    if (items.has(request.número_item)) {
      throw duplicatedError(`Número de item duplicado: ${request.número_item}`);
    }
    items.add(request.número_item);
  }
}

export function validateNotes(grades: NoteItem[], requests: OrderItem[]): void {
  const requestsMap = new Map<number, OrderItem>();
  for (const request of requests) {
    requestsMap.set(request.número_item, request);
  }

  for (const grade of grades) {
    if (
      typeof grade.id_pedido !== 'number' ||
      typeof grade.número_item !== 'number' ||
      typeof grade.quantidade_produto !== 'number'
    ) {
      throw invalidFormatError('Nota com formato inválido');
    }

    if (!requestsMap.has(grade.id_pedido)) {
      throw notFoundError(`Pedido não encontrado para nota: ${grade.id_pedido}`);
    }

    const request = requestsMap.get(grade.id_pedido)!;
    if (grade.número_item < 1 || grade.número_item > request.quantidade_produto) {
      throw invalidFormatError(`Número de item inválido para pedido: ${grade.número_item} no pedido ${grade.id_pedido}`);
    }
  }
}

export function generatePendingOrders(requests: OrderItem[], grades: NoteItem[]): void {
  const pending: {
    id_pedido: number;
    valor_total_pedido: number;
    saldo_valor: number;
    itens_pendentes: { número_item: number; saldo_quantidade: number }[];
  }[] = [];

  for (const request of requests) {
    const Ordernotes = grades.filter(nota => nota.id_pedido === request.número_item);
    const pendingItems: { número_item: number; saldo_quantidade: number }[] = [];

    for (let i = 1; i <= request.quantidade_produto; i++) {
      const quantityNote = Ordernotes.reduce((total, nota) => nota.número_item === i ? total + nota.quantidade_produto : total, 0);
      const balanceQuantity = request.quantidade_produto - quantityNote;
      if (balanceQuantity > 0) {
        pendingItems.push({ número_item: i, saldo_quantidade: balanceQuantity });
      }
    }

    if (pendingItems.length > 0) {
      const total_order_value = request.quantidade_produto * parseFloat(request.valor_unitário_produto);

      const totalNotes = Ordernotes.reduce((total, nota) => total + (nota.quantidade_produto * parseFloat(request.valor_unitário_produto)), 0);
      const balance_value = total_order_value - totalNotes;

      pending.push({ id_pedido: request.número_item, valor_total_pedido:total_order_value, saldo_valor:balance_value, itens_pendentes: pendingItems });
    }
  }

  const formattedData = pending.map(request => {
    const itens = request.itens_pendentes.map(item => `Item ${item.número_item}: saldo quantidade ${item.saldo_quantidade}`).join('\n');
    return `ID do Pedido: ${request.id_pedido}\nValor Total do Pedido: R$ ${request.valor_total_pedido.toFixed(2)}\nSaldo do Valor: R$ ${request.saldo_valor.toFixed(2)}\nItens Pendentes:\n${itens}\n`;
  }).join('\n');

  fs.writeFileSync('./pedidosPendentes.txt', formattedData);
}
