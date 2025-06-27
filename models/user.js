const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema= new Schema({
    email:{
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose); // for automatically add username and password to userSchema and other important methods for mongoose

module.exports= mongoose.model("User",userSchema);