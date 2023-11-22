const _ = require("lodash");
const Joi = require("joi");

class FileUploadWithOtherDetailsApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.fileUploadLogic = container.resolve("fileUploadLogic");
  }

  async handleRequest(req, res) {
    // res.setHeader("Content-Type", "text/event-stream");
    // res.setHeader("Cache-Control", "no-cache");

    const pitchDetails = {
      username: _.get(req, "body.username", null),
      email: _.get(req, "body.email", null),
      aiapproval: JSON.parse(_.get(req, "body.aiApproval", null)),
      file: _.get(req, "file", null),
    };

    const [uploadErr, deckscore] = await this.utility.invoker(
      this.fileUploadLogic.handlePitchRecord(pitchDetails)
    );

    if (uploadErr) {
      return res.status(400).send({
        deckscore,
        msg: "UPLOAD FAILED !!",
        error: uploadErr,
      });
    }
    return res.status(200).send({ deckscore, msg: "UPLOAD SUCCESSFULLY !!" });

    // res.on("close", () => {
    //   res.end();
    // });
  }
}

module.exports = FileUploadWithOtherDetailsApi;
