const AWS = require("aws-sdk");
const fs = require("fs");

class S3Client {
  constructor(container) {
    this.config = container.resolve("config");
    this.BUCKET_NAME = "pitchdeck-upload";
  }

  initializeS3() {
    return new AWS.S3({
      accessKeyId: this.config.awsS3.accessKeyId,
      secretAccessKey: this.config.awsS3.secretAccessKey,
    });
  }

  createS3Bucket(bucketName = this.BUCKET_NAME) {
    const params = {
      Bucket: bucketName,
    };
    const s3 = this.initializeS3();
    s3.createBucket(params, (err, data) => {
      if (!err) {
        console.log("Bucket Created Successfully!!", data.Location);
      }
    });
  }

  uploadPitch(fileContent, bucketName = this.BUCKET_NAME) {
    const params = {
      Bucket: bucketName,
      Key: fileContent.originalname,
      Body: fileContent.buffer,
      ACL: "public-read",
    };
    const s3 = this.initializeS3();
    return s3
      .upload(params)
      .promise()
      .then((data) => data.Location)
      .catch((err) => console.log(err));
  }
}

module.exports = S3Client;
