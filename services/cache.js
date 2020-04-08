const redis = require('redis')
const redisClient = redis.createClient()

//Incase any error pops up, log it
redisClient.on("error", function(err) {
  console.log("Error " + err);
})

module.exports = redisClient
