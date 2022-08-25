var assert = require('assert')
var rewire = require('rewire')
var createConfigury = rewire('..')

describe('configury.js', function() {
  it('should return a function', function() {
    var configury = createConfigury()
    configury.should.be.type('function')
  })

  it('should return config object', function() {
    var configury = createConfigury()
    var config = configury()

    config.should.be.type('object')
    config.should.eql({})
  })

  describe('#set', function() {
    it('should add a global property', function() {
      var configury = createConfigury()
      var config

      configury.set('foo', 'bar')
      config = configury()
      config.foo.should.eql('bar')
      configury.raw().global.foo.should.eql('bar')
    })

    it('should return itself', function() {
      var configury = createConfigury()
      assert.strictEqual(configury.set('foo', 'bar'), configury)
    })

    it('should allow section based #set', function() {
      var configury = createConfigury()
      var config

      configury.section('custom').set('foo', 'bar')
      config = configury('custom')
      config.foo.should.eql('bar')
      configury.raw().custom.foo.should.eql('bar')
    })

    describe('sections should override global properties', function() {
      var configury = createConfigury()
      var config

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      config = configury('custom')
      config.foo.should.eql('rab')
      configury.raw().global.foo.should.eql('bar')
      configury.raw().custom.foo.should.eql('rab')
    })
  })

  describe('#write()', function() {
    it('should error if no path is set', function() {
      var configury = createConfigury()

      ;(function() {
        configury.write()
      }.should.throw('No path provided to write config'))
    })

    it('should write to given path', function() {
      var configury = createConfigury()
      var fsMock = {
        writeFileSync: function(path, data) {
          data.should.eql(JSON.stringify(configury.raw(), false, 2))
        }
      }
      createConfigury.__set__('fs', fsMock)

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      configury.write('./write-test.json')
    })

    it('should write a pretty JSON file', function() {
      var configury = createConfigury()
      var fsMock = {
        writeFileSync: function(path, data) {
          data.should.eql(
            ['{', '  "global": {', '    "foo": "bar"', '  }', '}'].join('\n')
          )
        }
      }
      createConfigury.__set__('fs', fsMock)

      configury.set('foo', 'bar')
      configury.write('./write-test.json')
    })

    it('should throw Invalid JSON', function() {
      var fsMock = {
        readFileSync: function() {
          return '{ bad }'
        },
        existsSync: function() {
          return true
        }
      }
      createConfigury.__set__('fs', fsMock)
      ;(function() {
        createConfigury('./bad.json')
      }.should.throw(/Invalid JSON/))
    })

    it('should write to original path', function() {
      var configury
      var mockConfig = JSON.stringify({})
      var fsMock = {
        existsSync: function() {
          // Assuming {} is because the config hasn't yet been created
          return mockConfig !== '{}'
        },
        readFileSync: function() {
          return mockConfig
        },
        writeFileSync: function(path, data) {
          mockConfig = data
        }
      }

      createConfigury.__set__('fs', fsMock)

      configury = createConfigury('./write-test.json')

      configury.set('foo', 'bar')
      configury.section('custom').set('foo', 'rab')
      configury.write()

      var configury2 = createConfigury('./write-test.json')
      configury2.raw().global.foo.should.eql('bar')
      configury2.raw().custom.foo.should.eql('rab')
      configury2.set('fu', 'baa')
      configury2.section('custom').set('fu', 'ba')
      configury2.raw().global.fu.should.eql('baa')
      configury2.raw().custom.fu.should.eql('ba')
      configury2.write()
    })
  })

  describe('#merge()', function() {
    it('should overlay properties from objects', function() {
      var configury = createConfigury()
      var config

      configury.set('foo', 'bar')
      configury.merge({ global: { foo: 'woo' } })

      config = configury()
      config.foo.should.eql('woo')
    })

    it('should return itself', function() {
      var configury = createConfigury()
      assert.strictEqual(configury.merge({ global: { foo: 'woo' } }), configury)
    })

    it('should overlay properties from files', function() {
      var configury = createConfigury()
      var config
      var fsMock = {
        readFileSync: function() {
          return JSON.stringify({ global: { foo: 'woo' } })
        }
      }
      createConfigury.__set__('fs', fsMock)

      configury.set('foo', 'bar')
      configury.merge('./extra.json')

      config = configury()
      config.foo.should.eql('woo')
    })

    it('should overlay properties from files', function() {
      var configury = createConfigury()
      var config
      var fsMock = {
        readFileSync: function() {
          return JSON.stringify({ foo: 'woo' })
        }
      }
      createConfigury.__set__('fs', fsMock)

      configury.section('custom').set('foo', 'bar')
      configury.section('custom').merge('./extra.json')
      config = configury('custom')

      config.foo.should.eql('woo')
      configury.raw().custom.foo.should.eql('woo')
    })

    it('should overlay properties from objects on sections', function() {
      var configury = createConfigury()
      var config

      configury.section('custom').set('foo', 'bar')
      configury.section('custom').merge({ foo: 'woo' })

      config = configury('custom')
      config.foo.should.eql('woo')
      configury.raw().custom.foo.should.eql('woo')
    })
  })

  describe('#substitution', function() {
    it('should substitute pattern from existing property', function() {
      var configury = createConfigury()
      var config
      configury.set('foo', 'bar')
      configury.set('too', '%foo%/woo')
      config = configury()
      config.too.should.eql('bar/woo')
    })

    // This needs implementing
    it.skip('should substitute nested pattern from existing property', function() {
      var configury = createConfigury()
      var config
      configury.set('foo', { bar: 'hoo' })
      configury.set('too', '%foo.bar%/woo')
      config = configury()
      config.too.should.eql('hoo/woo')
    })
  })
})
