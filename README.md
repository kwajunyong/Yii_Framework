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

<b>start</b> `Yii.Router.extend(properties)` <br/>
Used for creating a custom router class.

<b>navigate</b> `router.navigate(hash, trigger, replace)` <br/>
Update url to the given hash. Route function is triggered if trigger is set `true`. Browser's history is not created during updating of URL if replace is set `true`.


<b>Model</b>
------------
<b>View</b>
-----------
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
