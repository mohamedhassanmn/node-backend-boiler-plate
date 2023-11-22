module.exports = {
  activeEnv: "STAGING",
  postgres: {
    host: "localhost",
    port: "5432",
    database: "pitchdeck",
    user: "mohamedhassan",
    password: "",
  },
  awsS3: {
    accessKeyId: "<ACCESS_KEY>",
    secretAccessKey: "<SECRET>",
  },
  gSheetURL: "https://script.google.com/macros/s/<SHEET_ID>/exec",
};
