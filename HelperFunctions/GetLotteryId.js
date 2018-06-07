
var async = require('asyncawait/async');
var await = require('asyncawait/await');
const request = require('request-promise');
var lottery_id;

module.exports = {

"helperOne" : async(function(tokens){

  //DATE()

 var lottery_id = {}  //lottery object


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

   instance_url = tokens[2];
   access_token = tokens[1];
   x = tokens[0];



  const option = {
      method: 'GET',
      uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+id+,+Lottery_Date__c+,+Type__c+from+Lottery__c+WHERE+Lottery_Date__c="+date+"+AND+(Type__C='E-Bed'+OR+Type__C='Long Term')",
      headers: {
        'Authorization': 'Bearer ' + access_token

      },
      timeout: 4000 // 4 second second timeout
   };
   return request(option)
   .then(function(body){
     // needs to be status 200 or have no error
     //no error
      var parsedData = JSON.parse(body);


      //bed_id = parsedData["records"][0]["Bed__c"];
    if (parsedData["totalSize"]==0){

          lottery_id["size"] = 0;

      }else{  //assuming both lottery id are opened at the same time. (opened !=

           if (parsedData["records"][0]["Type__c"]=="Long Term"){



             lottery_id["size"]=2;
             lottery_id["Long Term"]=parsedData["records"][0]["Id"];
             lottery_id["E-bed"]=parsedData["records"][1]["Id"];




           }
           else{

             lottery_id["size"]=2;
             lottery_id["Long Term"]=parsedData["records"][1]["Id"];
             lottery_id["E-bed"]=parsedData["records"][0]["Id"];


           }




      }

    return ([lottery_id,access_token,instance_url]);

   })
   .catch(function(err){
          console.log("timeout check")
          return Promise.reject()
   })







})




}
