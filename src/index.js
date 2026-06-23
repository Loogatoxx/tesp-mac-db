'use strict';

/**
 * Acoes de leitura para o role Public (acesso anonimo / restrito).
 * Cumpre o RF-001 e o requisito de "API a funcionar no modo anonimo".
 */
const PUBLIC_ACTIONS = [
  'api::produto.produto.find',
  'api::produto.produto.findOne',
  'api::encomenda.encomenda.find',
  'api::encomenda.encomenda.findOne',
];

/**
 * CRUD completo para o role Authenticated (utilizador com login / mais liberdade).
 * Cumpre o requisito de 2 niveis de acesso diferentes (sec. 2.3 da ERS).
 */
const AUTHENTICATED_ACTIONS = [
  'api::produto.produto.find',
  'api::produto.produto.findOne',
  'api::produto.produto.create',
  'api::produto.produto.update',
  'api::produto.produto.delete',
  'api::encomenda.encomenda.find',
  'api::encomenda.encomenda.findOne',
  'api::encomenda.encomenda.create',
  'api::encomenda.encomenda.update',
  'api::encomenda.encomenda.delete',
];

/**
 * Garante (de forma idempotente) que um role tem um conjunto de permissoes.
 * Corre em cada arranque, em qualquer ambiente (local e Strapi Cloud),
 * por isso as permissoes ficam definidas em codigo e versionadas.
 */
async function ensurePermissions(strapi, roleType, actions) {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } });

  if (!role) {
    strapi.log.warn(`[bootstrap] Role "${roleType}" nao encontrado.`);
    return;
  }

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
    }
  }
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    try {
      await ensurePermissions(strapi, 'public', PUBLIC_ACTIONS);
      await ensurePermissions(strapi, 'authenticated', AUTHENTICATED_ACTIONS);
      strapi.log.info('[bootstrap] Permissoes Public/Authenticated garantidas.');
    } catch (err) {
      strapi.log.error(`[bootstrap] Falha ao definir permissoes: ${err.message}`);
    }
  },
};
