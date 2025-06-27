const express= require("express");
const router= express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport= require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

router.route("/signup") // .route helps to combine the routes with same endpoint
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate("local",{failureRedirect: "/login",failureFlash: true}),wrapAsync(userController.login));

router.get("/logout",userController.logout); // without router.route

module.exports = router;