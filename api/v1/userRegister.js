const _ = require("lodash");
const Joi = require("joi");

class UserRegister {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.userRegisterLogic = container.resolve("userRegisterLogic");
    this.userData = container.resolve("userData");
  }

  async handleRequest(req, res) {
    const params = {
      profilePic: _.get(req, "body.profilePic", null),
      fullName: _.get(req, "body.fullName", null),
      email: _.get(req, "body.email", null),
      phone: _.get(req, "body.phone", null),
      userRole: _.get(req, "body.userRole", null),
      password: _.get(req, "body.password", null),
      referrerId: _.get(req, "body.referrerId", null),
    };

    const {
      isValid,
      validatedInput: validatedParams,
      validationError,
    } = this.validateInput(params);

    if (!isValid) {
      return res.status(400).send(validationError);
    }

    const [err, isNewUser] = await this.utility.invoker(
      this.userData.checkUserRegistered(params)
    );

    if (err || !isNewUser) {
      const errMsg = !isNewUser
        ? { errMsg: "USER ALREADY REGISTERED", err }
        : err;
      return res.status(409).send(errMsg);
    }

    const [registerErr, isRegistered] = await this.utility.invoker(
      this.userRegisterLogic.handleUserRegister(isNewUser, validatedParams)
    );

    if (registerErr || !isRegistered) {
      const errMsg = !isRegistered
        ? { errMsg: "ISSUE WITH REGISTERING RECORD..." }
        : registerErr;
      return res.status(500).send(errMsg);
    }

    return res.status(200).send({ msg: "USER REGISTERED SUCCESSFULLY !!" });
  }

  getInputSchema() {
    if (!_.isNil(this.inputSchema)) {
      return this.inputSchema;
    }
    this.inputSchema = Joi.object({
      profilePic: Joi.string().required(),
      fullName: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      userRole: Joi.string().required(),
      password: Joi.string().required(),
      referrerId: Joi.string().allow(null).required(),
    });
    return this.inputSchema;
  }

  validateInput(input) {
    const inputSchema = this.getInputSchema();
    const validationRes = inputSchema.validate(input);
    return {
      isValid: _.isNil(validationRes.error),
      validatedInput: validationRes.value,
      validationError: validationRes.error,
    };
  }
}

module.exports = UserRegister;
