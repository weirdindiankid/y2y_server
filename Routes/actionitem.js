const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request-promise');
const ActionItemHelperFunctions = require("../HelperFunctions/ActionItemHelperFunctions")

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var action = ActionItemHelperFunctions["helperOne"];
var updateaction = ActionItemHelperFunctions["helperTwo"];
var updateactionstep = ActionItemHelperFunctions["helperThree"];

var access_token;
var instance_url;

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/actionitems/',function(req,res){


  //var id = req.params.id
  var id = req.data.user.id



  Salesforceauth(id).then(action).then(function(tokens){


   var action_id = tokens[0];
   instance_url = tokens[2];
   access_token = tokens[1];



   if(action_id["size"]!=0){
     // when size is not zero
    console.log(action_id)
    const option = {
          method: 'GET',
          uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+Id+,+Step_Number__c+,Action_Item__c+,+CompletedCB__c+from+Action_Item_Step__c+WHERE+"+action_id["url"],
          headers: {
            'Authorization': 'Bearer ' + access_token

          }
       };

       const response = (request(option, function(error, response,body){

           if (!error && response.statusCode == 200){

             var parsedData = JSON.parse(body);
             var totalSize = parsedData["totalSize"]

             console.log(parsedData);
             var i;

             for (i=0;i<totalSize;i++){


               var name = parsedData["records"][i]["Name"]
               var step = parsedData["records"][i]["Step_Number__c"]
               var id = parsedData["records"][i]["Id"]
               var bool = parsedData["records"][i]["CompletedCB__c"]


               action_id[parsedData["records"][i]["Action_Item__c"]][step]=name
               action_id[parsedData["records"][i]["Action_Item__c"]]["step_id"+step]=id
               action_id[parsedData["records"][i]["Action_Item__c"]]["completed"+step]=bool


               if(i == totalSize-1){res.send(action_id)}
             }




           }
           else{
              console.log("error")

           }







    }))
  }
      else {res.send({"size":"0"})} //when there are no task

       })



})

router.post('/actionitems/',function(req,res){

  id = req.body.actionid;
  comment = req.body.comment;
  var flag = req.body.flag;



  Salesforceauth(flag).then(updateaction).then(function(tokens){


    //console.log(tokens)

    instance_url = tokens[2];
    access_token = tokens[1];

    const option = {
        method: 'POST',
        uri: instance_url+"/services/data/v20.0/sobjects/Action_Item_Update__c/",  //action item
        headers: {
          'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'

        },
        body:JSON.stringify({

          "Name": "Android App action update",
  	       "Action_Item__c" : id,
  	        "Update__c" : comment


          })

        };

    try{
         const response =  request(option, function(error, response,body){



          if (!error && response.statusCode == 201){
           //no error
            var parsedData = JSON.parse(body);


            if (parsedData["success"]==true){
               res.send({"issucess": "Success"})

            }

             }

         });



         }
         catch(error){
           console.log("inside catch")
          console.log(error);
          Promise.reject(error);

        }







  })




})

router.post('/actionitemstep/',function(req,res){

  var id2 = req.body.actionid;
  var comment = req.body.comment;
  var size = req.body.size
  var promises =[];

  Salesforceauth("id").then(function(tokens){

    instance_url = tokens[2];
    access_token = tokens[1];

  for(i=0;i<size;i++){

   promises.push(updateactionstep(req.body.records[i]));
  }
  Promise.all(promises).then(async(function(x){


   //console.log(x)


    const option = {
        method: 'POST',
        uri: instance_url+"/services/data/v20.0/sobjects/Action_Item_Update__c/",  //action item
        headers: {
          'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'

        },
        body:JSON.stringify({

          "Name": "Android App action update",
  	       "Action_Item__c" : id2,
  	        "Update__c" : comment


          })

        };

    try{
         const response =  await(request(option, function(error, response,body){



          if (!error && response.statusCode == 201){
           //no error
            var parsedData = JSON.parse(body);


            if (parsedData["success"]==true){
               res.send({"issucess": "Success"})

            }

             }

         }));



         }
         catch(error){
           console.log("inside catch")
          console.log(error);
           res.send({"issucess": "Error"});

        }







  }))


})

})

module.exports = router
