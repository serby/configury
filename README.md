# configury

Easy management of environment based configuration

[![build status](https://secure.travis-ci.org/serby/configury.png)](http://travis-ci.org/serby/configury)

## Installation

      npm install configury

## Usage

### configury([path, defaultSection])

Using in-memory configuration

```js
var configury = require('configury')
  , config = configury()

```

Using configuration file on disk


```js
var configury = require('configury')
  , config = configury('./properties.json')

```

Using default config section other than 'global'

```js
var configury = require('configury')
  , config = configury('./properties.json', 'myDefaultConfigSection')

```

### config.raw()

```js
var configury = require('configury')
  , config = configury('./properties.json')

config.raw()
//-> { "global": { "foo": "bar" }, "development": { "foo": "bar" } ... }

```

### config.write([path, cb])
Save the current configuration in memory to disk

```js
var configury = require('configury')
  , config = configury('./properties.json')

// Write to './properties.json' file on disk synchronously
config.write()

// Write to './properties.json' file on disk asynchronously
config.write(false, function (err) {
  if (!err) console.log('Yeah')
})

// Write to './myBackupProperties.json' file on disk asynchronously
config.write('myBackupProperties.json', function (err) {
  if (!err) console.log('Yeah')
})

// Write to './myBackupProperties.json' file on disk synchronously
config.write('myBackupProperties.json')

```

### config.set(key, value)
Setting a variable in 'global' configuration

```js
var configury = require('configury')
  , config = configury('./properties.json')

config.set('Alice', 'Bob')
config.raw()
//-> { "global": { "Alice": "Bob" } ... }

```

Setting a variable in 'myCustomGlobal'

```js
var configury = require('configury')
  , config = configury('./properties.json', 'myCustomGlobal')

config.set('Alice', 'Bob')
config.raw()
//-> { "myCustomGlobal": { "Alice": "Bob" } ... }

```

### config.section(section)

```js
var configury = require('configury')
  , config = configury('./properties.json', 'myCustomGlobal')

var mySection = config.section('mySection')
//-> mySection = { set: function(key, value), merge: function(object) }

```

Setting a variable in 'mySection'

```js
var configury = require('configury')
  , config = configury('./properties.json')
  , mySection = config.section('mySection')

mySection.set('Alice', 'Bob')
config.raw()
//-> { "global": { ... } "mySection" { "Alice": "Bob" } }

```

### config.merge()

Merging an object over a property in the configuration

```js
var configury = require('configury')
  , config = configury('./properties.json')

config.set('foo', 'bar')
//-> { "global": { "foo": "bar" } ... }
config.merge({ 'foo': 'woo' })
//-> { "global": { "foo": "woo" } ... }

```

Merging an object over a property in 'mySection'

```js
var configury = require('configury')
  , config = configury('./properties.json')
  , mySection = config.section('mySection')

mySection.set('foo', 'bar')
//-> { "global": { ... } "mySection": { "foo": "bar" } }
mySection.merge({ 'foo': 'woo' })
//-> { "global": { ... } "mySection": { "foo": "woo" } }

```

## Credits
[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
