"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const axios = require("axios");
const jsdom = require("jsdom");
const slugify = require("slugify");

const getGameInfo = async (slug) => {
  const { JSDOM } = jsdom;
  const body = await axios.default.get(`https://www.gog.com/game/${slug}`);
  const dom = new JSDOM(body.data);

  const description = dom.window.document.querySelector(".description");
  return {
    rating: "BR0",
    short_description: description.textContent.slice(0, 160),
    description: description.innerHTML,
  };
};

const getByName = async (name, entity) => {
  const item = await strapi.services[entity].find({ name });
  return item.length ? item[0] : null;
};

const create = async (name, entity) => {
  const item = await getByName(name, entity);

  if (!item) {
    return await strapi.services[entity].create({
      name,
      slug: slugify(name, { lower: true }),
    });
  }
};

const populate = async (params) => {
  const gogApiUrl = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`;
  const {
    data: { products },
  } = await axios.default.get(`${gogApiUrl}`);

  for (let i = 0; i < products.length; i++) {
    await create(products[i].publisher, "publisher");
    await create(products[i].developer, "developer");
  }

  await getGameInfo(products[0].slug);
};

module.exports = { populate };
