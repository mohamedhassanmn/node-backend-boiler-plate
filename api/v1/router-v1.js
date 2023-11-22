const express = require("express");
const passport = require("passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const helpers = require("../../helpers");
const router = express.Router();

router.use((req, res, next) => {
  req.container.resolve("passport").passportInit(passport, next);
});

router.use(passport.initialize());

router.use(passport.session());

router.get("/healthCheck", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Dashboard API's

router.post("/register", (req, res) => {
  req.container.resolve("userRegisterApi").handleRequest(req, res);
});

router.post(
  "/login",
  passport.authenticate("userSession", { session: false }),
  (req, res) => {
    req.container.resolve("loginDetailsApi").handleRequest(req, res);
  }
);

router.post("/forgot-password", (req, res) => {
  req.container.resolve("forgotPasswordApi").handleRequest(req, res);
});

router.post("/reset-password", (req, res) => {
  req.container
    .resolve("forgotPasswordApi")
    .handleRequestResetPassword(req, res);
});

router.post("/pitch-deck-upload", upload.single("file"), (req, res) => {
  req.container
    .resolve("fileUploadWithOtherDetailsApi")
    .handleRequest(req, res);
});

router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  }
);

module.exports = router;
