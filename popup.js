

var Challenge=Backbone.Model.extend( { 
	initialize: function()
	{

	}
});

var Leaderboard=Backbone.Model.extend( { } );


var CloudspokesCollection=Backbone.Collection.extend({ 
	
	batchSize: 50, //CWD-- arbitrary limit size
	

	initialize: function()
	{
		this.on('remove', this.hideModel);
	},

	setupOptions: function(options)
	{
		options = options ? _.clone(options) : {}; //CWD-- setup options
        if(options.data===undefined) options.data= {}; //CWD-- params to send to api
        if (options.data.offset === undefined) options.data.offset = 0; //CWD-- start at the beginning
        if (options.data.limit === undefined) options.data.limit = this.batchSize; //CWD-- size of batch

        return options;
	},

	hideModel: function(model)
	{
		model.trigger('hide');
	},

	fetch: function (options) {
		//CWD--some of the below code inspired from backbone.force.js (Piotr Walczyszyn (http://outof.me | @pwalczyszyn))
console.log('Fetching with options: ');
console.log(options);
        options = this.setupOptions(options); //CWD-- size of batch

        var collection = this,
            success = options.success,
            records = [];
console.log(options.data);
		options.success = function (resp, status, xhr) {
console.log('results: '+resp.count);
                records.push.apply(records, resp.response); //CWD-- add results to array
console.log(records);
                // Checking if the result size is  0
                lastCount=resp.count;
                collection[options.add ? 'add' : 'reset'](records, options);

				if (success) success(collection, resp, options); //CWD-- fire off success if one exists
            };

            return this.sync.call(this, 'read', this, options);      
	}

});

var Challenges=CloudspokesCollection.extend({ 
	model: Challenge,
	url: 'http://api.cloudspokes.com/v1/challenges',
});


var LeaderboardItems=CloudspokesCollection.extend({ 
	model: Leaderboard,
	url: 'http://api.cloudspokes.com/v1/leaderboard',
});


//CWD-- Views
var ChallengeView=Backbone.View.extend({
	tagName: 'li',
	template: _.template( '<li> <%= name %>  </li>' ),

	initialize: function() {
		console.log('initializing ChallengeView');
		this.model.bind('change', _.bind(this.render, this));
		this.model.on('hide',this.remove,this);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});

var ChallengesView=Backbone.View.extend({
	initialize: function() {
		console.log('initializing ChallengesView');
		//this.collection.bind('change', _.bind(this.render, this));
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.renderItem, this);
	},

	render: function()
	{
		console.log('render called');
		this.$el.empty();
        this.collection.forEach(function( item ) {
        	this.renderItem( item );
        }, this);
    },

    renderItem: function(item)
    {
    	var cv=new ChallengeView( { model: item } );
    	this.$el.append(cv.render().el);
    	console.log(item);
    }
});


//CWD-- init
$(function(){
	var openchallenges=new Challenges();
	var leaderboarditems=new LeaderboardItems();
	var openchallengesView=new ChallengesView({ 
		collection: openchallenges,
		el: $('#challenges')
	});

	openchallenges.fetch({reset: true, data: { open: true, order_by: 'end_date' },
		error: function(model, xhr, options){ 
			console.log('error!!!'); 
		},
		success: function(collection, response, options) {
		console.log('final success');
	} });

	leaderboarditems.fetch({reset: true, data: { period: 'month', limit: 10 },
		error: function(model, xhr, options){ 
			console.log('error!!!'); 
		},
		success: function(collection, response, options) {
		console.log('final success');
	} });

});