var Yii = {};

Yii.$ = this.jQuery;

var Router = Yii.Router = function(options) {
	this.initialize.apply(this, arguments);
}

Router.prototype = {
	started: false,

	routes: {},

	initialize: function() {},

	start: function() {
		if (this.started) {
			throw new Error("Router has already been started!");
		}

		this.currentHash = this._parseURL(document.URL).hash;

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
				method = this.routes[key];

				if (!method) {
					return this;
				}

				if (!_.isFunction(method)) {
					method = this[method];
				}

				method.apply(this, args);
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
		}
	}
};

var View = Yii.View = function(options) {
	this.cid = _.uniqueId('yii_view_');
	this.initialize.apply(this, arguments);
	this.loadElement();
	this.bindEvents();
}

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
		var output = _.template(this.template, this.model);
		this.element.html(output);

		return this;
	},
}

var Model = Yii.Model = function(attributes, options) {
	this.cid = _.uniqueId('yii_model_');
	var attrs = attributes || {};
	options || (options = {});
	attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	this.set(attrs);
	this.initialize.apply(this, arguments);
}

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

	fetch: function(options) {
		var that = this;

		var getOptions = {};

		getOptions.type = 'GET';

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

		if (options.form) {
			var form_data = new FormData($(options.form)[0]);
		}

		if (form_data == undefined) {
			var form_data = new FormData();
		}

		var attrs = this.attributes;
		_.extend(attrs, attributes);

		for (var key in attrs) {
			form_data.append(key, attrs[key]);
		}

		saveOptions.data = form_data;

		saveOptions.success = options.success;

		this.sync(saveOptions);
	},

	update: function(attributes, options) {
		updateOptions = {};

		updateOptions.type = 'PUT';
		
		if (options.form) {
			var form_data = new FormData($(options.form)[0]);
		}

		if (form_data == undefined) {
			var form_data = new FormData();
		}

		var attrs = this.attributes;
		_.extend(attrs, attributes);

		for (var key in attrs) {
			form_data.append(key, attrs[key]);
		}

		updateOptions.data = form_data;

		updateOptions.success = options.success;

		this.sync(updateOptions);
	},

	destroy: function(attributes, options) {
		destroyOptions = {};

		destroyOptions.type = 'DELETE';
		
		if (options.form) {
			var form_data = new FormData($(options.form)[0]);
		}

		if (form_data == undefined) {
			var form_data = new FormData();
		}

		var attrs = this.attributes;
		_.extend(attrs, attributes);

		for (var key in attrs) {
			form_data.append(key, attrs[key]);
		}

		destroyOptions.data = form_data;

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