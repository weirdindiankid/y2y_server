var app = require('express')();

var http =require('http').Server(app);

var io = require('socket.io')(http);

const bodyParser = require('body-parser');

const request = require('request-promise');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var access_token="random";

var instance_url;

var temp_client_id;

var id;

var isLoggedIn = false;

//localhost at BU is http://10.192.78.125:3000

//need to hide this for github but fine for heroku

 const clientSecret = "566249532212319266";

 const clientId = "3MVG982oBBDdwyHjNU4f2999wkhzy3ZCzjx8UZKN15ayD30EGNeVvF2u7doaR0gABPNecu.5A3k7lLf.CkQnR";

 const myusername = "angelay@bu.edu.buspark2";

 const mypassword = "bigm0neyOIGnrOq2gScZ9jMmUYpAARcf" //mypassword+token



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// till this



//io.on('connection',(socket)=>{

  //console.log(`Client ${socket.id} has connected`);
  //temp_client_id = socket;
  //auth();
  //isTokenStillValid(access_token);


  //socket.on('disconnect',()=>{

   //console.log("A client has disconnected");

  //});

//});

//first getting the access_token

app.post('/login',function(req,res){

     // get token and instance_url to talk with salesforce

   auth().then(function(){   //asnychorous


    // get username and password from the users
    console.log("hello from an android");

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);

    //another request
    //instrad use SoQl to search all contacts and see if any of username__c and password__c matches
    const option = {
            method: 'GET',
            uri: instance_url+"/services/data/v20.0/query/?q=SELECT+username__c+,+password__c+,+id+from+Contact+WHERE+username__c='"+username+"'", // SOQL salesforce query for username
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





                 if (obtained_password == password){
                   //password matches
                   //console.log(`Client ${temp_client_id.io} has successful logged in`);
                   console.log("you have logged in")

                   isLoggedIn = true;
                   res.send(obtained_id);
                 }


                 else{
                   //doesn't match password
                   res.send(
                  'invalid'
                  );
              }

              }
             else{
              //user doesn't exit as parsed data is empty
              res.send(
             'invalid'
             );
            }


              }

            else {
             //salesforce responsed with an error
              console.log(error);
              console.log("Network error");
              res.send("Network Error")
            }


         });



});

});

app.post('/edituser',function(req,res){


   var rating = req.body.rating;
   var comment = req.body.comment;
   var id = req.body.id


   console.log(rating);

    auth().then(function(){  // so if token has expires we can have new token else same token would be given

    console.log("we are going to change some user informations here");


    const option = {
            method: 'PATCH',
            uri: instance_url+'/services/data/v20.0/sobjects/Contact/'+id, // SOQL salesforce query for username
            headers: {
              'Authorization': 'Bearer ' + access_token,
              'Content-Type': 'application/json'

            },
            body:JSON.stringify({
              "Daily_Guest_Rating__c" : rating,
              "Comment_Rating__c": comment

            })

            };

            request(option, function(error, response,body){



                    if (response.statusCode == 204){  //salesforce doesn't return anything
                      //no error
                      res.send("sucess")


                    }

                    else {
                      res.send("error")
                    }

                  });

    });

});





var auth = async (function(){

  const option = {
        method: 'POST',
        uri: `https://test.salesforce.com/services/oauth2/token`,
        qs: {
          grant_type: "password",
  				client_id:  clientId,
  				client_secret: clientSecret,
  				username: myusername,
          password: mypassword

        }
     };
    try{
     const response = await (request(option, function(error, response,body){

      if (!error && response.statusCode == 200){
       //no error
        var parsedData = JSON.parse(body);
        access_token = parsedData["access_token"];
        instance_url = parsedData["instance_url"]
        console.log(access_token);
        console.log(instance_url);

         }
      else {
         console.log("error");
       }


     }));
     return Promise.resolve(response.id == 5);

     }
    catch(error){
      console.log(error);
      Promise.reject(error);

    }




});

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

//io.to(userid).emit('new message', {
//    message: message,
//    timestamp: Date.now()
//  });
