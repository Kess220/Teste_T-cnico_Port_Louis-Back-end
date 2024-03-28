"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function lerArquivosDaPasta(pasta) {
    var caminhoPasta = path.join(__dirname, pasta);
    var arquivos = fs.readdirSync(caminhoPasta);
    var arquivosJSON = [];
    for (var _i = 0, arquivos_1 = arquivos; _i < arquivos_1.length; _i++) {
        var arquivo = arquivos_1[_i];
        var caminhoArquivo = path.join(caminhoPasta, arquivo);
        var conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        var linhas = conteudo.split('\n');
        for (var _a = 0, linhas_1 = linhas; _a < linhas_1.length; _a++) {
            var linha = linhas_1[_a];
            try {
                var objeto = JSON.parse(linha.trim());
                arquivosJSON.push(objeto);
            }
            catch (error) {
                console.error("Erro ao ler o arquivo ".concat(caminhoArquivo, ": ").concat(error.message));
            }
        }
    }
    return arquivosJSON;
}
function validarPedidos(pedidos) {
    var itens = new Set();
    for (var _i = 0, pedidos_1 = pedidos; _i < pedidos_1.length; _i++) {
        var pedido = pedidos_1[_i];
        if (typeof pedido.número_item !== 'number' ||
            typeof pedido.código_produto !== 'string' ||
            typeof pedido.quantidade_produto !== 'number' ||
            typeof pedido.valor_unitário_produto !== 'string') {
            throw new Error('Pedido com formato inválido');
        }
        if (itens.has(pedido.número_item)) {
            throw new Error("N\u00FAmero de item duplicado: ".concat(pedido.número_item));
        }
        itens.add(pedido.número_item);
    }
}
function validarNotas(notas, pedidos) {
    var pedidosMap = new Map();
    for (var _i = 0, pedidos_2 = pedidos; _i < pedidos_2.length; _i++) {
        var pedido = pedidos_2[_i];
        pedidosMap.set(pedido.número_item, pedido);
    }
    for (var _a = 0, notas_1 = notas; _a < notas_1.length; _a++) {
        var nota = notas_1[_a];
        if (typeof nota.id_pedido !== 'number' ||
            typeof nota.número_item !== 'number' ||
            typeof nota.quantidade_produto !== 'number') {
            throw new Error('Nota com formato inválido');
        }
        if (!pedidosMap.has(nota.id_pedido)) {
            throw new Error("Pedido n\u00E3o encontrado para nota: ".concat(nota.id_pedido));
        }
        var pedido = pedidosMap.get(nota.id_pedido);
        if (nota.número_item < 1 || nota.número_item > pedido.quantidade_produto) {
            throw new Error("N\u00FAmero de item inv\u00E1lido para pedido: ".concat(nota.número_item, " no pedido ").concat(nota.id_pedido));
        }
    }
}
function gerarPedidosPendentes(pedidos, notas) {
    var pendentes = [];
    var _loop_1 = function (pedido) {
        var notasDoPedido = notas.filter(function (nota) { return nota.id_pedido === pedido.número_item; });
        var itensPendentes = [];
        var _loop_2 = function (i) {
            var quantidadeNota = notasDoPedido.reduce(function (total, nota) { return nota.número_item === i ? total + nota.quantidade_produto : total; }, 0);
            var saldoQuantidade = pedido.quantidade_produto - quantidadeNota;
            if (saldoQuantidade > 0) {
                itensPendentes.push({ número_item: i, saldo_quantidade: saldoQuantidade });
            }
        };
        for (var i = 1; i <= pedido.quantidade_produto; i++) {
            _loop_2(i);
        }
        if (itensPendentes.length > 0) {
            var valor_total_pedido = pedido.quantidade_produto * parseFloat(pedido.valor_unitário_produto);
            var totalNotas = notasDoPedido.reduce(function (total, nota) { return total + (nota.quantidade_produto * parseFloat(pedido.valor_unitário_produto)); }, 0);
            var saldo_valor = valor_total_pedido - totalNotas;
            pendentes.push({ id_pedido: pedido.número_item, valor_total_pedido: valor_total_pedido, saldo_valor: saldo_valor, itens_pendentes: itensPendentes });
        }
    };
    for (var _i = 0, pedidos_3 = pedidos; _i < pedidos_3.length; _i++) {
        var pedido = pedidos_3[_i];
        _loop_1(pedido);
    }
    var formattedData = pendentes.map(function (pedido) {
        var itens = pedido.itens_pendentes.map(function (item) { return "Item ".concat(item.número_item, ": saldo quantidade ").concat(item.saldo_quantidade); }).join('\n');
        return "ID do Pedido: ".concat(pedido.id_pedido, "\nValor Total do Pedido: R$ ").concat(pedido.valor_total_pedido.toFixed(2), "\nSaldo do Valor: R$ ").concat(pedido.saldo_valor.toFixed(2), "\nItens Pendentes:\n").concat(itens, "\n");
    }).join('\n');
    fs.writeFileSync('./pedidosPendentes.txt', formattedData);
}
try {
    var pedidos = lerArquivosDaPasta('data/pedidos');
    var notas = lerArquivosDaPasta('data/notas');
    // console.log("pedidos lidos", JSON.stringify(pedidos, null, 2));
    // console.log("notas lidas", JSON.stringify(notas, null, 2));
    validarPedidos(pedidos);
    validarNotas(notas, pedidos);
    gerarPedidosPendentes(pedidos, notas);
}
catch (error) {
    console.error(error.message);
}
