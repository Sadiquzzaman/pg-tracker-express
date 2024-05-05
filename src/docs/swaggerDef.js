const { version } = require("../../package.json");
const config = require("../config/config");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Progress Tracker API documentation",
    version,
  },
  servers: [
    {
      url: `${config.app_url}:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
