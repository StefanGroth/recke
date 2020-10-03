let assert = require('chai').assert
let expect = require('chai').expect
let OnReady = require('../onReady.js')
let OnMessage = require('../onMessage.js')
let Discord = require('discord.js')
let fs = require('fs')

describe('OnReady', () => {

  it('should fail if no config is given.', () => {
    assert.throws( () => OnReady('no-config.json', 'no-data.json'), 'ENOENT: no such file or directory, open \'no-config.json\'')
  })
  
  it('should fail if the config can not be parsed.', () => {
    assert.throws( () => OnReady('test/bad-data', 'no-data.json'), 'Unexpected token C in JSON at position 0')
  })

  it('should create empty recommendations if the data file can not be found', () => {

    const { recommendations } = OnReady('test/example-config.json', 'test/no-data.json')

    expect(recommendations.currentID).to.equal(0)
    expect(recommendations.values).to.deep.equal(new Discord.Collection())
    expect(recommendations.tags).to.deep.equal(new Set())

  })

  it('should create empty recommendations if the data file can not be parsed', () => {

    const { recommendations } = OnReady('test/example-config.json', 'test/bad-data')

    expect(recommendations.currentID).to.equal(0)
    expect(recommendations.values).to.deep.equal(new Discord.Collection())
    expect(recommendations.tags).to.deep.equal(new Set())

  })

  it('should read the entries given by the json in the config path', () => {

    const { config } = OnReady('test/example-config.json', 'test/example-data.json')

    expect(config.prefix).to.equal('!reck')
    expect(config.restrictedTo).to.have.keys('Admin', 'OtherRole')
    
  })

  it('should read the entries given by the json in the data path', () => {

    const { recommendations } = OnReady('test/example-config.json', 'test/example-data.json')

    expect(recommendations.currentID).to.equal(3)
    expect(recommendations.values).to.have.lengthOf(3)
    expect(recommendations.values).to.have.keys([0, 1, 2])
    expect(recommendations.values.get(0)).to.deep.equal({ recommendation : '0', tags : ['0'] })
    expect(recommendations.values.get(1)).to.deep.equal({ recommendation : '1', tags : ['1'] })
    expect(recommendations.values.get(2)).to.deep.equal({ recommendation : '2', tags : ['2'] })
    expect(recommendations.tags).to.deep.equal(new Set(['0', '1', '2']))
    
  })
  
})


