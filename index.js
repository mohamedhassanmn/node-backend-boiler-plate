process.on("uncaughtException", (err) => {
  console.log("Encountered uncaughtException", { err });
});

process.on("unhandledRejection", (err) => {
  console.log("Encountered unhandledRejection", { err });
});

require("dotenv").config();

const container = require("./di");
const server = require("./server");

server(container).then((app) => {
  const config = container.resolve("serverConfig");

  const { port, keepAliveTimeout } = config;
  if (!port) {
    console.log("Port not found, Please check server-config.js");
    return;
  }

  const finalApp = app.listen(port, () => {
    finalApp.keepAliveTimeout = keepAliveTimeout;
    finalApp.on("close", () => {
      console.log("Server stopped successfully");
    });
    console.log(
      `Server started successfully, running on port: ${
        finalApp.address().port
      }.`
    );
  });
});
