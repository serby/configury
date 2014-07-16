var Configury = require('..')
  , fs = require('fs')

describe('configury.js', function () {

  describe('should return a function', function () {
    var configury = new Configury('./config.json')
    configury('./config.json').config.should.be.a('function')
  })

  describe('should return config object', function () {
    var configury = new Configury()
      , config = configury()

    config.should.be.a('object')
    config.should.equal({})
  })

  describe('#set', function () {
    describe('should add a global property', function () {
      var configury = new Configury()
        , config

      configury.set('foo', 'bar')
      config = configury()
      config.foo.should.equal('bar')
      configury.raw().global.foo.equal('bar')

    })

    describe('should allow section based #set', function () {
      var configury = new Configury()
        , config

      configury.section('custom').set('foo', 'bar')
      config = configury('custom')
      config.foo.should.equal('bar')
      configury.raw().development.foo.equal('bar')

    })

    describe('sections should override global properties', function () {
      var configury = new Configury()
        , config

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      config = configury('custom')
      config.foo.should.equal('rab')
      configury.raw().global.foo.equal('bar')
      configury.raw().custom.foo.equal('rab')

    })
  })

  describe('#write()', function () {
    describe('should error if no path is set', function () {
      var configury = new Configury();

      (function () {
        configury.write()
      }).should.throw('a')

    })

    describe('should write to give path', function () {
      var configury = new Configury()

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      configury.write('./write-test.json')
      JSON.parse(fs.readFileSync('./write-test.json')).should.equal(configury.raw())

    })

    describe('should write to original path', function () {
      var configury = new Configury('./write-test.json')

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      configury.write()

      var configury2 = new Configury('./write-test.json')

      configury2.raw().global.foo.equal('bar')
      configury2.raw().custom.foo.equal('rab')
      configury2.set('fu', 'baa')
      configury2.section('custom').set('fu', 'ba')
      configury2.raw().global.fu.equal('baa')
      configury2.raw().custom.fu.equal('ba')
      configury2.write()

      JSON.parse(fs.readFileSync('./write-test.json')).should.equal(configury.raw())

    })
  })

  describe('#merge()', function () {

    describe('should overlay properties from objects', function () {
      var configury = new Configury()
        , config

      configury.set('foo', 'bar')
      configury.merge({ foo: 'woo' })

      config = configury()
      config.foo.should.equal('woo')
    })

    describe('should overlay properties from files', function () {
      var configury = new Configury()
        , config

      configury.set('foo', 'bar')
      configury.merge('./extra.json')

      config = configury()
      config.foo.should.equal('woo')
    })

    describe('should overlay properties from files', function () {
      var configury = new Configury()
        , config

      configury.section('custom').set('foo', 'bar')
      configury.section('custom').merge('./extra.json')

      config = configury()
      config.foo.should.equal('woo')
      configury.raw().custom.foo.equal('woo')
    })

    describe('should overlay properties from objects on sections', function () {
      var configury = new Configury()
        , config

      configury.section('custom').set('foo', 'bar')
      configury.section('custom').merge({ foo: 'woo' })

      config = configury()
      config.foo.should.equal('woo')
      configury.raw().custom.foo.equal('woo')
    })

  })

  describe('#substitution', function () {

    describe('should substitute pattern from existing property', function () {
      var configury = new Configury()
        , config
      configury.set('foo', 'bar')
      configury.set('too', '%foo%/woo')
      config = configury()
      config.too.should.equal('bar/woo')
    })

    describe('should substitute nested pattern from existing property', function () {
      var configury = new Configury()
        , config
      configury.set('foo', { bar: 'hoo' })
      configury.set('too', '%foo.bar%/woo')
      config = configury()
      config.too.should.equal('hoo/woo')
    })

  })

})
