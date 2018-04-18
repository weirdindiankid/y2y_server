var app = require('express')();

var http =require('http').Server(app);

var io = require('socket.io')(http);

const bodyParser = require('body-parser');

const request = require('request-promise');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var asyncc = require('async');

var _ = require('underscore');

var access_token="random";

var instance_url;

var temp_client_id;

var id;

var bed_id;

var isLoggedIn = false;

//localhost at BU is http://10.192.78.125:3000

//need to hide this for github but fine for heroku

 const clientSecret = "566249532212319266";

 const clientId = "3MVG982oBBDdwyHjNU4f2999wkhzy3ZCzjx8UZKN15ayD30EGNeVvF2u7doaR0gABPNecu.5A3k7lLf.CkQnR";

 const myusername = "angelay@bu.edu.buspark2";

 const mypassword = "bigm0neyOIGnrOq2gScZ9jMmUYpAARcf" //mypassword+token



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());




app.post('/login',function(req,res){    //added name soos********* check

     // get token and instance_url to talk with salesforce

   auth("salt").then(function(){   //asnychorous


    // get username and password from the users
    console.log("hello from an android");

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);

    //another request
    //instrad use SoQl to search all contacts and see if any of username__c and password__c matches
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

                   res.send({
                      "id":obtained_id,
                      "isValid":"valid",
                      "name" : obtained_name

                   })



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

app.post('/edituser',function(req,res){


   var rating = req.body.rating;
   var comment = req.body.comment;
   var id = req.body.id

   id = id.slice(0,-3)

   console.log(id);




    auth("salt").then(function(){  // so if token has expires we can have new token else same token would be given




    const option = {
            method: 'POST',
            uri: instance_url+'/services/data/v20.0/sobjects/Survey__C', // SOQL salesforce query for username
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
                      res.send("success")


                    }

                    else {
                      res.send("error")
                    }

                  });

    });

});

app.post('/feedback',function(req,res){



   var comment = req.body.comment;
   var id = req.body.id

   id = id.slice(0,-3)

   console.log(id);




    auth("salt").then(function(){  // so if token has expires we can have new token else same token would be given




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
                      res.send("sucess")


                    }

                    else {
                      res.send("error")
                    }

                  });

    });

});

app.get('/detailuser/:id',function(req,res){



   var id = req.params.id



   // get auth then get user's bed id then get bed name + some more details.
   // 1 st call: need auth to talk with salesforce. salesforce keeps on changing this so to make sure, i have token to do firstcall
   //2nd call: to get ith bedname have to know ith bed id first.
   //3: bunch of parallel calls. one of them is to get a bed name

   auth(id).then(getbedid).then(function(bedid){

        //requets and handle for long last day, locker and nits

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





   })



});

app.get('/lottery',function(req,res){

    auth("salt").then(getlotteryid).then(function(lotteryid){








               // create optiopn 3  and 4

               //result[0] and result1[2] available
        if (lotteryid["size"]==2) {

          longtermid = lotteryid["Long Term"].slice(0,-3);
          ebedid = lotteryid["E-bed"].slice(0,-3);

          console.log(ebedid)
          console.log(longtermid)


          //ebed

          const option = {
                method: 'GET',
                uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+id+,+Status__c+,+Lottery_Number_Daily__c+,+Bed_Name__c+from+Lottery_Entry__c+WHERE+Lottery__c='"+ebedid+"'+AND+Bed_Name__c != null",
                headers: {
                  'Authorization': 'Bearer ' + access_token

                }
             };




          // long term
          const option2 = {
                method: 'GET',
                uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+id+,+Status__c+,+Lottery_Number_Daily__c+,+Bed_Name__c+from+Lottery_Entry__c+WHERE+Lottery__c='"+longtermid+"'+AND+Bed_Name__c != null",
                headers: {
                  'Authorization': 'Bearer ' + access_token

                }
             };

             var lotterywinner="Not Drawn Yet";

             var lotterywinner2="Not Drawn Yet";





          asyncc.parallel({
                      one: function(parallelCallback){

                        const response = (request(option, function(error, response,body){

                            if (!error && response.statusCode == 200){
                             //no error
                              var parsedData = JSON.parse(body);
                              totalSize = parsedData["totalSize"];
                              var i;



                              if (totalSize!=0){

                              lotterywinner=parsedData["records"][0]["Lottery_Number_Daily__c"];;

                              for (i=1;i<totalSize;i++){

                                    lotterywinner =lotterywinner+"-"+parsedData["records"][i]["Lottery_Number_Daily__c"]
                                    if(i==totalSize-1){  parallelCallback(null, {err: error, res: lotterywinner});}

                              }

                            }else{


                              parallelCallback(null,{err: error, res: "Not Drawn Yet"});
                            }

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

                              totalSize = parsedData["totalSize"];
                              var i;
                              console.log(totalSize)

                              if (totalSize!=0){
                                var lotterywinner2=parsedData["records"][0]["Lottery_Number_Daily__c"];

                                for (i=1;i<totalSize;i++){

                                      lotterywinner2 = lotterywinner2+"-"+parsedData["records"][i]["Lottery_Number_Daily__c"]
                                      console.log(lotterywinner2)
                                      console.log(i)

                                      if(i==(totalSize-1)){  parallelCallback(null, {err: error, res: lotterywinner2});}

                                }


                            }else{

                              parallelCallback(null, {err: error, res: "Not Drawn Yet"});
                              }

                               }
                            else {
                               console.log("error");
                             }

                           }));


                      }




          },function(err,result){


              (result["two"])


                        //final
                  res.send({
                    "e-bed":result["one"]["res"],
                    "Long Term":result["two"]["res"]  //long term

                  })


               })//inner callback
             }// if loop
             else{
                res.send({
                  "E-bed":"Not Drawn Yet",
                  "Long Term":"Not Drawn Yet"

                })

             }



    })// auth then close

}); // lottery post

