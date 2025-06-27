const express= require('express');
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const { isLoggedIn , isOwner, validateListing, setRedirectUrl} = require("../middleware.js");
const listingController= require("../controllers/listings.js");
const multer= require("multer");// a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
const {storage} = require("../cloudConfig.js");
// const upload = multer({dest : "uploads/" }); // automatically creates uploads folder to save file.
const upload = multer({ storage }); //cloudinary storage

router.route("/")
    .get(setRedirectUrl,wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("image"),validateListing,wrapAsync(listingController.createListing));
    // .post(upload.single("image"),(req,res)=>{ // to save that single file into uploads folder from the image field
    //     res.send(req.file); // req.file in place of req.body to show only data of type=file input
    // });

router.get("/new",isLoggedIn,listingController.renderNewForm);
router.route("/:id")
    .get(setRedirectUrl,wrapAsync(listingController.showListing))
    .patch(isOwner,isLoggedIn,validateListing,upload.single("image"),wrapAsync(listingController.updateListing))
    .delete(isOwner,isLoggedIn,wrapAsync(listingController.destroyListing));

router.get("/:id/edit",isOwner,isLoggedIn,wrapAsync(listingController.renderEditForm));


module.exports = router;