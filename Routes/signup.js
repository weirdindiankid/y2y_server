// route for hashing the password

const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request');
var tokenHelperFunctions =  require("../HelperFunctions/Hash");
var save = tokenHelperFunctions["helperOne"];

var bcrypt = require('bcrypt-nodejs')




var access_token;
var instance_url;


var asyncc = require('async');

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/signup',function(req,res){


     var newpassword = req.body.password

     //var token = req.body.token



    Salesforceauth("salt").then(function(tokens){

      //get the token




      const bearerHeader = req.headers['authorization']

      console.log(bearerHeader)

      if(typeof(bearerHeader) != 'undefined' && bearerHeader){

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]


        jwt.verify(token,jwtsecret,(err,data)=>{

            if(err){
              console.log(err)
              res.sendStatus(403)
            }
            else{
              req.data = data

              tokens[0] = data.user.id


              //check if token has expired and isValid
              // if valid hash the password and save it
              var isExpiredToken = false;

              var dateNow = new Date();

              if(data.exp < dateNow.getTime())

              {
                     //token expired
                     res.status(401).send("Token Expired")
              }

              else{

                    // token is valid
                    //hash the password with the bcrypt
                    //change the password

                    bcrypt.hash(newpassword, null, null, function(err, hash) {
                        // Store hash in your password DB.

                          // do the request to save the hashed password

                          tokens.push(hash)

                          save(tokens).then(func(){

                              res.status(201).send("Password Changed")

                          })
                          .catch(function(error){

                             console.log("inside error")
                             console.log(error)

                             res.status(400).send("error");
                          });


                    }); // end of the hash





              }//end of the else




            }//jwt

        })



      }else{res.status(401).send("No Token")}









    })//
    .catch(function(error){

       console.log("inside error")
       console.log(error)

       res.status(400).send("error");
    });




}


module.exports = router
