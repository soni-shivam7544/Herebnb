if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
// console.log(process.env);


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError");
const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");

const session= require("express-session");
const MongoStore = require('connect-mongo'); // for session store on cloud database not on local machine


const flash=require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");

//Database connection
// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL; // TO CONNECT TO MONGO ATLAS DATABASE ON CLOUD



main()
    .then(()=>console.log("connected to db"))
    .catch(err=>console.log(err));

async function main(){
    await mongoose.connect(dbUrl);
}

//set ejs as view engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.json()); // for taking body from hoppscotch
app.use(express.urlencoded({ extended: true})); // to take form data into req.body in urlencoded form
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
//This async error can be handled by default compiler
//except database errors and ejs errors

// app.use(async ()=>{
//     throw await Error("user defined error");
// })

const store = MongoStore.create({  // for session store on cloud database not on local machine
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600, 

});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());//middleware that initialize the passport
app.use(passport.session()); //to store the current user details in the session
passport.use(new LocalStrategy(User.authenticate())); // verifies(user,password) with the database users

passport.serializeUser(User.serializeUser()); //stores userdetails in cookies for a session
passport.deserializeUser(User.deserializeUser()); //removes the userdetails when session is over


//res.locals have scope of current request only
//changes to locals of one request does not affect to locals of others.
app.use((req,res,next)=>{
    res.locals.error= req.flash("error");
    res.locals.success= req.flash("success");
    res.locals.failure= req.flash("failure");
    res.locals.currUser= req.user;
    next();
})

//root
// app.get("/",(req,res)=>{
//     res.send("root page");
// });

//listings
app.use("/listings",listingRouter);
//reviews
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//demo User

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser= await User.register(fakeUser,"helloworld");// to save the user with password
//     res.send(registeredUser);
// })


//Error handling
app.use((req,res,next)=>{
    next(new ExpressError(404, "Page not found!"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!!!"}= err;
    res.status(400).render("error.ejs", { message });

    // res.status(statusCode).send(message); 
})

//Starting server
app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});