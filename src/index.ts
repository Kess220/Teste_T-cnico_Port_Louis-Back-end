import * as fs from 'fs';
import path = require('path');

interface PedidoItem {
  número_item: number;
  código_produto: string;
  quantidade_produto: number;
  valor_unitário_produto: string;
}

interface NotaItem {
  id_pedido: number;
  número_item: number;
  quantidade_produto: number;
  
}

function lerArquivosDaPasta<T>(pasta: string): T[] {
  const caminhoPasta = path.join(__dirname, pasta);
  const arquivos = fs.readdirSync(caminhoPasta);
  const arquivosJSON: T[] = [];

  for (const arquivo of arquivos) {
    const caminhoArquivo = path.join(caminhoPasta, arquivo);
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
    const linhas = conteudo.split('\n');

    for (const linha of linhas) {
      try {
        const objeto = JSON.parse(linha.trim()) as T;
        arquivosJSON.push(objeto);
      } catch (error:any) {
        console.error(`Erro ao ler o arquivo ${caminhoArquivo}: ${error.message}`);
      }
    }
  }

  return arquivosJSON;
}




function validarPedidos(pedidos: PedidoItem[]): void {
  const itens = new Set<number>();
  for (const pedido of pedidos) {
    if (
      typeof pedido.número_item !== 'number' ||
      typeof pedido.código_produto !== 'string' ||
      typeof pedido.quantidade_produto !== 'number' ||
      typeof pedido.valor_unitário_produto !== 'string'
    ) {
      throw new Error('Pedido com formato inválido');
    }

    if (itens.has(pedido.número_item)) {
      throw new Error(`Número de item duplicado: ${pedido.número_item}`);
    }
    itens.add(pedido.número_item);
  }
}


function validarNotas(notas: NotaItem[], pedidos: PedidoItem[]): void {
  const pedidosMap = new Map<number, PedidoItem>();
  for (const pedido of pedidos) {
    pedidosMap.set(pedido.número_item, pedido);
  }

  for (const nota of notas) {
    if (
      typeof nota.id_pedido !== 'number' ||
      typeof nota.número_item !== 'number' ||
      typeof nota.quantidade_produto !== 'number'
    ) {
      throw new Error('Nota com formato inválido');
    }

    if (!pedidosMap.has(nota.id_pedido)) {
      throw new Error(`Pedido não encontrado para nota: ${nota.id_pedido}`);
    }

    const pedido = pedidosMap.get(nota.id_pedido)!;
    if (nota.número_item < 1 || nota.número_item > pedido.quantidade_produto) {
      throw new Error(`Número de item inválido para pedido: ${nota.número_item} no pedido ${nota.id_pedido}`);
    }
  }
}

function gerarPedidosPendentes(pedidos: PedidoItem[], notas: NotaItem[]): void {
  const pendentes: {
    id_pedido: number;
    valor_total_pedido: number;
    saldo_valor: number;
    itens_pendentes: { número_item: number; saldo_quantidade: number }[];
  }[] = [];

  for (const pedido of pedidos) {
    const notasDoPedido = notas.filter(nota => nota.id_pedido === pedido.número_item);
    const itensPendentes: { número_item: number; saldo_quantidade: number }[] = [];

    for (let i = 1; i <= pedido.quantidade_produto; i++) {
      const quantidadeNota = notasDoPedido.reduce((total, nota) => nota.número_item === i ? total + nota.quantidade_produto : total, 0);
      const saldoQuantidade = pedido.quantidade_produto - quantidadeNota;
      if (saldoQuantidade > 0) {
        itensPendentes.push({ número_item: i, saldo_quantidade: saldoQuantidade });
      }
    }

    if (itensPendentes.length > 0) {
      const valor_total_pedido = pedido.quantidade_produto * parseFloat(pedido.valor_unitário_produto);

      const totalNotas = notasDoPedido.reduce((total, nota) => total + (nota.quantidade_produto * parseFloat(pedido.valor_unitário_produto)), 0);
      const saldo_valor = valor_total_pedido - totalNotas;

      pendentes.push({ id_pedido: pedido.número_item, valor_total_pedido, saldo_valor, itens_pendentes: itensPendentes });
    }
  }

  const formattedData = pendentes.map(pedido => {
    const itens = pedido.itens_pendentes.map(item => `Item ${item.número_item}: saldo quantidade ${item.saldo_quantidade}`).join('\n');
    return `ID do Pedido: ${pedido.id_pedido}\nValor Total do Pedido: R$ ${pedido.valor_total_pedido.toFixed(2)}\nSaldo do Valor: R$ ${pedido.saldo_valor.toFixed(2)}\nItens Pendentes:\n${itens}\n`;
  }).join('\n');

  fs.writeFileSync('./pedidosPendentes.txt', formattedData);
}



try {
  const pedidos = lerArquivosDaPasta<PedidoItem>('data/pedidos');
  const notas = lerArquivosDaPasta<NotaItem>('data/notas');
  
  // console.log("pedidos lidos", JSON.stringify(pedidos, null, 2));
  // console.log("notas lidas", JSON.stringify(notas, null, 2));

  validarPedidos(pedidos);
  validarNotas(notas, pedidos);
  gerarPedidosPendentes(pedidos, notas);
} catch (error: any) {
  console.error(error.message);
}
