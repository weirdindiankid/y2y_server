const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
var eventHelperFunctions =  require("../HelperFunctions/EventHelpers");

var changeDateFormat = eventHelperFunctions["helperOne"];
var addUser = eventHelperFunctions["helperThree"];
var RemoveUser = eventHelperFunctions["helperFour"]

var await = require('asyncawait/await');

const request = require('request-promise');
var waterfall = require('async-waterfall');
// add async and await and response
var access_token;
var instance_url;
var responsejson = {};   //{size:  ,records:[{"name": ,"startTime": ,"endTime": , "date"}] }

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/events',function(req,res,next){

   Salesforceauth("salt").then(function(tokens){
     // tokens was passed by Salesforceauth function. It is an array of [id,instance_url,access_token]
     instance_url = tokens[2];
     access_token = tokens[1];

     // get user's id from the header. This is is mac'd by jwt
     var id = req.data.user.id
     var name = req.data.user.name
     //get all events and description
     //see if id is in the description of the event. if yes send true boolean meaning rsvp'd
     //else send false boolean meaning not rsvp.


     const option = {
       method: 'Get',
       uri : instance_url+'/services/data/v20.0/query/?q=SELECT+Subject+,+id+,+Description+,+StartDateTime+,+EndDateTime+,+IsAllDayEvent+,+Location+from+Event',
       headers: {
         'Authorization': 'Bearer ' + access_token

       }

     }; // option close

      try{
       request(option, function(error, response,body){



          if(!error && response.statusCode == 200){



                    var parsedData = JSON.parse(body);

                    if (parsedData["totalSize"] == 0){

                       // send json with zero size
                       res.status(200).send({"size":0,
                                              "records":[]})
                    }
                    else{

                      responsejson["records"] = []



                    //iterate all events and create
                    //console.log(parsedData)
                    var records = parsedData["records"]
                    var totalevents = 0



                    for(i=0;i<records.length;i++){
                      // removing old events
                      if (Date.now() - Date.parse(records[i]["EndDateTime"].slice(0,-5)) < 0){
                          totalevents++
                          var emptyjobject = {}

                          emptyjobject["eventName"] = records[i]["Subject"]
                          emptyjobject["ID"] = records[i]["Id"]
                          emptyjobject["isAllDay"] = records[i]["IsAllDayEvent"]

                          emptyjobject["startTime"] =  changeDateFormat(records[i]["StartDateTime"])
                          emptyjobject["EndTime"] =  changeDateFormat(records[i]["EndDateTime"])
                          emptyjobject["Location"] = records[i]["Location"]


                          var description = records[i]["Description"]

                          //assuming description will always have the json


                          //var descriptionjson = JSON.parse(description)
                          if (description === null){
                              emptyjobject["isRsvp'd"] = false
                          }else {

                            var users = description.split(",")

                            //emptyjobject["Description"] = descriptionjson["Description"]



                            //check if user array obtained is empty or undefined
                            if (users === undefined || users.length == 0) {

                              emptyjobject["isRsvp'd"] = false
                              }
                            else{
                               //users array is present
                              var a = users
                              var b = name+":"+id

                              //a = JSON.stringify(a);
                            //  b = JSON.stringify(b);


                              //console.log(a)
                              //console.log(b)

                              var c = a.indexOf(b);

                              if(c != -1){// user is present inside the array
                                  emptyjobject["isRsvp'd"] = true

                              }else{emptyjobject["isRsvp'd"] = false }

                            }


                          }







                      //console.log(emptyjobject)


                      responsejson["records"].push(emptyjobject)
                    }


                      if(i==records.length-1){
                      responsejson["size"] = totalevents

                      res.status(200).send(responsejson)
                  }


                  }





                  }


          }else{
            console.log(error)
            res.status(400).send({"isError":"true"})
          }

       });


     }catch(error){
           res.status(400).send({"isError":"true"})
     }

     //console.log('hello inside the event'+id);





    //res.status(200).send({"Hello":"Hello"})





   });




});

router.post('/events',function(req,res){

  Salesforceauth("salt").then(function(tokens){
  // tokens was passed by Salesforceauth function. It is an array of [id,instance_url,access_token]
  instance_url = tokens[2];
  access_token = tokens[1];

  // get user's id from the header. This is is mac'd by jwt
  var id = req.data.user.id
  var name = req.data.user.name
  var eventId = req.body.eventId
  var eventFlag = req.body.flag
  var description
  var userobject = name+":"+id

  //there would be three synchrous calls so using async waterfall
   waterfall([function(callback){


     const option = {
       method: 'Get',
       uri : instance_url+"/services/data/v20.0/query/?q=SELECT+Subject+,+id+,+Description+from+Event+WHERE+id='"+eventId+"'",
       headers: {
         'Authorization': 'Bearer ' + access_token

       }

     };

     try{
      request(option, function(error, response,body){



         if(!error && response.statusCode == 200){



                   var parsedData = JSON.parse(body);

                   if (parsedData["totalSize"] == 0) {res.status(400).send({"isError":"true"})}
                   else {

                       description=parsedData[ "records"][0]["Description"]


                       callback(null, description);

                   }





          }//end of if
          else{res.status(400).send({"isError":"true"})}

       })//end of the request

     }//end of the try
     catch(error){
       res.status(400).send({"isError":"true"})
     }








   },function(description, callback){
      // console.log(arg1)

   try{
     if (eventFlag == "addUser"){

        var desc = addUser(description,userobject)

        callback(null,desc);

      }
      else if (eventFlag == "removeUser"){

        var desc = RemoveUser(description,userobject)
        callback(null,desc);
      }


   }
 catch(error){res.status(400).send({"isError":"true"})}



    }],function(err,result){
         // callback after all the calls are done

         console.log(result)

         const option2 = {
           method: 'PATCH',
           uri : instance_url+"/services/data/v20.0/sobjects/Event/"+eventId,
           headers: {
             'Authorization': 'Bearer ' + access_token,
               'Content-Type': 'application/json'

           },
           body:JSON.stringify({

             "Description" : result


             })


         };

         try{
            request(option2, function(error, response,body){


              if (response.statusCode == 204){ res.send("Sucess")}
              else{res.status(400).send({"isError":"true"})}
            })
         }
         catch(error){
           res.status(400).send({"isError2":"true"})
         }







    })



})




})





module.exports = router
