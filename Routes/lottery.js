const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
var Salesforceauth = require("../Salesforce/salesforceauth");
const request = require('request-promise');
var LotteryIdHelperFunctions =  require("../HelperFunctions/GetLotteryId");

var getlotteryid = LotteryIdHelperFunctions["helperOne"];

var access_token;
var instance_url;
var responsejson = {};   //{size:  ,records:[{"name": ,"startTime": ,"endTime": , "date"}] }

//using body parser middleware to make reading http body simple
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/lottery',function(req,res){

    Salesforceauth("salt").then(getlotteryid).then(function(tokens){



       var lotteryid = tokens[0]
       instance_url = tokens[2];
       access_token = tokens[1];




               // create optiopn 3  and 4

               //result[0] and result1[2] available
      if (lotteryid["size"]==2) {

          longtermid = lotteryid["Long Term"].slice(0,-3);
          ebedid = lotteryid["E-bed"].slice(0,-3);

          console.log(ebedid+"ebedlot")
          console.log(longtermid+"lonter")


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

             var lotterywinner="N/A";

             var lotterywinner2="N/A";





          asyncc.parallel({
                      one: function(parallelCallback){

                        const response = (request(option, function(error, response,body){

                            if (!error && response.statusCode == 200){
                             //no error
                              var parsedData = JSON.parse(body);
                              totalSize = parsedData["totalSize"];
                              var i;

                              if(totalSize ==1){
                                 lotterywinner=parsedData["records"][0]["Lottery_Number_Daily__c"];
                                 parallelCallback(null,{err: error, res: lotterywinner});

                              }

                              else if (totalSize!=0){

                              lotterywinner=parsedData["records"][0]["Lottery_Number_Daily__c"];

                              for (i=1;i<totalSize;i++){

                                    lotterywinner =lotterywinner+"-"+parsedData["records"][i]["Lottery_Number_Daily__c"]
                                    if(i==totalSize-1){  parallelCallback(null, {err: error, res: lotterywinner});}

                              }

                            }


                            else{


                              parallelCallback(null,{err: error, res: "N/A"});
                            }



                          } // iferror
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


                              if(totalSize ==1){
                                 lotterywinner2=parsedData["records"][0]["Lottery_Number_Daily__c"];
                                 parallelCallback(null,{err: error, res: lotterywinner2});

                              }

                              else if (totalSize!=0){
                                var lotterywinner2=parsedData["records"][0]["Lottery_Number_Daily__c"];

                                for (i=1;i<totalSize;i++){

                                      lotterywinner2 = lotterywinner2+"-"+parsedData["records"][i]["Lottery_Number_Daily__c"]
                                      console.log(lotterywinner2)
                                      console.log(i)

                                      if(i==(totalSize-1)){  parallelCallback(null, {err: error, res: lotterywinner2});}

                                }


                            }else{

                              parallelCallback(null, {err: error, res: "N/A"});
                              }

                               }
                            else {
                               console.log("error");
                             }

                           }));


                      }




          },function(err,result){


              console.log(result["two"])


                        //final
                  res.send({
                    "e-bed":result["one"]["res"],
                    "Long Term":result["two"]["res"]  //long term

                  })


               })//inner callback
             }// if loop
             else{
                res.send({
                  "e-bed":"N/A",
                  "Long Term":"N/A"

                })

             }



    })// auth then close

}); // lottery post

module.exports = router
