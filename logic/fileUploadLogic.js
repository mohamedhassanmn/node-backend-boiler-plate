const _ = require("lodash");
const convertApi = require("convertapi")(process.env.CONVERT_API_AUTH);
const fs = require("fs");
var Readable = require("stream").Readable;
const FormData = require("form-data");
const axios = require("axios");

class FileUploadWithOtherDetailsLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.awsS3 = container.resolve("awsS3");
    this.hitOnGsheet = container.resolve("hitOnGsheet");
    this.externalApiRequest = container.resolve("externalApiRequest");
    this.sendGridMail = container.resolve("sendGridMail");
    this.constants = container.resolve("constants");
    this.table = "pitchDeckDetails";
  }

  async setPitchRecordDb(pitchDetailsWithLocation) {
    // console.log(pitchDetailsWithLocation, "pitchDetailsWithLocation");
    const query = `INSERT INTO ${this.table} (username, email, file_location, feedback_for_ai, story_score, design_score, visual_score, ai_approval)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`;
    const params = [
      pitchDetailsWithLocation.username,
      pitchDetailsWithLocation.email,
      pitchDetailsWithLocation.file,
      "AI Review Score",
      pitchDetailsWithLocation?.score?.story || 0,
      pitchDetailsWithLocation?.score?.Design || 0,
      pitchDetailsWithLocation?.score?.vizscore || 0,
      pitchDetailsWithLocation?.aiapproval || false,
    ];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getPitchRecordDb() {
    const table = this.table;
    const query = `SELECT * FROM ${table}`;
    return Promise.resolve(this.postgresDB.executeQuery(query));
  }

  async setPitchStatusDb(
    feedbackForAi,
    userId,
    storyscore,
    designscore,
    visualscore
  ) {
    const table = this.table;
    const query = `UPDATE ${table} SET feedback_for_ai=$1, story_score=$2, design_score=$3, visual_score=$4
    WHERE user_id = ${userId} 
    RETURNING *`;
    const params = [feedbackForAi, storyscore, designscore, visualscore];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getReceivedDecks() {
    const table = this.table;
    const query = `select count(user_id) from ${table}`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getReviewedDecks() {
    const table = this.table;
    const query = `select count(user_id) from ${table} where feedback_for_ai != 'AI Review Score'`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  // async downloadAndUploadFileToAi(res, fileUrl = "", pathToSave = "") {
  async downloadAndUploadFileToAi(fileUrl = "", pathToSave = "") {
    const downloadFile = async (url, destinationPath) => {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
      });

      const fileStream = fs.createWriteStream(destinationPath);

      return new Promise((resolve, reject) => {
        response.data.pipe(fileStream);
        fileStream.on("finish", () => {
          // console.log("File downloaded successfully!!");
          return resolve();
        });
        fileStream.on("error", (error) => {
          // res.end();
          return reject(error);
        });
      });
    };

    const uploadFileToApi = async (fileStream) => {
      let aiResponse;
      const formData = new FormData();
      formData.append("file", fileStream);
      try {
        aiResponse = await this.externalApiRequest.getFromExternalApi(formData);
        // console.log("File uploaded successfully!!");
      } catch (error) {
        // res.end();
        console.error("Error uploading file:", error.message);
      }
      return aiResponse?.data || null;
    };

    // Download the file
    return downloadFile(fileUrl, pathToSave)
      .then(() => {
        // Read the file as a stream
        const fileStream = fs.createReadStream(pathToSave);

        // Upload the file to another API as FormData
        return uploadFileToApi(fileStream);
      })
      .catch((error) => {
        // res.end();
        console.error("Error downloading file:", error.message);
      });
  }

  // async handlePitchRecord(res, pitchDetails) {
  async handlePitchRecord(pitchDetails) {
    // res.write(`data: ${{ progress: 20, status: "uploading deck..." }}\n\n`);
    const [fileUploadErr, fileUploadLocation] = await this.utility.invoker(
      this.awsS3.uploadPitch(pitchDetails.file)
    );

    if (fileUploadErr) {
      // res.end();
      return Promise.reject(fileUploadErr);
    }
    // console.log("DECK UPLOADED TO AWS!!");
    let aiScores;

    // console.log("DECK UPLOADED TO AWS!!");
    // res.write(
    //   `data: ${{ progress: 40, status: "converting deck for AI..." }}\n\n`
    // );
    try {
      const base64 = pitchDetails?.file?.buffer.toString("base64");
      const fileBuffer = Buffer.from(base64, "base64");
      var stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);
      const uploadResult = convertApi.upload(stream, "pitch.pdf");
      const result = await convertApi.convert(
        "pptx",
        {
          File: uploadResult,
        },
        "pdf"
      );

      const convertedPptxFileData = result?.response?.Files[0];
      // console.log("converted to pptx successfully!!");
      // res.write(
      //   `data: ${{ progress: 60, status: "reading deck page by page..." }}\n\n`
      // );

      // aiScores = await this.downloadAndUploadFileToAi(
      //   res,
      //   convertedPptxFileData?.Url,
      //   `./${convertedPptxFileData?.FileName}`
      // );
      aiScores = await this.downloadAndUploadFileToAi(
        convertedPptxFileData?.Url,
        `./${convertedPptxFileData?.FileName}`
      );
    } catch (err) {
      console.log(err, "ERROR UPLOADING DECK TO AI!!");
      // res.end();
      return Promise.reject(err);
    }
    // res.write(`data: ${{ progress: 80, status: "calculating scores..." }}\n\n`);

    // console.log(aiScores, "Scores");
    const customPitchDetails = {
      ...pitchDetails,
      file: fileUploadLocation,
      ...aiScores,
    };
    const [err, insertRes] = await this.utility.invoker(
      this.setPitchRecordDb(customPitchDetails)
    );
    const deckData = _.get(_.get(insertRes, "rows", []), "0", null);
    // console.log(err, deckData, "@@@@@@@@@@@@@@@@@@ HERE I AM @@@@@@@@@@@@@@@@");
    if (err || !deckData) {
      // res.end();
      return Promise.reject(err);
    }
    // res.write(
    //   `data: ${{ progress: 100, status: "done", score: aiScores?.score }}\n\n`
    // );
    // res.end();
    return Promise.resolve(aiScores);
    // const manipulateSqlValues = [
    //   [
    //     deckData.user_id,
    //     deckData.username,
    //     deckData.email,
    //     deckData.file_location,
    //     deckData.story_score,
    //     deckData.design_score,
    //     deckData.visual_score,
    //     deckData.review_status,
    //   ],
    // ];
    // const [sheetErr, sheetRes] = await this.utility.invoker(
    //   this.hitOnGsheet.setDataToGsheet(manipulateSqlValues)
    // );
    // if (sheetErr) return Promise.reject(sheetErr);

    // const mailsQueueTasks = [];
    // _.forEach(this.constants.mailIndicationsTo, (value) => {
    //   const mailPayload = {
    //     fromMailId: this.constants.mailSenderId,
    //     toMailId: value,
    //     mailSubject: this.constants.mailReceiveSubject,
    //     content: this.constants.mailRecieveNotificationContent,
    //   };
    //   mailsQueueTasks.push(this.sendGridMail.sendMail(mailPayload));
    // });

    // const [mailErr, mailRes] = await this.utility.invoker(
    //   Promise.allSettled(mailsQueueTasks)
    // );

    // if (mailErr) return Promise.reject(mailErr);
    // return Promise.resolve(!!mailRes);
  }

  async handleDeckListing() {
    const [err, insertRes] = await this.utility.invoker(
      this.getPitchRecordDb()
    );
    if (err) return Promise.reject(err);

    const modifiedData = _.flatMap(_.get(insertRes, "rows", {}), (row) => {
      return [
        {
          id: _.get(row, "user_id", ""),
          clientName: _.get(row, "username", ""),
          clientEmail: _.get(row, "email", ""),
          pitchDeck: _.get(row, "file_location", ""),
          aiTrainingStatus: "Added for training",
          storyScore: _.get(row, "story_score", ""),
          designScore: _.get(row, "design_score", ""),
          visualScore: _.get(row, "visual_score", ""),
          feedbackForAi: _.get(row, "feedback_for_ai", ""),
          aiApproval: _.get(row, "ai_approval", ""),
        },
      ];
    });

    return Promise.resolve({
      msg: "Data Fetched Successfully!!",
      ...{ pitchDeckDetails: modifiedData },
    });
  }

  async handlePitchUpdate({
    feedbackforai,
    userid,
    storyscore,
    designscore,
    visualscore,
  }) {
    const [err, insertRes] = await this.utility.invoker(
      this.setPitchStatusDb(
        feedbackforai,
        userid,
        storyscore,
        designscore,
        visualscore
      )
    );

    const userInfo = _.get(_.get(insertRes, "rows", {}), "0", {});
    if (err || !userInfo) return Promise.reject(err);
    return Promise.resolve(!!userInfo);
    // const mailPayload = {
    //   fromMailId: this.constants.mailSenderId,
    //   toMailId: userInfo.email,
    //   mailSubject: this.constants.mailSendSubject,
    //   content: this.constants.mailSendNotificationContent(userInfo),
    // };
    // const [mailErr, mailRes] = await this.utility.invoker(
    //   this.sendGridMail.sendMail(mailPayload)
    // );
    // if (mailErr) return Promise.reject(mailErr);
    // return Promise.resolve(!!mailRes);
  }

  async handleDeckCount() {
    const [reviewedCountErr, reviewedCount] = await this.utility.invoker(
      this.getReviewedDecks()
    );
    const [receivedCountErr, receivedCount] = await this.utility.invoker(
      this.getReceivedDecks()
    );
    if (reviewedCountErr) return Promise.reject(reviewedCountErr);
    if (receivedCountErr) return Promise.reject(receivedCountErr);

    return Promise.resolve({
      reviewedCount: reviewedCount?.rows && reviewedCount?.rows[0]?.count,
      receivedCount: receivedCount?.rows && receivedCount?.rows[0]?.count,
    });
  }
}

module.exports = FileUploadWithOtherDetailsLogic;
