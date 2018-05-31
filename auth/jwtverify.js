
// to verify the jwt

const jwt = require('jsonwebtoken');
//var authjson =  require('../auth/auth') || null;
var authjson = null // for github auth file is hidden

var jwtsecret = process.env.jwtsecret || authjson.jwtsecret ;

module.exports = function(req,res,next){

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


        next()
      }

  })



}else{
  //

  res.sendStatus(403);
}


}
