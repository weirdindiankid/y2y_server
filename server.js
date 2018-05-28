var app = require('express')();

var http =require('http').Server(app);



const bodyParser = require('body-parser');

const request = require('request-promise');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var asyncc = require('async');

var _ = require('underscore');

const jwt = require('jsonwebtoken')

var jwtverify = require("./auth/jwtverify")

var Salesforceauth = require("./Salesforce/salesforceauth")

var Eventrouter = require("./Routes/Event");

var SurveyRouter = require("./Routes/survey");

var detailuserRouter = require("./Routes/detailuser");

var lotteryRouter = require("./Routes/lottery");

var actionRouter = require("./Routes/actionitem");

var access_token="random";

var authjson = process.env || require('./auth/auth');

var jwtsecret = authjson.jwtsecret;

var instance_url;

var temp_client_id;

var id;

var bed_id;

var isLoggedIn = false;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());





// if credentials are valid then give them the token
app.post('/login',function(req,res){    //added name soos********* check

     // get token and instance_url to talk with salesforce

   Salesforceauth("salt").then(function(tokens){   //asnychorous




   instance_url = tokens[2];
   access_token = tokens[1]

    // get username and password from the users
    //console.log("hello from an android");

    var username = req.body.username;
    var password = req.body.password;

    //console.log(username);

    //another request
    //use SoQl to search all contacts and see if any of username__c and password__c matches
    const option = {
            method: 'GET',
            uri: instance_url+"/services/data/v20.0/query/?q=SELECT+username__c+,+password__c+,+id+,+Name+from+Contact+WHERE+username__c='"+username+"'", // SOQL salesforce query for username
            headers: {
              'Authorization': 'Bearer ' + access_token

            }

            };
    request(option, function(error, response,body){

            if (!error && response.statusCode == 200){
              //no error
              var parsedData = JSON.parse(body);

              //check if parsedData AKA response from salesforce is empty??

              //if not  empty
             if (!isEmptyObject(parsedData)) {
                // user exits
                // now obtain password for that user (I created field called password for every contact)
                console.log(parsedData['records'][0]);
                obtained_password = parsedData['records'][0]['Password__c'];
                obtained_id = parsedData['records'][0]['Id'];
                obtained_name = parsedData['records'][0]['Name'];





                 if (obtained_password == password){
                   //password matches
                   //console.log(`Client ${temp_client_id.io} has successful logged in`);
                   console.log("you have logged in")

                   isLoggedIn = true;
                   //res.send('valid');  // send the json



                   const user = {
                     "id":obtained_id,
                     "name" : obtained_name,
                     "name" : obtained_name
                   }

                   jwt.sign({user},jwtsecret, (err,token) => {

                      res.json({token: token,
                            "isValid":"valid",
                             "name" : obtained_name,
                             "id":obtained_id,
                               })

                   });



                 }


                 else{
                   //doesn't match password
                   //res.send('invalid');
                   res.send({

                      "isValid":"invalid"

                   })


              }

              }
             else{
              //user doesn't exit as parsed data is empty
              //res.send('invalid');
              res.send({

                 "isValid":"invalid"

              })



            }


              }

            else {
             //salesforce responsed with an error
              console.log(error);
              console.log("Network error");
              //res.send("Network Error")
              res.send({

                 "isValid":"invalid"

              })

            }


         });



   });

 });

//middleware that checks if there is a correct jwt in the header.
app.use(jwtverify);

//for event routes
app.use(Eventrouter);

//for feedback and survey
app.use(SurveyRouter);

// route for the detailed user information
app.use(detailuserRouter);

// route for lottery
app.use(lotteryRouter);

// route for actions
app.use(actionRouter);


function isTokenStillValid(access_token){
   var temp = access_token;

   if (access_token!=temp){
       console.log(false);
       return false;

     }
    else{
      console.log(true);
      return true;
    }

}

function isEmptyObject(obj) {

  if(obj['totalSize'] == 0){    //salesforce has totalSize keyword on its response that says if there is any match with our username query

     return true
  }
  else{
    return false;
  }
}



http.listen(process.env.PORT || 3000, ()=>{

console.log("Server is listening on port 3000")

});
