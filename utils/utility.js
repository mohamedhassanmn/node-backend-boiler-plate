const bcrypt = require("bcrypt");

class Utility {
  invoker(promise) {
    return promise
      .then((data) => {
        return [null, data];
      })
      .catch((err) => {
        return [err, null];
      });
  }

  async maskInput(inputToBeMasked) {
    return await bcrypt.hash(inputToBeMasked, 10);
  }

  async unMaskInput(maskedPassword, userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, maskedPassword);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  createUpdateQuery(table, data) {
    const keys = Object.keys(data).filter((k) => data[k]);
    const names = keys.map((k, index) => k + " = $" + (index + 1)).join(", ");
    const values = keys.map((k) => data[k]);
    return {
      query: "UPDATE " + table + " SET " + names,
      params: values,
    };
  }
}

module.exports = Utility;
