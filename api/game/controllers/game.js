"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const populate = async (ctx) => {
  const options = {
    sort: "popularity",
    page: 1,
    ...ctx.query,
  };

  await strapi.services.game.populate(options);
  ctx.send("Finished pupulating!");
};

module.exports = {
  populate,
};
