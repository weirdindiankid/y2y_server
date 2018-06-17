// route for hashing the password

const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request');

var access_token;
var instance_url;


var asyncc = require('async');

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/signup',function(req,res){


     var newpassword = req.body.password

     var token = req.body.token



    Salesforceauth("salt").then(function(tokens){



        //check if token has expired and isValid
        // if valid hash the password and save it
        var isExpiredToken = false;

        var dateNow = new Date();

        if(decodedToken.exp < dateNow.getTime())

        {
               isExpiredToken = true;
        }











    })//
    .catch(function(error){

       console.log("inside error")
       console.log(error)

       res.status(400).send("error");
    });




}
