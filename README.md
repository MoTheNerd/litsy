
![LitsyLogo](https://sfo2.digitaloceanspaces.com/modev/litsy/litsylogo%400.5x.png)

### litsy is a minimal simple state manager and local dataStore for modern node apps.

## Introduction
litsy was created to battle 2 hours worth of boilerplate redux-saga, redux, actions code, reducers code etc. Most modern day node.js applications really only need a few things like a way to **set data** and **share data** with the rest of the app or to **listen to when data changes and do something with it**. Litsy makes all of this a painless process. The basic model is as follows:

**Set a function call on state change** \> **Set a StateName/State pair** \> **Trigger all function calls** \> **In function call, update local states as necessary**

litsy also allows you to specify if you'd like a certain dataStore to be **persistent** (useful for saving web-app auth tokens or loginState etc.) or **non-persistent** (useful for keeping track of current app state which should be let go after a user leaves the app).

## Getting Started
To get going with litsy, start by installing it as a dependency:

`$ yarn add litsy` or `$ npm i litsy`

Once you've installed the dependency, you can get started with whatever you want. litsy's main reason for existence is to simplify the process of sharing data between different parts of an application whilst simultaneously allowing any objects dependent on certain data to be notified of a change. litsy makes all of this super simple.

## Create a store
Much like redux, litsy saves information in stores of data. A store is typically responsible for an entire application at once although you can always access other stores to have cross-package communications. To create a store, you need to import the Store class and create a new Store.

```
import { Store } from 'litsy'
```
```
...
```
```
let myStore = new Store({
    storeName: "awesome_app",
    persist: true 
});
```
## Subscribe/Unsubscribe to a stateName
### Subscribe:
A `stateName` is the name assigned to a state you would like to watch the contents of. One example of organizing stateNames is by assigning names relative to the content you expect in any given state such as 

````
stateName: "data.profile_section.user_name"
value: "John Doe"
````

The way to subscribe to a stateName (even before you have instantiated the stateName along with the respective state) is as follows:

```
myStore.subscribe(stateName, subscriberName, callBackFn);
```
Where a callBackFn is applied to a subscriberName. When the state associated with the stateName is changed, all subscribers get notice of a stateChange having occurred. At this point you can re-render a react-component, feed some new data, whatever you want to do. An example would be:
```
myStore.subscribe("data.profile_section.user_name", "usernameLabel", () => {
	this.forceUpdate.bind(this);
};
```
It is possible to have the same subscriber subscribed to multiple states and it's also possible for multiple subscribers to be subscribed to the same state. Keep in mind that any subscriberEvents should not depend on one another to function.
### Unsubscribe:
to unsubscribe, simply just
```
myStore.unsubscribe(stateName, subscriberName);
```

## Setting/Getting a stateName and value pair
### Setting:
Setting a stateName and value pair can be done using
```
myStore.setState(stateName, value);
```
setting a state **always** notifies subscribers and saves the state to either localStorage (if data is persistent) or sessionStorage (in the case that the store is a non-persistent store).

### Getting:

getting a state is easy as well, all you have to do is
```
let result = myStore.getState(stateName);
```

## Cross-package communication (currently in the works)
