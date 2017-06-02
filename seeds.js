var mongoose = require("mongoose"),
	Campground = require("./models/campground");
	Comment = require("./models/comment");

var data = [];

for(var i = 0; i < 2; i++){
	data.push({
		name: "Cloud's Rest",
		image: "https://farm9.staticflickr.com/8002/7299820870_e78782c078.jpg",
		description: " Good Camp you can have"

	});
}

function seedDB(){
	Campground.remove({},function(err){
	if(err){
		console.log(err);
	}else{
		console.log("Campground removed");
		data.forEach(function(seed){
		Campground.create(seed, function(err,data){
			if(err){
				console.log(err);
			}else{
				console.log("campground created");
				Comment.create({text: "This place is great",
								author: "Rishwanth" 
							},function(err,comment){
								if(err){
									console.log(err);
								}else{
									console.log("comment created");
									data.comments.push(comment);
									data.save();
								}
							});
			}
		});
	});
	}
});
			
}

module.exports = seedDB;






