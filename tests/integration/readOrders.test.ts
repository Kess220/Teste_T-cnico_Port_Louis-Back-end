import supertest from 'supertest';
import app from '@/app';
import fs from 'fs';
import path from 'path';
import httpStatus from 'http-status';


const server = supertest(app);

describe('GET /pedidos', () => {
  it('should respond with status 409 when body is not given', async () => {
    const response = await server.get('/pedidos');

    expect(response.status).toBe(httpStatus.CONFLICT);
  });
})
describe('POST /api/gerarPedidos', () => {
  it('should return status 200 and file content', async () => {
    const requestData = {
      requests: [
        {
          "número_item": 1,
          "código_produto": "A22",
          "quantidade_produto": 5,
          "valor_unitário_produto": "10.00"
        },
        {
          "número_item": 2,
          "código_produto": "B33",
          "quantidade_produto": 8,
          "valor_unitário_produto": "5.00"
        }
      ],
      grades: [
        {
          "id_pedido": 1,
          "número_item": 1,
          "quantidade_produto": 3
        },
        {
          "id_pedido": 2,
          "número_item": 2,
          "quantidade_produto": 6
        }
      ]
    };

    const response = await server
      .post('/pedidos')
      .send(requestData);

    expect(response.status).toBe(200);

    const fileName = 'pedidosPendentes.txt';
    const pathFile = path.join(__dirname, '..', '..', fileName);
    fs.readFile(pathFile, 'utf8', (err, data) => {
      if (err) {
        return;
      }

      expect(response.text).toEqual(data);
    });
  });
});