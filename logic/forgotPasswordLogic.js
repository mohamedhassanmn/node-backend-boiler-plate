const _ = require("lodash");
const jwt = require("jsonwebtoken");

class ForgotPasswordLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.sendGridMail = container.resolve("sendGridMail");
    this.userData = container.resolve("userData");
    this.constants = container.resolve("constants");
  }

  async fetchUserInfo(email) {
    const [userInfoErr, userInfo] = await this.utility.invoker(
      this.userData.fetchUserRegisteredInfo(email)
    );
    if (userInfoErr) return Promise.reject(userInfoErr);
    return Promise.resolve(userInfo);
  }

  async updateUserPassword(updatedPassword, userId) {
    const hashedPassword = await this.utility.maskInput(updatedPassword);
    const [passwordUpdatedStatusErr, passwordUpdatedStatus] =
      await this.utility.invoker(
        this.userData.updateUserPassword(hashedPassword, userId)
      );
    if (passwordUpdatedStatusErr)
      return Promise.reject(passwordUpdatedStatusErr);
    return Promise.resolve(passwordUpdatedStatus);
  }

  async generateLoginToken(userInfo) {
    if (!(userInfo.id && userInfo.email)) return Promise.reject("");

    const accessToken = await jwt.sign(
      { id: userInfo.id, email: userInfo.email },
      process.env.RESET_ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    return Promise.resolve(accessToken);
  }

  async handleResetEmailTrigger(email, userInfo, hostName) {
    const [userTokenErr, userToken] = await this.utility.invoker(
      this.generateLoginToken(userInfo)
    );
    if (userTokenErr) return Promise.reject(userTokenErr);

    const mailPayload = {
      fromMailId: this.constants.mailSenderId,
      toMailId: email,
      mailSubject: this.constants.resetPasswordMailSendSubject,
      content: this.constants.resetPasswordMailSendNotificationContent({
        ...userInfo,
        userToken: userToken,
        hostName: hostName,
      }),
    };
    const [mailErr, mailRes] = await this.utility.invoker(
      this.sendGridMail.sendMail(mailPayload)
    );
    if (mailErr) return Promise.reject(mailErr);
    return Promise.resolve(!!mailRes);
  }

  async handleLogic(email, hostName) {
    const [fetchErr, fetchInfo] = await this.utility.invoker(
      this.fetchUserInfo(email)
    );
    if (fetchErr) return Promise.reject("Error401 " + fetchErr);

    const [mailErr, mailRes] = await this.utility.invoker(
      this.handleResetEmailTrigger(email, fetchInfo, hostName)
    );

    if (mailErr) return Promise.reject(mailErr);
    return Promise.resolve(!!mailRes);
  }

  async handleResetpassword(resetPassword, accessToken) {
    const user = jwt.verify(accessToken, process.env.RESET_ACCESS_TOKEN_SECRET);
    if (!(user.id && user.email)) return Promise.reject(false);

    const [updateErr, updateSuccessFul] = await this.utility.invoker(
      this.updateUserPassword(resetPassword, user.id)
    );

    if (updateErr) return Promise.reject(updateErr);
    return Promise.resolve(!!updateSuccessFul);
  }
}

module.exports = ForgotPasswordLogic;
