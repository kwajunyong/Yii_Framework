(function() {
	var root = this;

	var previousYii = root.Yii;

	var Yii = root.Yii = {};

	Yii.$ = root.jQuery;
	var _ = root._;

	Yii.noConflict = function() {
		root.Yii = previousYii;
		return this;
	};

	var PubSub = Yii.PubSub = {
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

	var Navigator = Yii.Navigator = function() {};

	Navigator.prototype = {
		routes: {},

		routers: {},

		started: false,

		start: function() {
			if (this.started) {
				throw new Error("Navigator has already been started!");
			}

			this.currentHash = this._parseURL(document.URL).hash;
			this._triggerRoutes(this.currentHash);

			var that = this;

			window.onpopstate = function() {
				var hash = that._parseURL(document.URL).hash;

				if (hash != that.currentHash) {
					that._triggerRoutes(hash);

					that.currentHash = hash;
				}
			};

			this.started = true;
		},

		stop: function() {
			window.onpopstate = null;

			this.started = false;
		},

		navigate: function(url, trigger) {
			window.history.pushState({}, '', url);

			if (trigger) {
				this._triggerRoutes(this._parseURL(document.URL).hash);
			}
		},

		_triggerRoutes: function(hash) {
			var hashSegments = hash.split('/');

			for (var key in this.routes) {
				var match = true;

				var args = [];

				var routeSegments = key.split('/');

				if (hashSegments.length != routeSegments.length) {
					match = false;
				} else {
					for (var i = 0; i < hashSegments.length; i++) {
						var index = routeSegments[i].indexOf(':');

						if (index > -1) {
							match = hashSegments[i].slice(0, index) == routeSegments[i].slice(0, index);

							args.push(hashSegments[i].slice(index));
						} else {
							match = hashSegments[i] == routeSegments[i];
						}

						if (!match) {
							break;
						}
					}
				}

				if (match) {
					var method = this.routes[key];

					if (!method) {
						return this;
					}

					var router = this.routers[key];

					if (!router) {
						router = this;
					}

					if (!_.isFunction(method)) {
						method = router[method];
					}

					method.apply(router, args);
				}
			}
		},

		_parseURL: function(url) {
			var a = document.createElement('a');
			a.href = url;
			return {
				source : url,
				protocol : a.protocol.replace(':', ''),
				host : a.hostname,
				port : a.port,
				query : a.search,
				params : (function() {
					var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
					for (; i < len; i++) {
						if (!seg[i]) {
							continue;
						}
						s = seg[i].split('=');
						ret[s[0]] = s[1];
					}
					return ret;
				})(),
				file : (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
				hash : a.hash.replace('#', ''),
				path : a.pathname.replace(/^([^\/])/, '/$1'),
				relative : (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
				segments : a.pathname.replace(/^\//, '').split('/')
			};
		}
	};

	Yii.navigator = new Navigator();

	var Router = Yii.Router = function(options) {
		this._bindRoutes();
		this.initialize.apply(this, arguments);
	};

	Router.prototype = {
		routes: {},

		initialize: function() {},

		navigate: function(url, trigger) {
			Yii.navigator.navigate(url, trigger);
		},

		_bindRoutes: function() {
			for (var key in this.routes) {
				var method = this.routes[key];

				if (!method) {
					return this;
				}

				Yii.navigator.routes[key] = method;

				Yii.navigator.routers[key] = this;
			}
		}
	};

	_.extend(Router.prototype, PubSub);

	var View = Yii.View = function(options) {
		this.cid = _.uniqueId('yii_view_');
		this.initialize.apply(this, arguments);
		this.loadElement();
		this.bindEvents();
	};

	View.prototype = {
		eventsKeyPattern:  /^(\S+)\s*(.*)$/,

		element: $('div'),

		initialize: function() {},

		loadElement:function() {
			if (!this.selector) {
				this.selector = '';
				this.selector += (this.tagName) ? this.tagName : '';
				this.selector += (this.id) ? '#' + this.id : '';
				this.selector += (this.className) ? '.' + this.className : '';
			}

			this.element = $(this.selector);
		},

		bindEvents: function() {
			if (!this.events) {
				return this;
			}

			for (var key in this.events) {
				var matched = key.match(this.eventsKeyPattern);

				var domEvent = matched[1];
				domEvent += '.' + this.cid;

				var domElement = matched[2];

				var method = this.events[key];

				if (!method) {
					continue;
				}

				if (!_.isFunction(method)) {
					method = this[method];
				}

				method = _.bind(method, this);

				if (domElement != '') {
					this.element.on(domEvent, domElement, method);
				} else {
					this.element.on(domEvent, method);
				}
			}

			return this;
		},

		unbindEvents: function() {
			this.element.off('yii_view_' + this.cid);

			return this;
		},

		render: function () {
			var output = (_.isFunction(this.template)) ? this.template(this.model) : _.template(this.template, this.model);
			this.element.html(output);

			return this;
		}
	};

	_.extend(View.prototype, PubSub);

	var Model = Yii.Model = function(attributes, options) {
		this.cid = _.uniqueId('yii_model_');
		var attrs = attributes || {};
		options || (options = {});
		attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
		this.set(attrs);
		this.initialize.apply(this, arguments);
	};

	Model.prototype = {
		url: '',

		attributes: {},

		initialize: function() {},

		get: function(attr) {
			return this.attributes[attr];
		},

		has: function(attr) {
			return this.get(attr) != null;
		},

		clear: function() {
			this.attributes = {};
		},

		set: function(attrs) {
			this.attributes = attrs;
		},

		setElement: function(key, value) {
			this.attributes[key] = value;
		},

		fetch: function(options, attributes) {
			var that = this;

			var getOptions = {};

			getOptions.type = 'GET';

			var data = {};
			_.extend(data, this.attributes, attributes);

			if (options.form) {
				var form_data = new FormData($(options.form)[0]);

				for (var key in data) {
					form_data.append(key, data[key]);
				}

				data = form_data;
			}

			getOptions.data = data;

			getOptions.success = function(data, status, jqxhr) {
				if (_.isArray(data)) {
					that.attributes = {
						collection: data
					};	
				} else {
					that.attributes = data;
				}

				if (options.success) {
					options.success(data, status, jqxhr);
				}
			};

			this.sync(getOptions);
		},

		save: function(attributes, options) {
			var saveOptions = {};

			saveOptions.type = 'POST';

			var data = {};
			_.extend(data, this.attributes, attributes);

			if (options.form) {
				var form_data = new FormData($(options.form)[0]);

				for (var key in data) {
					form_data.append(key, data[key]);
				}

				data = form_data;
			}

			saveOptions.data = data;

			saveOptions.success = options.success;

			this.sync(saveOptions);
		},

		update: function(attributes, options) {
			updateOptions = {};

			updateOptions.type = 'PUT';

			var data = {};
			_.extend(data, this.attributes, attributes);

			if (options.form) {
				var form_data = new FormData($(options.form)[0]);

				for (var key in data) {
					form_data.append(key, data[key]);
				}

				data = form_data;
			}

			updateOptions.data = data;

			updateOptions.success = options.success;

			this.sync(updateOptions);
		},

		destroy: function(attributes, options) {
			destroyOptions = {};

			destroyOptions.type = 'DELETE';

			var data = {};
			_.extend(data, this.attributes, attributes);

			if (options.form) {
				var form_data = new FormData($(options.form)[0]);

				for (var key in data) {
					form_data.append(key, data[key]);
				}

				data = form_data;
			}

			destroyOptions.data = data;

			destroyOptions.success = options.success;

			this.sync(destroyOptions);
		},

		sync: function(options) {
			syncOptions = {
				type: options.type,

				url: this.url,

				data: options.data,

				cache: false,
				contentType: false,
				processData: false,

				success: options.success,

				error: options.error
			};

			$.ajax(syncOptions);
		}
	};

	_.extend(Model.prototype, PubSub);

	var extend = function(options) {
		var parent = this;
		var child;

		if (options && _.has(options, 'constructor')) {
			child = options.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		var Surrogate = function() { 
			this.constructor = child; 
		};

		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		if (options) {
			_.extend(child.prototype, options);
		} 

		child.__super__ = parent.prototype;

		return child;
	};

	Router.extend = Model.extend = View.extend = extend;
}).call(this);