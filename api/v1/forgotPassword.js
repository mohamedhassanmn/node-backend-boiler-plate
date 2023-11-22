const _ = require("lodash");
const Joi = require("joi");

class ForgotPassword {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.forgotPasswordLogic = container.resolve("forgotPasswordLogic");
  }

  async handleRequest(req, res) {
    const originHostName = req.get("origin");
    const email = _.get(req, "body.email", null);

    const [restPasswordErr, restPasswordRes] = await this.utility.invoker(
      this.forgotPasswordLogic.handleLogic(email, originHostName)
    );

    if (restPasswordErr) {
      if (restPasswordErr.includes("401"))
        return res.status(401).send({ msg: "USER NOT FOUND!" });
      else return res.status(400).send({ msg: "RESET EMAIL SENT FAILED!" });
    }

    return res.status(200).send({ msg: "RESET MAIL SENT SUCCESSFULL!" });
  }

  async handleRequestResetPassword(req, res) {
    const resetPassword = _.get(req, "body.resetPassword", null);
    const accessToken = req.header("accessToken");
    if (!accessToken) res.status(401).send({ msg: "INVALID TOKEN!" });

    const [restPasswordErr, restPasswordRes] = await this.utility.invoker(
      this.forgotPasswordLogic.handleResetpassword(resetPassword, accessToken)
    );
    if (restPasswordErr) {
      if (typeof restPasswordErr == "string" && restPasswordErr.includes("401"))
        return res.status(401).send({ msg: "USER NOT FOUND!" });
      else return res.status(400).send({ msg: "RESET PASSWORD FAILED!" });
    }

    return res.status(200).send({ msg: "RESET PASSWORD SUCCESSFULL!" });
  }
}

module.exports = ForgotPassword;
