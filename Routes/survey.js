const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request');

var access_token;
var instance_url;

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/edituser',function(req,res){



   var rating = req.body.rating;
   var comment = req.body.comment;
   var id = req.data.user.id;  //from the header jwt

   id = id.slice(0,-3)






    Salesforceauth("salt").then(function(tokens){  // so if token has expires we can have new token else same token would be given


    instance_url = tokens[2];
    access_token = tokens[1];

    const option = {
            method: 'POST',
            uri: instance_url+'/services/data/v20.0/sobjects/Survey__C', //creating new survey object
            headers: {
              'Authorization': 'Bearer ' + access_token,
              'Content-Type': 'application/json'

            },
            body:JSON.stringify({

                      "Name"       : "Android_app_survey",
                      "CM_First_Name_and_Last_Initial__c"  : "RM",
                      "RecordType" :{

                      	"Name": "Guest App"

                      },
                       "Guest__c"   : id,   //from id removing 4 last character
                       "Comments_on_Daily_Rating__c":comment,
                       "Daily_Guest_Rating__c":rating

              })

            };

            request(option, function(error, response,body){



                    if (response.statusCode == 201){  //201 means created
                      //no error
                      res.status(201).send({"isSucess":"success"})


                    }

                    else {
                      res.status(400).send("error")
                    }

                  });

    });

});

router.post('/feedback',function(req,res){



   var comment = req.body.comment;
   var id = req.data.user.id

   id = id.slice(0,-3)

   console.log(id);




    Salesforceauth("salt").then(function(tokens){  // so if token has expires we can have new token else same token would be given

      instance_url = tokens[2];
      access_token = tokens[1];


    const option = {
            method: 'POST',
            uri: instance_url+'/services/data/v20.0/sobjects/Survey__C', // SOQL salesforce query for username
            headers: {
              'Authorization': 'Bearer ' + access_token,
              'Content-Type': 'application/json'

            },
            body:JSON.stringify({

                      "Name"       : "Android_app_feedback",
                      "CM_First_Name_and_Last_Initial__c"  : "RM",
                      "RecordType" :{

                      	"Name": "Guest App"

                      },
                       "Guest__c"   : id,   //from id removing 4 last character
                       "Comments_about_Y2Y__c":comment


              })

            };

            request(option, function(error, response,body){



                    if (response.statusCode == 201){  //201 means created
                      //no error
                      res.status(201).send("sucess")


                    }

                    else {
                      res.status(400).send("error")
                    }

                  });

    });

});


module.exports = router
