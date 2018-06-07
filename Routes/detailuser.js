const express = require('express');
var asyncc = require('async');
const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request');
var BedIdHelperFunctions =  require("../HelperFunctions/GetBedId");

var eventHelperFunctions =  require("../HelperFunctions/EventHelpers"); //borrowing a helper
var changeDateFormat = eventHelperFunctions["helperOne"]; // borrowing this helper function from event

var getbedid = BedIdHelperFunctions["helperOne"];

var access_token;
var instance_url;
var emptyjsonobject = {};   //{size:  ,records:[{"name": ,"startTime": ,"endTime": , "date"}] }


//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());


router.get('/detailuser/',function(req,res){



   //var id = req.params.id

   var id = req.data.user.id
   var suspensionCount = 0  //salesforce's contact has no count of suspension like it does for major and minor warning counts .so suspension is counted manually



   // get auth then get user's bed id then get bed name + some more details.
   // 1 st call: need auth to talk with salesforce. salesforce keeps on changing this so to make sure, i have token to do firstcall
   //2nd call: to get ith bedname have to know ith bed id first.
   //3: bunch of parallel calls. one of them is to get a bed name

  Salesforceauth(id).then(getbedid).then(function(tokens){

        //requets and handle for long last day, locker and nits

        var consequence=[];


         var bedid = tokens[0]
         instance_url = tokens[2];
         access_token = tokens[1];


        const option = {
              method: 'GET',
              uri: instance_url+"/services/data/v20.0/sobjects/Contact/"+id,
              headers: {
                'Authorization': 'Bearer ' + access_token

              }
           };




        // bed id
        const option2 = {
              method: 'GET',
              uri: instance_url+"/services/data/v20.0/sobjects/Bed__c/"+bedid,
              headers: {
                'Authorization': 'Bearer ' + access_token

              }
           };


          const option3 = {

            method: 'GET',
            uri: instance_url+"/services/data/v20.0/query/?q=SELECT+id+,+Type__c+,+Guest__c+,+Suspension_Start_Date__c+,+Suspension_End_Date__c+,+Description__c+,+CreatedDate+,+Delivery_Status__c+from+Consequence__c+WHERE+Guest__c='"+id+"'+AND+Delivery_Status__c='Active'+AND+(Type__c='Minor Warning'+OR+Type__c='Major Warning'+OR+Type__c='Suspension')",
            headers: {
              'Authorization': 'Bearer ' + access_token

            }

          };


        //we have two independent requests so we are calling two parallel requests

      if (bedid != 0){
        asyncc.parallel({
               one: function(parallelCallback){

                 const response = (request(option, function(error, response,body){

                     if (!error && response.statusCode == 200){
                      //no error
                       var parsedData = JSON.parse(body);
                       Nit = parsedData["NIT__c"];
                       Major_warning = parsedData["Major_Warnings__c"];
                       Minor_warning = parsedData["Minor_Warnings__c"];
                       Locker = parsedData["Locker_Combination__c"];
                       Last_Day_Of_Stay = parsedData["Last_Night_Long_Term_Stay__c"];

                       if (Locker == null){ Locker="Not Assigned"};
                       if (Last_Day_Of_Stay==null){Last_Day_Of_Stay = "N/A"}

                       parallelCallback(null,{err: error, res: response, body: body});


                        }
                     else {

                          res.status(400).send("error")
                      }

                    }));


               }, // one

               two: function(parallelCallback){

                 const response = (request(option2, function(error, response,body){

                     if (!error && response.statusCode == 200){
                      //no error
                       var parsedData = JSON.parse(body);
                       bed_name = parsedData["Name"]

                       parallelCallback(null, {err: error, res: response, body: body});


                        }
                     else {
                          res.status(400).send("error");
                      }

                    }));


               },// two

               three: function(parallelCallback){

                 const response = (request(option3, function(error, response,body){

                     if (!error && response.statusCode == 200){
                      //no error
                       var parsedData = JSON.parse(body);
                      console.log(parsedData)
                      totalSize_Consequence = parsedData["totalSize"]

                     if (totalSize_Consequence == 0){

                           consequence = []

                     }
                     else{ // there are some

                             for(i=0;i<totalSize_Consequence;i++){

                               emptyjsonobject = {}

                               emptyjsonobject["warningDescription"] = parsedData["records"][i]["Description__c"]
                               emptyjsonobject["warningDate"] = changeDateFormat(parsedData["records"][i]["CreatedDate"])
                               emptyjsonobject["warningType"] = parsedData["records"][i]["Type__c"]
                              if(parsedData["records"][i]["Type__c"] == "Suspension"){
                                suspensionCount = suspensionCount+1

                              }


                               emptyjsonobject["suspensionStartDate"] = parsedData["records"][i]["Suspension_Start_Date__c"]
                               emptyjsonobject["suspensionEndDate"] = parsedData["records"][i]["Suspension_End_Date__c"]

                               consequence.push(emptyjsonobject)



                             }

                     }

                       parallelCallback(null, {err: error, res: response, body: body});


                        }
                     else {
                          res.status(400).send("error")
                      }

                    }));


               }


           }, function(err,results){ // parallel all final callback





             res.status(200).send({

                "Major_warning":Major_warning,
                "Minor_warning" :Minor_warning,
                "Locker":Locker,
                "Suspension_warning": suspensionCount,
                "Warnings" : consequence,
                "Last_Day_Of_Stay":Last_Day_Of_Stay,
                "Bed_name":bed_name,
                "NIT":Nit



             })





           });

         } //
         else {

           asyncc.parallel({
              one: function(parallelCallback){

                request(option, function(error, response,body){

                    if (!error && response.statusCode == 200){
                     //no error
                      var parsedData = JSON.parse(body);
                      Nit = parsedData["NIT__c"];
                      Major_warning = parsedData["Major_Warnings__c"];
                      Minor_warning = parsedData["Minor_Warnings__c"];
                      Locker = parsedData["Locker_Combination__c"];
                      Last_Day_Of_Stay = parsedData["Last_Night_Long_Term_Stay__c"];

                      if (Locker == null){ Locker="Not Assigned"};
                      if (Last_Day_Of_Stay==null){Last_Day_Of_Stay = "N/A"}


                      parallelCallback(null, {err: error, res: response, body: body});






                       }
                    else {
                        res.status(400).send("error");
                     }

               });
             }, // one over
             two: function(parallelCallback){

               const response = (request(option3, function(error, response,body){

                   if (!error && response.statusCode == 200){
                    //no error
                     var parsedData = JSON.parse(body);
                     console.log(parsedData)
                     totalSize_Consequence = parsedData["totalSize"]

                    if (totalSize_Consequence == 0){

                          consequence = []

                    }
                    else{ // there are some

                            for(i=0;i<totalSize_Consequence;i++){

                              emptyjsonobject = {}

                              emptyjsonobject["warningDescription"] = parsedData["records"][i]["Description__c"]
                              emptyjsonobject["warningDate"] = changeDateFormat(parsedData["records"][i]["CreatedDate"])
                              emptyjsonobject["warningType"] = parsedData["records"][i]["Type__c"]
                              if(parsedData["records"][i]["Type__c"] == "Suspension"){
                                suspensionCount = suspensionCount+1

                              }

                              emptyjsonobject["suspensionStartDate"] = parsedData["records"][i]["Suspension_Start_Date__c"]
                              emptyjsonobject["suspensionEndDate"] = parsedData["records"][i]["Suspension_End_Date__c"]

                              consequence.push(emptyjsonobject)










                            }

                    }



                     parallelCallback(null, {err: error, res: response, body: body});


                      }
                   else {
                        res.status(400).send("error");
                    }

                  }));


             }



           }, function(err,results){

             res.status(200).send({

                "Major_warning":Major_warning,
                "Minor_warning" :Minor_warning,
                "Locker":Locker,
                "Warnings" : consequence,
                "Suspension_warning": suspensionCount,
                "Last_Day_Of_Stay":Last_Day_Of_Stay,
                "Bed_name":"Not Assigned",
                "NIT":Nit



             })


           })





         }





   })
   .catch(function(error){


      console.log(error)

      res.status(500).send("error");
   });



});


module.exports = router
