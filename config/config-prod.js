module.exports = {
  activeEnv: "PRODUCTION",
  postgres: {
    host: "localhost",
    port: "5432",
    database: "postgres",
    user: "postgres",
    password: "password",
  },
  awsS3: {
    accessKeyId: "<ACCESS_KEY>",
    secretAccessKey: "<SECRET>",
  },
  gSheetURL: "https://script.google.com/macros/s/<SHEET_ID>/exec",
};
