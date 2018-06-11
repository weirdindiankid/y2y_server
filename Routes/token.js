// route for given the code to reset

const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request');
const jwt = require('jsonwebtoken')
var jwtsecret = process.env.jwtsecret || authjson.jwtsecret ;

const nodemailer = require('nodemailer');

var access_token;
var instance_url;


var asyncc = require('async');

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/token',function(req,res){




    var username = req.body.username






    Salesforceauth("salt").then(function(tokens){


      instance_url = tokens[2];
      access_token = tokens[1];

      const option = {
              method: 'GET',
              uri: instance_url+"/services/data/v20.0/query/?q=SELECT+username__c+,+id+from+Contact+WHERE+username__c='"+username+"'", // SOQL salesforce query for username
              headers: {
                'Authorization': 'Bearer ' + access_token

              }

              };

    request(option, function(error, response,body){

        if(!error && response.statusCode == 200){

            var parsedData = JSON.parse(body);

            if(parsedData["totalSize"]!=0){


            //  email = parsedData['records'][0]['Email__c']
              // check if username exists
              //resetrequestcounter = parsedData['records'][0]['resetrequestcounter__c']

              id = parsedData['records'][0]['Id']

                     // create a token

              var user  = {
                "id" : id,
                "email" : "rikenm",
                "date" : Date.now()  // to make this token unique
              }

              jwt.sign({user,
               exp: Math.floor(Date.now() / 1000) + (1 * 10)  //expires in 10 minutes

              },jwtsecret,(err,token)=>{


                  // send the mail

                  nodemailer.createTestAccount((err, account) => {


                    if (err) {
                         console.error('Failed to create a testing account');
                         console.error(err);
                         return process.exit(1);
                     }

                      // create reusable transporter object using the default SMTP transport
                      const transporter = nodemailer.createTransport({
                          service: 'gmail',
                          secure : 'false',
                          port : 25,
                          auth: {
                            user:process.env.gmailusername,
                            pass:process.env.gmailpassword
                          },
                          tls:{
                            rejectUnauthorized : false
                          }
                        });

                      // setup email data with unicode symbols
                      let mailOptions = {
                          from: '"Y2Y" <noreply.y2y@gmail.com>', // sender address
                          to: "rikenm@bu.edu", // list of receivers
                          subject: 'Reset requested', // Subject line
                          text: "Hi", // plain text body
                          html: '<b>Hello world?</b>' // html body
                      };

                      // send mail with defined transport object
                      transporter.sendMail(mailOptions, (error, info) => {
                          if (error) {
                              return console.log(error);
                          }
                          else{

                            console.log('Message sent: %s', info.messageId);
                            // Preview only available when sending through an Ethereal account
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                            res.status(200).send("sucess")

                          }





                      });
                  });



                  // increment the reset request times



              })










            }

            else{res.status(400).send("user doesn't exist")}



             // else send error




        }else{res.status(400).send("error")}



    })








    })//
    .catch(function(error){

       console.log("inside error")
       console.log(error)

       res.status(400).send("error");
    });




})

module.exports = router
