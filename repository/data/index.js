const HitOnGsheet = require("./hitOnGsheet");
const User = require("./user");
const ExternalApiRequest = require("./externalApiRequest");

const dataRepoCreator = (container) => {
  const hitOnGsheet = new HitOnGsheet(container);
  const user = new User(container);
  const externalApiRequest = new ExternalApiRequest(container);
  return {
    hitOnGsheet,
    user,
    externalApiRequest,
  };
};

module.exports = dataRepoCreator;
