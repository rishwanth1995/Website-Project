var express = require("express")
    ,app = express()
    ,bodyParser = require("body-parser")
    ,mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require ("./models/user"),
    seedDB = require("./seeds");


// var campgrounds =[{name: "Salmon creek", image: "http://www.campsitephotos.com/photo/camp/424/feature_Anastasia_State_Park-f4.jpg"},
  //                      {name: "Granite Hill", image: "http://www.campsitephotos.com/photo/camp/478/feature_Fort_Stevens-f3.jpg"}];
seedDB();                       
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(express.static(__dirname +"/public"));


app.use(require("express-session")({
    secret: "My name is Rishwanth",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});
app.get("/",function(req , res){
    res.render("landing");
});

app.get("/campgrounds",function(req,res){
    Campground.find({},function(err, campgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/campground",{campgrounds: campgrounds});         
        }
    });    
    
});

app.get("/campgrounds/new",function(req, res) {
   res.render("campgrounds/new"); 
});

app.get("/campgrounds/:id",function(req,res){
    
    Campground.findById(req.params.id).populate("comments").exec(function(err, showCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {showCampground : showCampground});        
        }
    });
    
});

app.post("/campgrounds",function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newcampground = {name: name,image : image, description: description};
    Campground.create(newcampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");        
        }
    });
    
});

app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                    //res.redirect("/campgrounds");
                }else{
                    console.log(campground);
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    User.register(new User({username: req.body.username}),req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/campgrounds");
            });
        }
    });
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res){

});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.listen(3000,function(){
   console.log("yelpCamp server has started"); 
});