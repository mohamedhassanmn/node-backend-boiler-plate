const { createContainer, asValue } = require("awilix");

const envConfig = require("../config");
const serverConfig = require("../config/server-config");

// Utils
const utils = require("../utils");

// API
const FileUploadWithOtherDetailsApi = require("../api/v1/fileUploadWithOtherDetails");
const UserRegisterApi = require("../api/v1/userRegister");
const LoginDetailsApi = require("../api/v1/loginDetails");
const ForgotPasswordApi = require("../api/v1/forgotPassword");

//Repository
const dbPoolRepo = require("../repository/dbPool");

// Data Repo
const dataRepo = require("../repository/data");

// Extras
const extrasRepo = require("../repository/extras");

// Logic
const FileUploadLogic = require("../logic/fileUploadLogic");
const UserRegisterLogic = require("../logic/userRegisterLogic");
const ForgotPasswordLogic = require("../logic/forgotPasswordLogic");

const container = createContainer();

const utility = new utils.utility();
container.register({
  config: asValue(envConfig),
  serverConfig: asValue(serverConfig),
  constants: asValue(utils.constants),
  utility: asValue(utility),
});

// Repository
const dbPool = dbPoolRepo(container);
container.register("postgresDB", asValue(dbPool.postgresClient));
container.register("awsS3", asValue(dbPool.s3Client));

// Data Repo
const datas = dataRepo(container);
container.register("userData", asValue(datas.user));
container.register("hitOnGsheet", asValue(datas.hitOnGsheet));
container.register("externalApiRequest", asValue(datas.externalApiRequest));

// Extra Repo
const extras = extrasRepo(container);
container.register("passport", asValue(extras.passport));
container.register("sendGridMail", asValue(extras.sendGridMail));

// Logic
const fileUploadLogic = new FileUploadLogic(container);
container.register("fileUploadLogic", asValue(fileUploadLogic));

const userRegisterLogic = new UserRegisterLogic(container);
container.register("userRegisterLogic", asValue(userRegisterLogic));

const forgotPasswordLogic = new ForgotPasswordLogic(container);
container.register("forgotPasswordLogic", asValue(forgotPasswordLogic));

// API
const fileUploadWithOtherDetailsApi = new FileUploadWithOtherDetailsApi(
  container
);
container.register(
  "fileUploadWithOtherDetailsApi",
  asValue(fileUploadWithOtherDetailsApi)
);

const userRegisterApi = new UserRegisterApi(container);
container.register("userRegisterApi", asValue(userRegisterApi));

const loginDetailsApi = new LoginDetailsApi(container);
container.register("loginDetailsApi", asValue(loginDetailsApi));

const forgotPasswordApi = new ForgotPasswordApi(container);
container.register("forgotPasswordApi", asValue(forgotPasswordApi));

module.exports = container;