describe('OnMessage', () => {

  const configPath = 'test/new-config.json'
  const dataPath = 'test/new-data.json'

  function getConfig(path = configPath) {
    const { prefix, restrictedTo} = JSON.parse(fs.readFileSync(path))
    return {
      prefix,
      restrictedTo : new Set(restrictedTo)
    }
  }

  function getData(path = dataPath) {
    const result = JSON.parse(fs.readFileSync(path))
    return {
      currentID : result.currentID,
      values : new Discord.Collection(result.values),
      tags: new Set(result.tags)
    }
  }

  function mockMessage(msg, admin = true, role = 'Nobody') {

    class Channel {
      constructor() {
        this.guild = null
      }

      send(...params) {
        console.log()
      }

    }

    class Member {
      constructor(admin, role) {
        this.admin = admin
        this.roles = [role]
      }

      hasPermission(arg) {
        return this.admin
      }
    }

    class Message {

      constructor(msg, admin, role) {
        this.content = msg
        this.member = new Member(admin, { name : role })
        this.channel = new Channel()
      }

      reply(...params) {
        console.log()
      }

    }

    return new Message(msg, admin, role)

  }

  function filesAsBefore(onReadyResult) {
    const onFileConfig = getConfig('test/example-config.json')
    expect(onFileConfig).to.deep.equal(onReadyResult.config)
    
    const onFileData = getData('test/example-data.json')
    expect(onFileData).to.deep.equal(onReadyResult.recommendations)
  }

  it('should ignore messages without the correct prefix', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')

    OnMessage(
      mockMessage(' add [ new-tag , another-new-tag ] new-rec '), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    filesAsBefore(read)

  })

  it('should not allow users without priviliges to use the bot', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')

    OnMessage(
      mockMessage(read.config.prefix + ' add [ new-tag , another-new-tag ] new-rec ', false), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    filesAsBefore(read)

  })

  it('should allow users to use the bot if they have a role specified in the restrictions', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')

    let result = 
      OnMessage(
        mockMessage(read.config.prefix + ' add [ new-tag , another-new-tag ] new-rec ', false, 'OtherRole'), read.config, read.recommendations, configPath, dataPath)

    const onFileData = getData('test/example-data.json')
    expect(onFileData).to.not.deep.equal(result.recommendations)
    
  })


  it('should correctly add and store recommendations & tags with command add', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { recommendations } = OnMessage(mockMessage(read.config.prefix + ' add [ new-tag , another-new-tag ] new-rec '), read.config, read.recommendations, configPath, dataPath)

    expect(recommendations.currentID).equal(4)
    expect(recommendations.values).to.deep.include.keys(3)
    expect(recommendations.tags).to.deep.include.keys('new-tag')
    expect(recommendations.tags).to.deep.include.keys('another-new-tag')
    expect(recommendations.values.get(3).tags).to.deep.equal(['new-tag', 'another-new-tag'])
    expect(recommendations.values.get(3).recommendation).to.equal('new-rec')

    recommendations = OnMessage(mockMessage(read.config.prefix + 'add[new-tag2,another-new-tag2]new-rec'), read.config, read.recommendations, configPath, dataPath).recommendations

    expect(recommendations.currentID).equal(5)
    expect(recommendations.values).to.deep.include.keys(4)
    expect(recommendations.tags).to.deep.include.keys('new-tag2')
    expect(recommendations.tags).to.deep.include.keys('another-new-tag2')
    expect(recommendations.values.get(4).tags).to.deep.equal(['new-tag2', 'another-new-tag2'])
    expect(recommendations.values.get(4).recommendation).to.equal('new-rec')

    const onFileData = getData()

    expect(onFileData).to.deep.equal(recommendations)

  })

  it('should correctly change and store recommendations & tags with command change', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')

    let { recommendations } = OnMessage(mockMessage(read.config.prefix + ' change 1 [ tag ] new-rec '), read.config, read.recommendations, configPath, dataPath)

    expect(recommendations.currentID).equal(3)
    
    expect(recommendations.tags).to.deep.include.keys('tag')
    expect(recommendations.tags).to.not.deep.include.keys('1')
    
    expect(recommendations.values.get(1).tags).to.deep.equal(['tag'])
    expect(recommendations.values.get(1).recommendation).to.equal('new-rec')

    recommendations = OnMessage(mockMessage(read.config.prefix + 'change2[tag]new-rec'), read.config, read.recommendations, configPath, dataPath).recommendations

    expect(recommendations.currentID).equal(3)
    
    expect(recommendations.tags).to.deep.include.keys('tag')
    expect(recommendations.tags).to.not.deep.include.keys('2')
    
    expect(recommendations.values.get(2).tags).to.deep.equal(['tag'])
    expect(recommendations.values.get(2).recommendation).to.equal('new-rec')
    
    const onFileData = getData()
    
    expect(onFileData).to.deep.equal(recommendations)

  })

  it('should should gracefully fail if there is an attempt to change an ID that did not exist before', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + 'change 42 [tag] new-rec'), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

    filesAsBefore(read)

  })

  it('should correctly remove recommendations & tags with command remove', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { recommendations } = OnMessage(mockMessage(read.config.prefix + ' remove 2'), read.config, read.recommendations, configPath, dataPath)

    expect(recommendations).to.not.deep.have.keys(2)

    recommendations = OnMessage(mockMessage(read.config.prefix + ' remove1'), read.config, read.recommendations, configPath, dataPath).recommendations

    expect(recommendations).to.not.deep.have.keys(1)

    const onFileData = getData()
    expect(onFileData).to.deep.equal(recommendations)

  })

  it('should gracefully fail if there is an attempt to remove an ID that did not exist before', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + 'remove 42'), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

    filesAsBefore(read)

  })

  it('should correctly add roles with command role add', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config } = OnMessage(mockMessage(read.config.prefix + ' role add NewRole'), read.config, read.recommendations, configPath, dataPath)

    expect(config.restrictedTo).to.have.keys('Admin','NewRole','OtherRole')

    config = OnMessage(mockMessage(read.config.prefix + 'roleaddAnotherNewRole'), read.config, read.recommendations, configPath, dataPath).config

    expect(config.restrictedTo).to.have.keys('Admin','AnotherNewRole','NewRole','OtherRole')

    const onFileConfig = getConfig()
    expect(onFileConfig).to.deep.equal(config)

  })

  it('should correctly remove roles with command role remove', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config } = OnMessage(mockMessage(read.config.prefix + ' role remove Admin'), read.config, read.recommendations, configPath, dataPath)

    expect(config.restrictedTo).to.not.have.keys('Admin')

    config = OnMessage(mockMessage(read.config.prefix + 'roleremoveOtherRole'), read.config, read.recommendations, configPath, dataPath).config

    expect(config.restrictedTo).to.not.have.keys('Admin', 'OtherRole')

    const onFileConfig = getConfig()
    expect(onFileConfig).to.deep.equal(config)

  })

  it('should gracefully fail if there is an attempt to remove a Role that did not exist before', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + ' role remove NonExitant'), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

    filesAsBefore(read)

  })

  it('should allow requesting help', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + 'help'), read.config, read.recommendations, configPath, dataPath)
    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

  })

  it('should allow listing all tags', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + 'list'), read.config, read.recommendations, configPath, dataPath)
    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

  })


  it('should allow listing all roles that are allowed to use this bot', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + 'role list'), read.config, read.recommendations, configPath, dataPath)
    expect(read.config).to.be.deep.equal(config)
    expect(read.recommendations).to.be.deep.equal(recommendations)

  })

  it('should gracefully fail with false command', () => {

    const read = OnReady('test/example-config.json', 'test/example-data.json')
    
    let { config, recommendations } = OnMessage(mockMessage(read.config.prefix + ' no-command'), read.config, read.recommendations, 'test/example-config.json', 'test/example-data.json')

    expect(read.config).to.deep.equal(config)
    expect(read.recommendations).to.deep.equal(recommendations)

    filesAsBefore(read)

  })


})
