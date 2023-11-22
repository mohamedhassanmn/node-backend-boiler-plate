const sgMail = require("@sendgrid/mail");

class SendGridMail {
  constructor(container) {}

  initialize() {
    sgMail.setApiKey("API_KEY");
  }

  async sendMail({ fromMailId, toMailId, mailSubject, content }) {
    this.initialize();
    const msg = {
      to: toMailId,
      from: fromMailId,
      subject: mailSubject,
      text: "<content>",
      html: content,
    };

    try {
      const response = await sgMail.send(msg);
      console.log(`${response} cells updated.`);
      return Promise.resolve(`Mail Successfully Sent!!`);
    } catch (error) {
      console.error(`The API returned an error: ${error}`);
      return Promise.reject(`Mail Sent Failed!!: ${error}`);
    }
  }
}

module.exports = SendGridMail;
