const express= require('express');
const router= express.Router({ mergeParams: true }); // to merge the params in parent routes to the child routes
const wrapAsync= require("../utils/wrapAsync.js");
const reviewController= require("../controllers/reviews.js");
const { isLoggedIn , isReviewAuthor, validateReview} = require("../middleware.js");


router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
router.delete("/:reviewId",isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports =  router;