var async = require('asyncawait/async');
var await = require('asyncawait/await');
const request = require('request-promise');
var access_token;
var instance_url;

module.exports = {

  "helperOne" : async(function(tokens){
        // to get events 
    instance_url = tokens[1];
    access_token = tokens[0];


    const option = {
      method: 'Get',
      uri : instance_url+'/services/data/v20.0/query/?q=SELECT+Subject+,+id+,+Description+,+StartDateTime+,+EndDateTime+,+IsAllDayEvent+,+Location+from+Event',
      headers: {
        'Authorization': 'Bearer ' + access_token

      }

    };


  }//end of helperone



}
