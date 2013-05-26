

var Challenge=Backbone.Model.extend( { } 	);
var Challenges=Backbone.Collection.extend({ 
	model: Challenge,
	batchSize: 50, //CWD-- arbitrary limit size
	url: 'http://api.cloudspokes.com/v1/challenges',

	setupOptions: function(options)
	{
		options = options ? _.clone(options) : {}; //CWD-- setup options
        if(options.data===undefined) options.data= {}; //CWD-- params to send to api
        if (options.data.offset === undefined) options.data.offset = 0; //CWD-- start at the beginning
        if (options.data.limit === undefined) options.data.limit = this.batchSize; //CWD-- size of batch

        return options;
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

                if (resp.count!=0) 
                {
                    var _options = _.clone(options);
                    _options.data.offset+=_options.data.limit; //CWD-- increment to grab next set
console.log('new options for call out: ');
console.log(_options);
					//collection.fetch(_options);
                    //collection.sync.call(collection, 'read', collection, _options); //CWD-- call again till we get 0 back
                } 
                else 
                {
                    if (success) success(collection, resp, options); //CWD-- fire off success if one exists
                }

            };

            return this.sync.call(this, 'read', this, options);      
	}

});


//CWD-- init
$(function(){
	var challenges=new Challenges();
	challenges.fetch({reset: true, 
		error: function(collection, response, options){ 
			console.log('error!!!'); 
		},
		success: function(collection, response, options) {
		console.log('final success');
		/*
		console.log('collection: ');
		console.log(collection);
		console.log('response: ');
		console.log(response);
		console.log('options: ');
		console.log(options);
		console.log(this);
		*/
	} });
});