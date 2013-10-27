var $ = this.jQuery;

var View = function(options) {
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
		console.log(this.model);
		var output = _.template(this.template, this.model);
		this.element.html(output);

		return this;
	},
}

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

View.extend = extend;