'use strict';

/**
 * encomenda controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::encomenda.encomenda', ({ strapi }) => ({
  async create(ctx) {
    // cria a encomenda normalmente (o frontend NÃO envia o utilizador)
    const response = await super.create(ctx);

    // liga a encomenda ao utilizador autenticado (a partir do JWT — seguro,
    // ninguém pode fingir que a compra é de outra pessoa)
    const userId = ctx.state.user?.id;
    if (userId && response?.data?.documentId) {
      await strapi.documents('api::encomenda.encomenda').update({
        documentId: response.data.documentId,
        data: { utilizador: userId },
      });
    }
    return response;
  },
}));
