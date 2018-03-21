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

 const mypassword = "bigm0ney" //mypassword+token



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

   auth().then(function(){


    // get username and password from the users
    console.log("hello from an android");

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);

    //another request

    const option = {
            method: 'GET',
            uri: instance_url+"/services/data/v37.0/parameterizedSearch/?q="+username+"&sobject=Contact&Contact.fields=id,Password__c",
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
                console.log(parsedData);
                obtained_password = parsedData['searchRecords'][0]['Password__c'];

                id = parsedData['searchRecords'][0]['id'];


                 if (obtained_password == password){
                   //password matches
                   //console.log(`Client ${temp_client_id.io} has successful logged in`);
                   console.log("you have logged in")

                   isLoggedIn = true;
                   res.send('valid');
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





var auth = async (function(){

  const option = {
        method: 'POST',
        uri: `https://login.salesforce.com/services/oauth2/token`,
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
  return !Object.keys(obj).length;
}








http.listen(3000, ()=>{

console.log("Server is listening on port 3000")

});

//io.to(userid).emit('new message', {
//    message: message,
//    timestamp: Date.now()
//  });
