
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
      method: 'POST',
      uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+id+,+Lottery_Date__c+,+Type__c+from+Lottery__c+WHERE+Lottery_Date__c="+date+"+AND+(Type__C='E-Bed'+OR+Type__C='Long Term')",
      headers: {
        'Authorization': 'Bearer ' + access_token

      }
   };
  try{
   const response =  await(request(option, function(error, response,body){

    if (!error && response.statusCode == 200){
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




       }
    else {

       console.log(error);
       Promise.reject(error);

     }


   }));

   return Promise.resolve([lottery_id,access_token,instance_url]);

   }
   catch(error){
     console.log("inside catch")
    console.log(error);
    //Promise.reject(error);

  }








})




}
