const Listing= require("./models/listing.js");
const Review= require("./models/review.js");
const ExpressError= require("./utils/ExpressError.js");
const { listingSchema }= require("./schema.js"); //it is used for server side validation
const { reviewSchema }= require("./schema.js");

// to save the redirectUrl for direct login BUTTON click on any page
module.exports.setRedirectUrl= (req,res,next)=>{
    req.session.redirectUrl= req.originalUrl;
    next();
}

//validation
module.exports.validateListing= (req,res,next)=>{
    let result= listingSchema.validate(req.body); //backend validation
    if(result.error){
        let errMsg= result.error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
};

//validation
module.exports.validateReview= (req,res,next)=>{
    let result= reviewSchema.validate(req.body);
    if(result.error){
        let errMsg= result.error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.isLoggedIn= (req,res,next)=>{
        console.log(req.path, "..", req.originalUrl); 
        if(!req.isAuthenticated()){ //this method is enabled due to passport
            req.session.redirectUrl= req.originalUrl; //storing to req.session not in req.locals as locals have limited scope of current req only.
            
            // checks if the details of current user in the session are present or not
            req.flash("error","you must be logged  in to create listing!");
            return res.redirect("/login");
        }
        next();
}

module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req,res,next)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!res.locals.currUser || !listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isReviewAuthor= async(req,res,next)=>{
    let {id, reviewId}= req.params;
    const review= await Review.findById(reviewId);

    if(!res.locals.currUser || !review.author.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}