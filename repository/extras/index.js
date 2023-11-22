const SendGridMail = require("./sendGridMail");
const Passport = require("./initializePassport");

const extras = (container) => {
  const sendGridMail = new SendGridMail(container);
  const passport = new Passport(container);
  return {
    sendGridMail,
    passport,
  };
};

module.exports = extras;
