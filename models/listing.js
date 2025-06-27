const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review= require('./review');

const listingSchema= new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        // type: String,
        // default: "https://wallpapers.com/images/featured/beautiful-ocean-pictures-33b2ht9d8bvriqu6.jpg",
        // set: (v)=> v==="" ? "https://wallpapers.com/images/featured/beautiful-ocean-pictures-33b2ht9d8bvriqu6.jpg" : v,

        url: String,
        filename: String,
    },
    price: Number,
    location: String, 
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner : {
            type: Schema.Types.ObjectId,
            ref: "User", // using for accessing data from id using this model when populate
    },

    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
  }

        
});

listingSchema.post('findOneAndDelete', async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing= mongoose.model("Listing",listingSchema);
module.exports= Listing;