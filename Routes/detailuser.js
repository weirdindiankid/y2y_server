const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request-promise');
var BedIdHelperFunctions =  require("../HelperFunctions/GetBedId");

var getbedid = BedIdHelperFunctions["helperOne"];

var access_token;
var instance_url;
var responsejson = {};   //{size:  ,records:[{"name": ,"startTime": ,"endTime": , "date"}] }

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());


router.get('/detailuser/',function(req,res){



   //var id = req.params.id

   var id = req.data.user.id



   // get auth then get user's bed id then get bed name + some more details.
   // 1 st call: need auth to talk with salesforce. salesforce keeps on changing this so to make sure, i have token to do firstcall
   //2nd call: to get ith bedname have to know ith bed id first.
   //3: bunch of parallel calls. one of them is to get a bed name

  Salesforceauth(id).then(getbedid).then(function(tokens){

        //requets and handle for long last day, locker and nits




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
                        console.log("error");
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
                        console.log("error");
                      }

                    }));


               }




           }, function(err,results){ // parallel all final callback





             res.send({

                "Major_warning":Major_warning,
                "Minor_warning" :Minor_warning,
                "Locker":Locker,
                "Last_Day_Of_Stay":Last_Day_Of_Stay,
                "Bed_name":bed_name,
                "NIT":Nit



             })





           });

         } //
         else {


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

                 res.send({

                    "Major_warning":Major_warning,
                    "Minor_warning" :Minor_warning,
                    "Locker":Locker,
                    "Last_Day_Of_Stay":Last_Day_Of_Stay,
                    "Bed_name":"Not Assigned",
                    "NIT":Nit



                 })




                  }
               else {
                  console.log("error");
                }

              });




         }





   })



});


module.exports = router
