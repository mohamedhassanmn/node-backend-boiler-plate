const axios = require("axios");
const querystring = require("querystring");

class PitchAiScore {
  constructor(container) {
    this.constants = container.resolve("constants");
    this.config = container.resolve("config");
  }

  initializeAxios() {
    this.instance = axios.create({
      baseURL: this.constants.aiScoreBaseUrl,
      timeout: 25000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getFromExternalApi(formData) {
    if (!this.instance) this.initializeAxios();
    return await this.instance.post(
      this.constants.externalApiEndpoint,
      formData,
      {
        headers: { ...formData.getHeaders() },
      }
    );
  }
}

module.exports = PitchAiScore;
