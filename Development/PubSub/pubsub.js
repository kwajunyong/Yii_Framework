var PubSub = function() {}

PubSub.prototype = {
	slice: [].slice,

	subscriptions: {},

	publish: function( topic ) {
		var args = this.slice.call( arguments, 1 ),
		topicSubscriptions,
		subscription,
		length,
		i = 0,
		ret;

		if ( !this.subscriptions[ topic ] ) {
			return true;
		}

		topicSubscriptions = this.subscriptions[ topic ].slice();
		for ( length = topicSubscriptions.length; i < length; i++ ) {
			subscription = topicSubscriptions[ i ];
			ret = subscription.callback.apply( subscription.context, args );
			if ( ret === false ) {
				break;
			}
		}
		return ret !== false;
	},

	subscribe: function( topic, context, callback, priority ) {
		if ( arguments.length === 3 && typeof callback === "number" ) {
			priority = callback;
			callback = context;
			context = null;
		}
		if ( arguments.length === 2 ) {
			callback = context;
			context = null;
		}
		priority = priority || 10;

		var topicIndex = 0,
		topics = topic.split( /\s/ ),
		topicLength = topics.length,
		added;
		for ( ; topicIndex < topicLength; topicIndex++ ) {
			topic = topics[ topicIndex ];
			added = false;
			if ( !this.subscriptions[ topic ] ) {
				this.subscriptions[ topic ] = [];
			}

			var i = this.subscriptions[ topic ].length - 1,
			subscriptionInfo = {
				callback: callback,
				context: context,
				priority: priority
			};

			for ( ; i >= 0; i-- ) {
				if ( this.subscriptions[ topic ][ i ].priority <= priority ) {
					this.subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
					added = true;
					break;
				}
			}

			if ( !added ) {
				this.subscriptions[ topic ].unshift( subscriptionInfo );
			}
		}

		return callback;
	},

	unsubscribe: function( topic, callback ) {
		if ( !this.subscriptions[ topic ] ) {
			return;
		}

		var length = this.subscriptions[ topic ].length,
		i = 0;

		for ( ; i < length; i++ ) {
			if ( this.subscriptions[ topic ][ i ].callback === callback ) {
				this.subscriptions[ topic ].splice( i, 1 );
				break;
			}
		}
	}
};