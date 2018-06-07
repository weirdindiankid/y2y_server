//salesforce doesn't have continous connection system. Hence need to do rest call everytime

var async = require('asyncawait/async');
//var authjson = require('../auth/auth') || null;
var authjson = null // for github auth file is hidden
var await = require('asyncawait/await');
const request = require('request-promise');

var access_token;
var instance_url;


var auth = async (function(id){



  const option = {
        method: 'POSTs',
        uri: `https://test.salesforce.com/services/oauth2/token`,
        qs: {
          grant_type: "password",
  				client_id:   process.env.clientId || authjson.clientId ,
  				client_secret: process.env.clientSecret || authjson.clientSecret ,
  				username: process.env.myusername || authjson.myusername ,
          password: process.env.mypassword || authjson.mypassword

        }
     };

     return request(option)
     .then(function(body){

       //no error
        var parsedData = JSON.parse(body);
        access_token = parsedData["access_token"];
        instance_url = parsedData["instance_url"];

        return ([id,access_token,instance_url]);


     })
     .catch(function(error){
       return Promise.reject(error);
     })

});

module.exports = auth;
