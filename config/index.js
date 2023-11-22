const prod = require("./config-prod");
const stag = require("./config-stage");

const activeEnv =
  process.env.ACTIVE_ENV === "PRODUCTION" ? "PRODUCTION" : "STAGING";

// eslint-disable-next-line no-console
console.log(`ACTIVE_ENV: ${activeEnv}`);

const config = activeEnv == "PRODUCTION" ? prod : stag;

module.exports = config;
