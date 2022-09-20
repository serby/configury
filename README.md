# configury

Easy management of environment based configuration

[![build status](https://secure.travis-ci.org/serby/configury.png)](http://travis-ci.org/serby/configury)

## Installation

      npm install configury

## Usage

### configury([pathOrConfig, defaultSection])

Using in-memory configuration

```js
const configury = require('configury')
const config = configury()

```

Using configuration file on disk


```js
const configury = require('configury')
const config = configury('./properties.json')

```

Using default config section other than 'global'

```js
const configury = require('configury')
const config = configury('./properties.json', 'myDefaultConfigSection')

```

Using existing config object

```js
const config = {
  global: {
    foo: 'bar'
  },
  sectionName: {
    bar: 'baz'
  }
}
const configury = require('configury')
const config = configury(config)

```

### config.raw()

```js
const configury = require('configury')
const config = configury('./properties.json')

config.raw()
//-> { "global": { "foo": "bar" }, "development": { "foo": "bar" } ... }

```

### config.write([path, cb])
Save the current configuration in memory to disk

```js
const configury = require('configury')
const config = configury('./properties.json')

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
const configury = require('configury')
const config = configury('./properties.json')

config.set('Alice', 'Bob')
config.raw()
//-> { "global": { "Alice": "Bob" } ... }

```

Setting a variable in 'myCustomGlobal'

```js
const configury = require('configury')
const config = configury('./properties.json', 'myCustomGlobal')

config.set('Alice', 'Bob')
config.raw()
//-> { "myCustomGlobal": { "Alice": "Bob" } ... }

```

### config.section(section)

```js
const configury = require('configury')
const config = configury('./properties.json', 'myCustomGlobal')

const mySection = config.section('mySection')
//-> mySection = { set: function(key, value), merge: function(object) }

```

Setting a variable in 'mySection'

```js
const configury = require('configury')
const config = configury('./properties.json')
const mySection = config.section('mySection')

mySection.set('Alice', 'Bob')
config.raw()
//-> { "global": { ... } "mySection" { "Alice": "Bob" } }

```

### config.merge()

Merging an object over a property in the configuration

```js
const configury = require('configury')
const config = configury('./properties.json')

config.set('foo', 'bar')
//-> { "global": { "foo": "bar" } ... }
config.merge({ 'global': { 'foo': 'woo' }, 'pickles': 'bananas' })
//-> { "global": { "foo": "woo" }, "pickles": "bananas" }

```

Merging an object over a property in 'mySection'

```js
const configury = require('configury')
const config = configury('./properties.json')
const mySection = config.section('mySection')

mySection.set('foo', 'bar')
//-> { "global": { ... } "mySection": { "foo": "bar" } }
mySection.merge({ 'foo': 'woo' })
//-> { "global": { ... } "mySection": { "foo": "woo" } }

```

### Substitution

By default, configury will substitute any values that match the pattern: `%string%`. This will substitute the current value with the value of that key if it exists. E.g:

```js
const configury = require('configury')
const config = configury()

config.set('url', 'http://localhost:3000')
config.set('loginUrl', '%url%/login')

console.log(config().loginUrl)
//-> 'http://localhost:3000/login'
```

## Credits
[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
