const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async(req,res)=>{
    const allListings= await Listing.find();
    
    res.render("listings/index.ejs",{ allListings });
};
module.exports.renderNewForm =(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
    let {id} =req.params;
    const listing= await Listing.findById(id).populate({ path:"reviews", populate: {path: "author"}}).populate("owner"); // to get the complete data reviews not only ids
    if(listing==null){
        req.flash("failure","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    if(listing.geometry.coordinates.length == 0){
        let response = await geocodingClient
        .forwardGeocode({
            query: listing.location,
            limit: 1,
        })
        .send();

        listing.geometry = response.body.features[0].geometry;

        await listing.save();
    }
    res.render("listings/show.ejs",{listing});
};
module.exports.createListing = async(req,res,next)=>{ //async error like validation errors needs to be handled
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.location,
        limit: 1,
    })
    .send();
    
    const url=req.file.path;
    const filename=req.file.filename;
    console.log(url);
    console.log(filename);
    const newListing= new Listing(req.body);
    newListing.image= { url, filename };
    newListing.owner= req.user._id;
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created");
    res.redirect("/listings");

};

module.exports.renderEditForm = async(req,res)=>{
    let {id}= req.params;
    let listing=await Listing.findById(id);
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload","/upload/h_250,w_250/"); //using cloudinary image transformation API
    if(listing==null){
        req.flash("failure","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    else res.render("listings/edit.ejs", {listing,originalImage});
};

module.exports.updateListing = async(req,res)=>{
    
    let {id}=req.params;
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.location,
        limit: 1,
    })
    .send();
    
    // const listing= Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)){
    //     req.flash("error","You are not authorised to edit it.");
    //     return res.redirect(`/listings/${id}`);
    // }
    let listing= await Listing.findByIdAndUpdate(id,req.body);
    listing.geometry = response.body.features[0].geometry;
    await listing.save();
    if(typeof req.file != "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image= { url,filename };
        await listing.save();
    }
    
    req.flash("success","Listing Updated!");

    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};