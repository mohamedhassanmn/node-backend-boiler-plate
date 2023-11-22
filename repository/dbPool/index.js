const PostgresClient = require("./postgresClient");
const S3Client = require("./s3Client");

const extrasRepo = (container) => {
  const postgresClient = new PostgresClient(container);
  const s3Client = new S3Client(container);
  return { postgresClient, s3Client };
};

module.exports = extrasRepo;
