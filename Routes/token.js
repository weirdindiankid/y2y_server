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

router.get('/token',function(req,res){




    var username = req.body.username






    Salesforceauth("salt").then(function(tokens){


      instance_url = tokens[2];
      access_token = tokens[1];

      const option = {
              method: 'GET',
              uri: instance_url+"/services/data/v20.0/query/?q=SELECT+username__c+,+email__c+,+id+,+resetrequested__c+from+Contact+WHERE+username__c='"+username+"'", // SOQL salesforce query for username
              headers: {
                'Authorization': 'Bearer ' + access_token

              }

              };

    request(option, function(error, response,body){

        if(!error && response.statusCode == 200){

            var parsedData = JSON.parse(body);

            if(parsedData["totalSize"]!=0){


              email = parsedData['records'][0]['Email__c']
              // check if username exists
              resetrequestcounter = parsedData['records'][0]['resetrequestcounter__c']

              id = parsedData['records'][0]['Id']

                     // create a token

              var user  = {
                "id" = id,
                "email" = email,
                "resetrequested" = resetrequestcounter
              }

              jwt.sign({user
               exp: Math.floor(Date.now() / 1000) + (60 * 60),  //expires in an hour
               user
              },jwtsecret,(err,token)=>{


                  // send the mail

                  nodemailer.createTestAccount((err, account) => {


                    if (err) {
                         console.error('Failed to create a testing account');
                         console.error(err);
                         return process.exit(1);
                     }

                      // create reusable transporter object using the default SMTP transport
                      let transporter = nodemailer.createTransport({
                          host: 'smtp.ethereal.email',
                          port: 587,
                          secure: false, // true for 465, false for other ports
                          auth: {
                              user: account.user, // generated ethereal user
                              pass: account.pass // generated ethereal password
                          }
                      });

                      // setup email data with unicode symbols
                      let mailOptions = {
                          from: '"Y2Y" <no-reply@y2y.com>', // sender address
                          to: email, // list of receivers
                          subject: 'Reset requested', // Subject line
                          text: token, // plain text body
                          html: '<b>Hello world?</b>' // html body
                      };

                      // send mail with defined transport object
                      transporter.sendMail(mailOptions, (error, info) => {
                          if (error) {
                              return console.log(error);
                          }
                          console.log('Message sent: %s', info.messageId);
                          // Preview only available when sending through an Ethereal account
                          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                      });
                  });



                  // increment the reset request times



              })










            }

            else{res.status(400).send("user doesn't exist")}



             // else send error




        }else{res.status(400).send("error")}



    }








    })//
    .catch(function(error){

       console.log("inside error")
       console.log(error)

       res.status(400).send("error");
    });




}
