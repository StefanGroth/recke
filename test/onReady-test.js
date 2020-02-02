const expect = require('chai').expect
const assert = require('chai').assert

const OnReady = require('../onReady')

describe('OnReady', () => {

  it('should fail if no config is given.', () => {
    assert.throws( () => OnReady('no-config.json', 'no-data.json'), 'ENOENT: no such file or directory, open \'no-config.json\'')
  })
  
  it('should fail if the config can not be parsed.', () => {
    assert.throws( () => OnReady('test/bad-data', 'no-data.json'), 'Unexpected token C in JSON at position 0')
  })

  it('should fail if the data file can not be found', () => {
    assert.throws( () => OnReady('test/example-config.json', 'test/no-data.json' ), `ENOENT: no such file or directory, open 'test/no-data.json'`)
  })

  it('should create empty recommendations if the data file can not be parsed', () => {
    assert.throws( () => OnReady('test/example-config.json', 'test/bad-data' ), `Unexpected token C in JSON at position 0`)
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