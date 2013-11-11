<b>Yii.js Documentation</b>
====================

<b>Navigator</b>
----------------
Global router for handling navigation and routing. Navigator can be accessed globally using `Yii.navigator`.

<b>start</b> `Yii.navigator.start()` <br/>
Used to start the routing

<b>stop</b> `Yii.navigator.stop()` <br/>
Used to stop the routing

<b>navigate</b> `Yii.navigator.navigate(hash, trigger, replace)` <br/>
Update url to the given hash. Route function is triggered if trigger is set `true`. Browser's history is not created during updating of URL if replace is set `true`.

<b>Router</b>
-------------
Yii.Router provides routing of pages and binding function to these routes.

	var MyRouter = Yii.Router.extend({
		initialize: function() {},

		routes: {
			'dog/:id/edit': 'woof',
			'cat': 'meow',
			'cow/milk:id/cheese:val': 'moo'
		},

		woof: function(id) {
			console.log('woof', id);
		},

		meow: function() {
			console.log('meow');
		},

		moo: function(id, val) {
			console.log('moo', id, val);
		}
	});

<b>extend</b> `Yii.Router.extend(properties)` <br/>
Used for creating a custom router class.

<b>navigate</b> `router.navigate(hash, trigger, replace)` <br/>
Update url to the given hash. Route function is triggered if trigger is set `true`. Browser's history is not created during updating of URL if replace is set `true`.

<b>Routes</b> `router.routes`<br/>
Maps URLs to functions on the router. Placing `:` behind a word will allow it to become a parameter for the routing function.

<b>Model</b>
------------
Yii.Model stores data and provides a sync mechanism with server.

	var MyModel = Yii.Model.extend({
		url: 'http://cs3213.herokuapp.com/movies.json'
	});

	var myModel = new MyModel();

	myModel.save({
		'access_token' : '123',

		form: '#add-movie-form',

		success: function(data, status, jqxhr) {
			console.log('success');
		}

		success: function(jqxhr, status, error_thrown) {
			console.log('error');
		}
	});

<b>extend</b> `Yii.Model.extend(properties)` <br/>
Used for creating a custom Model class.

<b>attributes</b> `model.attributes` <br/>
Contains the model's data

<b>get</b> `model.get(attribute)` <br/>
Get the value of the attribute from the model's data

<b>set</b> `model.set(attributes)` <br/>
Set attributes on the model's data

<b>setElement</b> `model.setElement(attribute)` <br/>
Set the value of the attribute on the model's data

<b>has</b> `model.has(attribute)` <br/>
Check if there is such an attribute on the model's data

<b>clear</b> `model.clear()` <br/>
Clear the model's data

<b>setURL</b> `model.setURL(url)` <br/>
Set the Model's url

<b>fetch</b> `model.fetch(options)` <br/>
Retrieve data from server and set it to `model.attributes`. If the data retrieved is an array, it will be set to `model.attributes[collection]`.

<b>save</b> `model.save(options)` <br/>
Save model's data to url specified in `options.url` or `model.url`.
		
<b>update</b> `model.update(options)` <br/>
Update model's data to url specified in `options.url` or `model.url`.

<b>destroy</b> `model.destroy(options)` <br/>
Delete model's data from url specified in `options.url` or `model.url`. 

For <b>fetch</b>, <b>save</b>, <b>update</b> & <b>destroy</b>, `success` and `error` callback can be included in `options`. If a form element selector is included in `options.form`, a FormData will be created from the form and appended with values of attributes from model and options to be sent to the URL. 

<b>View</b>
-----------
Yii.View provides a mechanism to bind DOM events and render data for display.

	var MyView = View.extend({
		id: 'viewer',

		template: $('#woof-template').html(),

		model: {
			name: 'Mr. Happy',
			location: 'Happyland',
			img: 'MrHappy.jpg'
		},

		events: {
			'click #hello': 'woof',
			'click #goodbye': 'meow'
		},

		woof: function() {
			alert('Hello World!');
		},

		meow: function() {
			alert('Goodbye World!');
		}
	});

<b>extend</b> `Yii.Model.extend(properties)` <br/>
Used for creating a custom View class.

<b>model</b> `view.model` <br/>
Contains the data to be rendered on view.

<b>element</b> `view.element` <br/>
Stores the jquery element object to be rendered on view. It has a default value of $('div'). It can be set directly or modified using `selector`, `tagName`, `id` and `className`.

<b>template</b> `view.template` <br/>
Contains either the template function or the template string to be rendered on view
		
<b>loadElement</b> `view.loadElement` <br/>
Load `element` from `selector` if it is being defined, otherwise load `element` from `tagName`, `id` and `className`.

<b>events</b> `view.events` <br/>
Map DOM events and DOM elements to functions on view.

<b>bindEvents</b> `view.bindEvents()` <br/>
Bind DOM events to the view's DOM elements as defined in `events`. If no element is defined, bind DOM event to `element`.

<b>unbindEvents</b> `view.unbindEvents()` <br/>
Unbind DOM events from the view's DOM elements.

<b>render</b> `view.render()` <br/>
Render the view by filling the `template` with data from `model` and set it to the `element`.

<b>unbindEvents</b> `view.unbindEvents()` <br/>
Unbind the view's events and remove the rendered view.

<b>PubSub</b>
------------
PubSub provides publish and subscribe functions to implement Observer Pattern in the webpage by using `Yii.PubSub`

<b>start</b> `Yii.PubSub.publish(topic)` <br/>
Used to subscribe to a topic specified by the parameter

<b>start</b> `Yii.PubSub.subscribe(topic, topicContent, notifyFunction)` <br/>
Used to publish a topic to all the subscribers based on the topic published. 
The `topicContent` will further differentiate the various subscribers in the same topic accordingly. 
`notifyFunction` is the function that will be executed on the subscribers' side when the they are notified.

<b>start</b> `Yii.PubSub.publish(topic, notifyFunction)` <br/>
Unsubscribe the caller from the specific topic and remove the `notifyFunction` from the subscription records
