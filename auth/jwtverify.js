
// to verify the jwt

const jwt = require('jsonwebtoken');
var authjson = process.env || require('../auth/auth') ;

var jwtsecret = authjson.jwtsecret ;

module.exports = function(req,res,next){

const bearerHeader = req.headers['authorization']

console.log(bearerHeader)

if(typeof(bearerHeader) != 'undefined' && bearerHeader){

  const bearer = bearerHeader.split(' ');
  const token = bearer[1]



  jwt.verify(token,jwtsecret,(err,data)=>{

      if(err){

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
