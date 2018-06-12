var async = require('asyncawait/async');
var await = require('asyncawait/await');
const request = require('request-promise');
var access_token;
var instance_url;


module.exports = {

"helperOne" : async(function(tokens){

        //DATE()

        var action_id = {}  //action id and names

        instance_url = tokens[2];
        access_token = tokens[1];
        var id = tokens[0];

        const option = {
            method: 'GET',
            uri: instance_url+"/services/data/v20.0/query/?q=SELECT+Name+,+Guest__c+,+Number_of_Steps__c+,+id+,+Status__c+from+Action_Item__c+WHERE+Guest__c='"+id+"'+AND+Status__c='Planned'",
            headers: {
              'Authorization': 'Bearer ' + access_token

            },
            timeout: 7000 // 7 seconds second timeout
         };



         return request(option)
         .then(function(body){

            var parsedData = JSON.parse(body);


            if (parsedData["totalSize"]==0){

                action_id["size"] = 0;
                return ([action_id,access_token,instance_url])


            }
            else{    //assuming both are dependent with each other
                     var totalSize = parsedData["totalSize"]
                     action_id["size"] = totalSize
                     var i;
                     var arr =[]
                     var url = "Action_Item__c="+"'"+parsedData["records"][0]["Id"]+"'"

                     // from step 0
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
                        return ([action_id,access_token,instance_url]);

                      }


                     }
                   }

                })
                .catch(function(err){
                       return Promise.reject(err)
                })





}),
"helperTwo" : async(function(tokens){


  //console.log(tokens)
  var status = tokens[0];
  instance_url = tokens[2];
  access_token = tokens[1];



  const option = {
      method: 'PATCH',
      uri: instance_url+"//services/data/v20.0/sobjects/Action_Item__c/"+id,  //action item
      headers: {
        'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'

      },
      body:JSON.stringify({

        "Status__c":status  //or dropped


        }),
        timeout: 7000 // 7 seconds second timeout

      };


       return request(option)
       .then(function(body){

             return(tokens)

       })
       .catch(function(err){
              return Promise.reject(err)
       })




}),
"helperThree" : async(function(tokens){


  var id = tokens[0];
  instance_url = tokens[2];
  access_token = tokens[1];


  //id = x //x has action item step and


  //console.log(x)

  const option = {
      method: 'PATCH',
      uri: instance_url+"/services/data/v20.0/sobjects/Action_Item_Step__c/"+id, //step id
      headers: {
        'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'

      },
      body:JSON.stringify({

        	"CompletedCB__c":"true"


        }),
        timeout: 7000 // 7 seconds second timeout

      };


      return request(option)
      .then(function(body){



            return(tokens)

      })
      .catch(function(err){
             return Promise.reject(err)
      })





})
}
