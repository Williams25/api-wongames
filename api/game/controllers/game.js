"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const populate = async (ctx) => {
  await strapi.services.game.populate();
  ctx.send("Finished pupulating!");
};

module.exports = {
  populate,
};
