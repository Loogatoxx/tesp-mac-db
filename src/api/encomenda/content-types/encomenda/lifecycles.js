'use strict';

// Quando uma Encomenda é criada, baixa automaticamente o stock dos produtos comprados.
// Corre no SERVIDOR (Strapi), por isso o cliente NÃO precisa de permissão para editar produtos.
// Usa o campo `itens` (JSON) da encomenda, que traz { documentId, quantidade } de cada linha.
module.exports = {
  async afterCreate(event) {
    const itens = event.params?.data?.itens;
    if (!Array.isArray(itens)) return;

    for (const item of itens) {
      if (!item || !item.documentId || !item.quantidade) continue;
      try {
        const produto = await strapi
          .documents('api::produto.produto')
          .findOne({ documentId: item.documentId });
        if (!produto) continue;

        const novoStock = Math.max(0, (produto.Stock || 0) - item.quantidade);
        await strapi.documents('api::produto.produto').update({
          documentId: item.documentId,
          data: { Stock: novoStock },
        });
      } catch (err) {
        strapi.log.error('[encomenda.afterCreate] erro a baixar stock: ' + err.message);
      }
    }
  },
};
