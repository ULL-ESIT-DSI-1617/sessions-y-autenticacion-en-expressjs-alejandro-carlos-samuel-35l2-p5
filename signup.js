var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');

var users = {
  "users": [
    {
      "username": "ale",
      "password": bcrypt.hashSync("alepass")
    },
    {
      "username": "carlos",
      "password": bcrypt.hashSync("carlospass")
    },
    {
      "username": "samuel",
      "password": bcrypt.hashSync("samuelpass")
    }
  ]
};

var usersjson = JSON.stringify(users);
fs.writeFile("users.json", usersjson);