app.get('/actionitems',function(req,res){



  auth("id").then(action).then(function(action_id){
   if(action_id["size"]!=0){
     // when size is not zero
    console.log(action_id)
    const option = {
          method: 'GET',
          uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+Id+,+Step_Number__c+,Action_Item__c+from+Action_Item_Step__c+WHERE+"+action_id["url"],
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


               action_id[parsedData["records"][i]["Action_Item__c"]][step]=name
               action_id[parsedData["records"][i]["Action_Item__c"]]["step_id"]=id


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

var getlotteryid = async(function(x){

  //DATE()

  var lottery_id = {}  //lottery object



  const option = {
      method: 'GET',
      uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+id+,+Lottery_Date__c+,+Type__c+from+Lottery__c+WHERE+Lottery_Date__c=2018-02-28+AND+(Type__C='E-Bed'+OR+Type__C='Long Term')",
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

      }else{  //assuming both are dependent with each other

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

     }


   }));

   return Promise.resolve(lottery_id);

   }
   catch(error){
     console.log("inside catch")
    console.log(error);
    Promise.reject(error);

  }








});

var getbedid = async(function(x){

    //req and res error amd also check if





   //DATE()


     const option = {
         method: 'GET',
         uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Bed__c+,+Guest__c+,+Bed_Assignment_Date__c+,+Long_Term_BA__c+from+Bed_Assignment__c+WHERE+Guest__c='"+x+"'+and+Bed_Assignment_Date__c=2018-03-02",
         headers: {
           'Authorization': 'Bearer ' + access_token

         }
      };
     try{
      const response =  await(request(option, function(error, response,body){

       if (!error && response.statusCode == 200){
        //no error
         var parsedData = JSON.parse(body);

         bed_id = parsedData["records"][0]["Bed__c"];




          }
       else {

          console.log(error);

        }


      }));

      return Promise.resolve(bed_id);

      }
      catch(error){
        console.log("inside catch")
       console.log(error);
       Promise.reject(error);

     }








});

var auth = async (function(id){

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
        //console.log(access_token);
        //console.log(instance_url);

         }
      else {
         console.log("error");
       }


     }));
     return Promise.resolve(id);

     }
    catch(error){
      console.log(error);
      Promise.reject(error);

    }




});

var action =  async(function(id){

  //DATE()

  var action_id = {}  //action id and names



  const option = {
      method: 'GET',
      uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+Guest__c+,+Number_of_Steps__c+,+id+,+Status__c+from+Action_Item__c+WHERE+Guest__c='003W000000ngacFIAQ'+AND+Status__c='Planned'",
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

          action_id["size"] = 0;
          return Promise.resolve(action_id)


      }else{  //assuming both are dependent with each other
           var totalSize = parsedData["totalSize"]
           action_id["size"] = totalSize
           var i;
           var arr =[]
           var url = "Action_Item__c="+"'"+parsedData["records"][0]["Id"]+"'"
           for(i=0;i<totalSize;i++){

             id = parsedData["records"][i]["Id"]
             numb_of_step = parsedData["records"][i]["Number_of_Steps__c"]
             name = parsedData["records"][i]["Name"]
             url = url+"+OR+Action_Item__c="+"'"+parsedData["records"][i]["Id"]+"'"

             action_id[parsedData["records"][i]["Id"]]={"action name":name}

             var obj = {"id":id,
                        "numb_of_step":numb_of_step,
                         "name":name}

            arr.push(obj)

            if(i==totalSize-1){

              action_id["records"]=arr
              action_id["url"] = url
              //return (action_id)
            }




           }




    }




      }
    else {

       console.log(error);

     }


   }));

   return Promise.resolve(action_id);

   }
   catch(error){
     console.log("inside catch")
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
