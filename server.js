var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var util = require('util');
var cookieParser = require('cookie-parser');
var us = require('./users.json')
var bodyParser = require('body-parser');
var fs = require('fs');

/* Establecemos la ruta donde buscar las vistas y el motor para las vistas: ejs */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 8080));

app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'esta es la clave',
    resave: true,
    saveUninitialized: true
}));

/* Middleware que muestra la info de las cookies y la session */
/*
app.use(function(req, res, next) {
  console.log("Cookies : " +util.inspect(req.cookies));
  console.log("Session : " +util.inspect(req.session));
  next();
});
*/

/* Autenticacion */
var auth = function(req, res, next) {
    if (req.session && checkUser(req.session.user))
        return next();
    else {
        return res.sendStatus(401);
    }
}

/* Check if user in db */
function checkUser(user) {
    for (var i = 0; i < us.users.length; i++) {
        if (us.users[i].username == user) {
            return true;
        }
    }
    return false;
};

/* Change password in db */
function changePass(user, newPass) {
    newPass = bcrypt.hashSync(newPass);
    for (var i = 0; i < us.users.length; i++) {
        if (us.users[i].username == user) {
            us.users[i].password = newPass;
        }
    }
    var usersjson = JSON.stringify(us);
    fs.writeFile("users.json", usersjson);
}

/* Check pass matches with user in db */
function checkPass(user, pass) {
    for (var i = 0; i < us.users.length; i++) {
        if (us.users[i].username == user && bcrypt.compareSync(pass, us.users[i].password)) {
            //console.log('ok');
            return true;
        }
    }
    //console.log('no');
    return false;
};

/* Petición GET a la raíz */
app.get('/', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    res.render('home');
});

/* Petición GET a /login */
app.get('/login', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    res.render('login');
});

/* Petición POST a /login */
app.post('/login', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    console.log(req.body);
    if (!req.body.username || !req.body.password) {
        console.log('login failed');
        res.send('login failed');
    } else if (checkUser(req.body.username) && checkPass(req.body.username, req.body.password)) {
        req.session.user = req.body.username;
        req.session.admin = true;
        console.log('login ok');
        res.redirect('/content');
    } else {
        console.log(`login ${util.inspect(req.body)} failed`);
        res.send('username or password incorrect');
    }
});

/* Petición GET a /profile */
app.get('/profile', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    res.render('profile');
});

/* Petición POST a /profile */
app.post('/profile', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    console.log(req.body);
    if (!req.body.username || !req.body.oldpassword || !req.body.newpassword) {
        console.log('change password failed');
        res.send('change password failed');
    } else if (checkUser(req.body.username) && checkPass(req.body.username, req.body.oldpassword)) {
        changePass(req.body.username, req.body.newpassword);
        console.log('change password ok');
        res.send('Password changed correctly');
    } else {
        console.log(`login ${util.inspect(req.body)} failed`);
        res.send('username or password incorrect');
    }
});


/* Petición GET a /logout */
app.get('/logout', function(req, res) {
    console.log("URL: " + req.originalUrl + ", Method: " + req.method);
    req.session.destroy();
    res.render('logout');
});

/* Petición GET a /content, solo permitida con login */
app.get('/content/*?', auth);

/* Petición a /content sirviendo los ficheros estáticos del libro */
app.use('/content', express.static(path.join(__dirname, 'public')));

/* Definimos el puerto donde estará escuchando el servidor */
/*var server = app.listen(8090, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Servidor escuchando en http://%s:%s", host, port);
});*/
app.listen(app.get('port'), () => {
    console.log(`Node app is running at localhost: ${app.get('port')}`);
});
