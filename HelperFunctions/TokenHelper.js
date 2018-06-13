var async = require('asyncawait/async');
var await = require('asyncawait/await');
const request = require('request-promise');
var access_token;
var instance_url;

module.exports = {

  "helperOne" : async(function(tokens){

    id = tokens[0];
    instance_url = tokens[2];
    access_token = tokens[1];
    counter = tokens[3]+1;


    const option = {
      method: 'PATCH',
      uri: instance_url+"/services/data/v20.0/sobjects/"+id,
      headers: {
        'Authorization': 'Bearer ' + access_token

      },
      body:JSON.stringify({

        "PasswordResetRequestedCounter__c" : counter


        }),
        timeout: 7000 // 7 seconds second timeout

    }

    return request(option)
    .then(function(body){

      return("sucess")


    })


  }



}
