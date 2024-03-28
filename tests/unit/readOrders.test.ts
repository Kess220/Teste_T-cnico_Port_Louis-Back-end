import fs from 'fs';
import * as path from 'path';
import {
  validateOrders,
  validateNotes,
  generatePendingOrders,
  readFolderFiles,
  OrderItem,
  NoteItem,
} from '@/services/ordersService';
import { duplicatedError, invalidFormatError, notFoundError } from '@/errors';

describe('validateOrders', () => {
  it('should throw error for invalid format', () => {
    const invalidRequests: any = [
      { número_item: '1', código_produto: 'A22', quantidade_produto: 5, valor_unitário_produto: '10.00' },
      { número_item: 2, código_produto: 'B33', quantidade_produto: 8, valor_unitário_produto: '5.00' },
    ];

    expect(() => validateOrders(invalidRequests as OrderItem[])).toThrowError(invalidFormatError('Pedido com formato inválido'));
  });

  it('should throw error for duplicated item number', () => {
    const requests: OrderItem[] = [
      { número_item: 1, código_produto: 'A22', quantidade_produto: 5, valor_unitário_produto: '10.00' },
      { número_item: 1, código_produto: 'B33', quantidade_produto: 8, valor_unitário_produto: '5.00' },
    ];
  
    expect(() => validateOrders(requests)).toThrowError(duplicatedError('Número de item duplicado: 1'));
  });

});

describe('validateNotes', () => {
  it('should throw error for invalid format', () => {
    const invalidGrades: any = [
      { id_pedido: 1, número_item: '1', quantidade_produto: 3 },
      { id_pedido: 2, número_item: 2, quantidade_produto: '6' },
    ];

    const requests: OrderItem[] = [
      { número_item: 1, código_produto: 'A22', quantidade_produto: 5, valor_unitário_produto: '10.00' },
      { número_item: 2, código_produto: 'B33', quantidade_produto: 8, valor_unitário_produto: '5.00' },
    ];

    expect(() => validateNotes(invalidGrades as NoteItem[], requests)).toThrowError(invalidFormatError('Nota com formato inválido'));
  });

  it('should throw error for not found order', () => {
    const grades: NoteItem[] = [
      { id_pedido: 1, número_item: 1, quantidade_produto: 3 },
      { id_pedido: 2, número_item: 2, quantidade_produto: 6 },
    ];

    const requests: OrderItem[] = [
      { número_item: 1, código_produto: 'A22', quantidade_produto: 5, valor_unitário_produto: '10.00' },
    ];

    expect(() => validateNotes(grades, requests)).toThrowError(notFoundError('Pedido não encontrado para nota: 2'));
  });

});

describe('generatePendingOrders', () => {
  it('should generate pending orders', () => {
    const requests: OrderItem[] = [
      { número_item: 1, código_produto: 'A22', quantidade_produto: 5, valor_unitário_produto: '10.00' },
    ];

    const grades: NoteItem[] = [
      { id_pedido: 1, número_item: 1, quantidade_produto: 3 },
    ];

    generatePendingOrders(requests, grades);

    const filePath = path.join(__dirname, '..', '..', 'pedidosPendentes.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('ID do Pedido: 1');
  });

});

