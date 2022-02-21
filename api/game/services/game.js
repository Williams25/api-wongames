"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const axios = require("axios");
const jsdom = require("jsdom");
const slugify = require("slugify");

const timeOut = (ms) => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve;
    }, ms);
  });
};

const Exeception = (err) => {
  return {
    error: err.data && err.data.errors && err.data.errors,
  };
};

const getGameInfo = async (slug) => {
  try {
    const { JSDOM } = jsdom;
    const body = await axios.default.get(`https://www.gog.com/game/${slug}`);
    const dom = new JSDOM(body.data);

    const description = dom.window.document.querySelector(".description");
    return {
      rating: "BR0",
      short_description: description.textContent.slice(0, 160),
      description: description.innerHTML,
    };
  } catch (error) {
    console.log("getGameInfo ", Exeception(error));
  }
};

const getByName = async (name, entity) => {
  try {
    const item = await strapi.services[entity].find({ name });
    return item.length ? item[0] : null;
  } catch (error) {
    console.log("getByName ", Exeception(error));
  }
};

const create = async (name, entity) => {
  try {
    const item = await getByName(name, entity);

    if (!item) {
      return await strapi.services[entity].create({
        name,
        slug: slugify(name, { lower: true }),
      });
    }
  } catch (error) {
    console.log("create ", Exeception(error));
  }
};

const createManyToManyData = async (products) => {
  try {
    const developers = {};
    const publishers = {};
    const categories = {};
    const platforms = {};

    products.forEach((product) => {
      const { developer, publisher, genres, supportedOperatingSystems } =
        product;

      genres &&
        genres.forEach((item) => {
          categories[item] = true;
        });

      supportedOperatingSystems &&
        supportedOperatingSystems.forEach((item) => {
          platforms[item] = true;
        });

      developers[developer] = true;
      publishers[publisher] = true;
    });

    return Promise.all([
      ...Object.keys(developers).map((key) => create(key, "developer")),
      ...Object.keys(publishers).map((key) => create(key, "publisher")),
      ...Object.keys(categories).map((key) => create(key, "category")),
      ...Object.keys(platforms).map((key) => create(key, "platform")),
    ]);
  } catch (error) {
    console.log("createManyToManyData ", Exeception(error));
  }
};

const createGames = async (products) => {
  try {
    await Promise.all(
      products.map(async (product) => {
        const item = await getByName(product.title, "game");

        if (!item) {
          console.log("creating ", product.title, "...");
          const game = await strapi.services.game.create({
            name: product.title,
            slug: product.slug.replace(/_/g, "-"),
            price: product.price.amount,
            release_date: new Date(
              Number(product.globalReleaseDate) * 1000
            ).toISOString(),
            categories: await Promise.all(
              product.genres.map((name) => getByName(name, "category"))
            ),
            platforms: await Promise.all(
              product.supportedOperatingSystems.map((name) =>
                getByName(name, "platform")
              )
            ),
            developers: [await getByName(product.developer, "developer")],
            publisher: await getByName(product.publisher, "publisher"),
            ...(await getGameInfo(product.slug)),
          });

          await setImage({
            game,
            image: product.image,
          });

          await Promise.all(
            product.gallery.slice(0, 5).map((url) =>
              setImage({
                game,
                image: url,
                field: "gallery",
              })
            )
          );

          await timeOut(2000);
          return game;
        }
      })
    );
  } catch (error) {
    console.log("createGames ", Exeception(error));
  }
};

const setImage = async ({ image, game, field = "cover" }) => {
  try {
    const url = `https:${image}_bg_crop_1680x655.jpg`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(data, "base64");

    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("refId", game.id);
    formData.append("ref", "game");
    formData.append("field", field);
    formData.append("files", buffer, { filename: `${game.slug}.jpg` });

    console.info(`Uploading ${field} image: ${game.slug}.jpg`);

    await axios({
      method: "POST",
      url: `http://${strapi.config.host}:${strapi.config.port}/upload`,
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
    });
  } catch (error) {
    console.log("createGames ", Exeception(error));
  }
};

const populate = async (params) => {
  try {
    const { page, sort } = params;
    const gogApiUrl = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=${page}&sort=${sort}`;
    const {
      data: { products },
    } = await axios.default.get(`${gogApiUrl}`);

    await createManyToManyData(products);
    await createGames(products);

    await getGameInfo(products[0].slug);
  } catch (error) {
    console.log("createGames ", Exeception(error));
  }
};

module.exports = { populate };
