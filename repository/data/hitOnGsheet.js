const { google } = require("googleapis");

class HitOnGsheet {
  constructor(container) {
    this.config = container.resolve("config");
  }

  initializeRequest() {
    const auth = new google.auth.GoogleAuth({
      keyFile: "secrets/credentials.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
  }

  async setDataToGsheet(values = []) {
    const options = {
      spreadsheetId: "1wxdvgvwkGrGfzBK9VXKM5UIDDdUsiW9XN-U98nisPOg",
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    };
    const sheet = this.initializeRequest();
    try {
        const response = await sheet.spreadsheets.values.append(options);
        console.log(`${response.data.updates.updatedCells} cells updated.`);
        return Promise.resolve(`${response.data.updates.updatedCells} cells updated.`);
      } catch (error) {
        console.error(`The API returned an error: ${error}`);
        return Promise.reject(`The API returned an error: ${error}`);
      }
  }
}

module.exports = HitOnGsheet;
