

var Challenge=Backbone.Model.extend( { });

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

	fetch: function (options) 
	{
        options = this.setupOptions(options); //CWD-- size of batch

        var collection = this,
            success = options.success,
            records = [];

		options.success = function (resp, status, xhr) 
		{
			records.push.apply(records, resp.response); //CWD-- add results to array
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
var CloudspokesItemView=Backbone.View.extend({
	tagName: 'tr',

	initialize: function() {
		this.model.bind('change', _.bind(this.render, this));
		this.model.on('hide',this.remove,this);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});

var ChallengeView=CloudspokesItemView.extend({
	className: 'challengeItem',
	template: _.template( ' <td><%= name %></td><td> <%= (new Date(end_date)).toLocaleString() %> </td> <td>$<%= total_prize_money %></td>' )
});


var LeaderboardView=CloudspokesItemView.extend({
	className: 'leaderboardItem',
	template: _.template( ' <td> <%=rank%> </td> <td><div><img src="<%= profile_pic %>" /></div><div><%= username %></div></td> <td> <%=total_money%> </td> <td> <%=wins%> </td>' )
});


var CloudspokesCollectionView=Backbone.View.extend({
	tagName: 'table',
	initialize: function() {
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.renderItem, this);
	},

	render: function()
	{
		this.$el.empty();
		var strHead='<tr><th>'+this.title+'</th></tr>'
		
		this.columnTitles.forEach(function(item) {
			strHead=strHead+'<th>'+item+'</th>';
		},this);

		this.$el.append('<thead>'+strHead+'</thead>');

        this.collection.forEach(function( item ) {
        	this.renderItem( item );
        }, this);
    }
});

var ChallengesView=CloudspokesCollectionView.extend({
	title: 'Open Challenges',
	columnTitles: ['Challenge', 'End', 'Total Prize'],
    renderItem: function(item)
    {
    	var cv=new ChallengeView( { model: item } );
    	this.$el.append(cv.render().el);
    }
});

var LeaderBoardItemsView=CloudspokesCollectionView.extend({
	title: 'Leaderboard (this month)',
	columnTitles: ['Rank', 'User', 'Total Prizes', '#Wins' ],
	renderItem: function(item)
    {
    	var cv=new LeaderboardView( { model: item } );
    	this.$el.append(cv.render().el);
    }
});

var NavView=Backbone.View.extend({
	events: { 
		'click ul.nav li': function(e)
		{
			$('ul.nav li').removeClass('active');
			$(e.currentTarget).addClass('active');
		}
	}
});

//CWD-- init
$(function(){
var theApp=new (Backbone.Router.extend({
	routes:
	{
		'cloudspokes/:type' : 'callCS'
	},

	callCS: function(type)
	{
		var items;
		var view;
		var opts={};
		var listEl=$('#cloudspokesdata');
		$('#loadingIcon').show();
		listEl.hide();

		if(type=='challenges')
		{
			items=new Challenges();
			view=new ChallengesView({ collection: items, el: listEl });
			opts={ open: true, order_by: 'end_date' };
		}
		else if(type=='leaderboard')
		{
			items=new LeaderboardItems();
			view=new LeaderBoardItemsView({ collection: items, el: listEl });
			opts={ period: 'month', limit: 10 };
		}

		items.fetch({reset: true, data: opts,
			error: function(model, xhr, options){ 
				console.log('error!!!'); 
			},

			success: function(collection, response, options) {
			console.log('final success');
			$('#loadingIcon').hide();
			listEl.show();
		} });

	},

	initialize: function() {

	},

	start: function(options)
	{
		if(options===undefined) { options={}; }
		if(options.startURL===undefined) { options.startURL='cloudspokes/challenges' }

		Backbone.history.start({ pushState: true }) ;
		var nav=new NavView({ el: $('#nav') });
		console.log('navigating to '+options.startURL);
		this.navigate(options.startURL, { trigger: true });		
	}
}));

	theApp.start({ startURL: 'cloudspokes/challenges'});

	$(document).on("click", "a:not([data-bypass])", function(evt) {
		evt.preventDefault();
		Backbone.history.navigate($(this).attr("href"), true);
	});

	
});