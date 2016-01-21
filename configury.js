var merge = require('lodash.merge')
  , fs = require('fs')
  , traverse = require('traverse');

module.exports = Configury

function Configury(configPath, defaultSection) {
  var raw = {
    global: {}
  }

  if (!defaultSection) defaultSection = 'global'

  if (configPath && typeof configPath === 'string' && fs.existsSync(configPath)) {
    try {
      raw = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new SyntaxError('Invalid JSON in ' + configPath)
      } else {
        throw e
      }
    }
  }
  else if (configPath && typeof configPath === 'object') {
    raw = configPath
  }

  function substitute(config, value) {
    if (typeof value === 'string') {
      return value.replace(/%([a-zA-Z.-_]+)%/g, function(match, propertyName) {
          return config[propertyName] || value
        })
    }
    return value
  }

  function self(section) {
    section = section || defaultSection
    var config
    try {
      if (section === 'global') {
        config = raw.global
      } else {
        config = merge({}, raw.global, raw[section])
      }

      traverse(config).forEach(function (value) {
        this.update(substitute(config, value))
      })

    } catch (e) {
      throw new Error('No section \'' + section + '\'')
    }
    return config
  }

  self.raw = function getRaw() {
    return raw
  }

  self.write = function write(path, cb) {
    var json = JSON.stringify(raw, false, 2)
    path = configPath || path
    if (path === undefined) {
      throw new Error('No path provided to write config')
    }
    if (cb) {
      fs.writeFile(path, json, cb)
    } else {
      fs.writeFileSync(path, json)
    }
  }

  function setKey(key, value) {
    raw[this][key] = value
  }

  self.set = setKey.bind('global')

  self.section = function section(sectionName) {
    if (raw[sectionName] === undefined) {
      raw[sectionName] = {}
    }
    return { set: setKey.bind(sectionName)
      , merge: mergeConfig.bind(sectionName) }
  }

  function mergeConfig(data) {
    var configData = data

    if (typeof data === 'string') {
      configData = JSON.parse(fs.readFileSync(data))
    }
    if (typeof this === 'object') {
      merge(raw[this], configData)
    } else {
      merge(raw, configData)
    }
  }

  self.merge = mergeConfig

  return self
}
