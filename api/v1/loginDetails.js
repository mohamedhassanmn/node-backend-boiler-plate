const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

class LoginDetails {
  constructor(container) {
    this.utility = container.resolve("utility");
  }

  async handleRequest(req, res) {
    const userInfo = {
      profilePic: _.get(req, "user.profile_pic", null),
      fullName: _.get(req, "user.fullname", null),
      email: _.get(req, "user.email", null),
      phone: _.get(req, "user.phone", null),
      userRole: _.get(req, "user.user_role", null),
      referrerId: _.get(req, "user.referrer_id", null),
      userId: _.get(req, "user.id", null),
    };

    req.login(userInfo, { session: false }, (err) => {
      if (err) {
        console.error("Error logging in:", err);
        return res.sendStatus(500);
      }
      const body = { email: userInfo.email, userId: userInfo.userId };
      const token = jwt.sign({ user: body }, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).send(
        JSON.stringify({
          msg: "USER LOGIN SUCCESSFULL!!",
          userDetails: userInfo,
          token: token,
        })
      );
    });
  }
}

module.exports = LoginDetails;
