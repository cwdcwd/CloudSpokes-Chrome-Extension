

var Challenge=Backbone.Model.extend( { } );
var Challenges=Backbone.Collection.extend({ 
	model: Challenge,
	url: 'http://api.cloudspokes.com/v1/challenges',

	sync: function(method, model){
		alert(method + ": " + model.url);
	}
});


//CWD-- init
$(function(){
	var challenges=new Challenges();
	challenges.fetch();
});