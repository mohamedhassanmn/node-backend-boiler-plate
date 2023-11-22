const _ = require("lodash");
const passport = require("passport");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const authValidator = (req, res, next) => {
  if (req.isAuthenticated() && req?.user?.email) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

module.exports = { authValidator };
