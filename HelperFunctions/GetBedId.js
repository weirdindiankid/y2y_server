var async = require('asyncawait/async');
var await = require('asyncawait/await');
const request = require('request-promise');
var bed_id;


module.exports = {

"helperOne" : async(function(tokens){

    //req and res error amd also check if

    var d = new Date();

    var year = d.getFullYear();
    var month = (d.getMonth()+1);
    var dt = d.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }



    var date = year+"-"+month+"-"+dt

    //console.log(date)


    instance_url = tokens[2];
    access_token = tokens[1];
    x = tokens[0];


   //DATE()


     const option = {
         method: 'GET',
         uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Bed__c+,+Guest__c+,+Bed_Assignment_Date__c+,+Long_Term_BA__c+from+Bed_Assignment__c+WHERE+Guest__c='"+x+"'+and+Bed_Assignment_Date__c="+date,
         headers: {
           'Authorization': 'Bearer ' + access_token

         },
         timeout: 7000 // 7 seconds second timeout
      };
      return request(option)
      .then(function(body){

        //no error
         var parsedData = JSON.parse(body);

         if (parsedData["totalSize"] != 0){

            bed_id = parsedData["records"][0]["Bed__c"];

        }else { bed_id = 0}

          return ([bed_id,access_token,instance_url]);

      })
      .catch(function(err){
             console.log("here")
             return Promise.reject()
      })


})




}
