const LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

class Passport {
  constructor(container) {
    this.userData = container.resolve("userData");
    this.utility = container.resolve("utility");
    this.table = "<USER_TABLE_NAME>";
    this.authenticateUser = this.authenticateUser.bind(this);
  }

  async authenticateUser(enteredEmail, enteredPassword, done) {
    const [err, userResponseArr] = await this.utility.invoker(
      this.userData.fetchAllUserMatches("email", enteredEmail)
    );
    if (err) {
      done(err);
    }
    if (userResponseArr.length) {
      const password = userResponseArr[0].user_password;
      const isMatch = await this.utility.unMaskInput(password, enteredPassword);
      if (isMatch) {
        done(null, userResponseArr[0], {
          message: "Authentication Successfull!!",
        });
      } else {
        done(null, false, { message: "Incorrect Password!!" });
      }
    } else {
      done(null, false, { message: "Incorrect EmailId!!" });
    }
  }

  passportInit(passport, next) {
    passport.use(
      "userSession",
      new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        this.authenticateUser
      )
    );
    passport.use(
      new JWTstrategy(
        {
          secretOrKey: process.env.ACCESS_TOKEN_SECRET,
          jwtFromRequest: ExtractJWT.fromHeader("authorization"),
        },
        async (token, done) => {
          try {
            return done(null, token.user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
    passport.serializeUser((userData, done) => done(null, userData.email));
    passport.deserializeUser(async (mail, done) => {
      const [err, userResponseArr] = await this.utility.invoker(
        this.userData.fetchAllUserMatches("email", mail)
      );
      if (err) done(err);
      done(null, userResponseArr[0]);
    });
    next();
  }
}

module.exports = Passport;
