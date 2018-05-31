//salesforce doesn't have continous connection system. Hence need to do rest call everytime

var async = require('asyncawait/async');
//var authjson = require('../auth/auth') || null;
var authjson = null // for github
var await = require('asyncawait/await');
const request = require('request-promise');

var access_token;
var instance_url;


var auth = async (function(id){



  const option = {
        method: 'POST',
        uri: `https://test.salesforce.com/services/oauth2/token`,
        qs: {
          grant_type: "password",
  				client_id:   process.env.clientId || authjson.clientId ,
  				client_secret: process.env.clientSecret || authjson.clientSecret ,
  				username: process.env.myusername || authjson.myusername ,
          password: process.env.mypassword || authjson.mypassword

        }
     };
    try{
     const response = await (request(option, function(error, response,body){

      if (!error && response.statusCode == 200){
       //no error
        var parsedData = JSON.parse(body);
        access_token = parsedData["access_token"];
        instance_url = parsedData["instance_url"]


         }
      else {
         console.log("error");
         //send some http status error to android later
       }


     }));

     console.log(access_token)
     return Promise.resolve([id,access_token,instance_url]);

     }
    catch(error){
      console.log(error);
      Promise.reject(error);

    }




});

module.exports = auth;
