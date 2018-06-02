var async = require('asyncawait/async');
var await = require('asyncawait/await');

//exporting json object which contains helper functions

module.exports = {


"helperOne" :  function(d){
              //this helper function would convert GMT time of salesforce's Event to EST and return json with day, time,month
              var date = new Date(d.slice(0,-5))
              var year = date.getFullYear();
              var month = date.getMonth()+1;
              var day = date.getDate();

              if (day < 10) {
                day = '0' + day;
              }
              if (month < 10) {
                month = '0' + month;
              }

              var formattedDate = month + '-' + day + '-' + year;
              var time = date.getHours() + ":"+date.getMinutes()




              return ({
                  "date" : formattedDate,
                  "time" : time
              })


            },
"helperTwo" :  function(d,id){
        // checks  if user's id is in the description field
             var d ={
               "User": [["Riken Maharjan","0xfkjskdjfk"],["Biken Maharjan","jdfjhsjhgsg"]]

             }


              var userArray = d["User"];

              for(i = 0; i<= len(userArray);i++){
                  if (id = userArray[i][1]){return true}

                 //if no matches found till the end
                  if(i==(len(userArray))){ //js is asynchronous
                    return false
                  }

              }

},
"helperThree":  function(description,id_Name_Array){
    // getting description
    //convert json string to json object, check if id_Name_Array exist in the user  and finally add id_Name_Array to the description json
    //var descriptionjson = JSON.parse(description)

    if (description === null){
        // special case
        console.log("hello")
        descriptionjson = id_Name_Array
        return(descriptionjson)
    }else {

      var users = description.split(",")

      if (users.length != 0){
           //1st check if user exist
           var a = users
           var b = id_Name_Array

           //a = JSON.stringify(a);
           //b = JSON.stringify(b);




           var c = a.indexOf(b);
           if(c != -1){
               // if user is already there
               // do nothing
               return(descriptionjson)

           }

         }
         //add the user if user array is empty or if user doesn't exist
         //users.push(id_Name_Array)
         //descriptionjson["Users"] = users //adding the new array
         descriptionjson = description+","+id_Name_Array

         return(descriptionjson)


    }











},
"helperFour" : function(description,id_Name_Array){
  //getting descriptionjson
  //convert json string to json object, check if id_Name_Array exist in the user  and remove id_Name_Array from the description json
  //var descriptionjson = JSON.parse(description)

  if (description === null){
      return(description)
  }
  else{
    var users = description.split(",")

      if (users.length != 0){


        var a = users
        var b = id_Name_Array

        //a = JSON.stringify(a);
        //b = JSON.stringify(b);




        var c = a.indexOf(b);
        if(c != -1){
            // if user is there
            // remove it
            index = users.indexOf(id_Name_Array)

            users.splice(index,1)

            descriptionjson = users.join()

            return(descriptionjson)

        } else{return(descriptionjson)}


      }
      return(descriptionjson)

  }



  }




}
