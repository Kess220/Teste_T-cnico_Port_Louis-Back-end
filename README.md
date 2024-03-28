# Desafio Port Louis

Teste Técnico Port Louis - Back-end

## Pré-requisitos

- Node.js
- npm ou yarn

## Instalação

1. Clone o repositório: `git clone https://github.com/Kess220/Teste_T-cnico_Port_Louis-Back-end`
2. Instale as dependências: `npm install`

## Uso

1. Execute o projeto: `npm start` ou `yarn start`
2. Abra seu navegador ou Insomnia/Postman e acesse `http://localhost:3000`

## Rotas

- `GET /pedidos`: Esta rota traz os dados dos pedidos pendentes e cria um arquivo na raiz do projeto, ou retorna uma exceção, se houver.
- `POST /pedidos`: Esta rota aceita dados personalizados, trazendo os pedidos pendentes existentes, criando um arquivo na raiz do projeto, ou retornando uma exceção.

## Formato dos Dados

```json
{
  "requests": [
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
  "grades": [
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
}


```
## Testes Automatizados 

- A aplicação contem testes integrados e unitários

```bash
npm run test 
```
para testar um tipo de teste especifico:
```bash
npm run test unit/integration
```

