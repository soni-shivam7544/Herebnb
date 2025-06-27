
const User= require("../models/user");

module.exports.signup = async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser= new User({email,username});

        const registeredUser= await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err) return next();
            req.flash("success","Welcome to Wanderlust!");
            res.redirect("/listings");
        })//passport method 
        
    }catch(e){
        req.flash("failure",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{// this will flash a variable named 'error'
        req.flash("success","Welcome back to Wanderlust!");
        res.redirect(res.locals.redirectUrl);
};
module.exports.logout = (req,res)=>{
    req.logout((err)=>{ // passport method that deletes the data of req.user 
        if(err){
            return next(err);
        }
        
        req.flash("success", "You have successfully logged out!");
        res.redirect("/listings");
    });
};