function generate(path) {

  const config = {
    prefix : "!reck",
    restrictedTo : new Set()
  }
  
  const addJson = JSON.stringify({ prefix : config.prefix, restrictedTo : [...config.restrictedTo] }, null, 1)
  fs.writeFileSync(path, addJson)

}

module.exports = generate;