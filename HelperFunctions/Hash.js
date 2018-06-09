
// using SHA256 hash

var crypto = require('crypto');
const hash = crypto.createHash('sha256');

var salt = "" // saved in enc file




module.exports = {

        "hash" : (plaintext) => {

                  hash.update(digest+salt);

                   return hash.digest('hex');   // outpting hash in the  hex format


        }


}
