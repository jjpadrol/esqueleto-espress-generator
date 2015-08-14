var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
 
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function(req, res, next) {
    // guardar path en session.redir para despues de login
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    //Hacer visible req.session en las vistas
    res.locals.session = req.session;
    //guardo el incio de sesión
    if (req.session.user) //control de inactividad mientras se este logeado
    {
        if (req.session.startSession) //si se ha iniciado sessión de tiempo comprobamos su actividad:
        {
            var sessionActive = (new Date().getTime() - req.session.startSession) / 1000;
            //console.log("tiempo activo:" + sessionActive + " usuario:" + req.session.user.username);
            if (sessionActive > 10) //si supera el tiempo desconectamos sessión
            {
                req.session.autoLogout = true;
                delete req.session.startSession;
                //lo he comentado y puesto con un if en el logout porque sino al logear de nuevo se pierde la ultima pagina
                //req.session.redir = "/login"; //preparamos dirección a cargar despues de logout para ver mensaje de inactividad
                res.redirect("/logout");
            }
            else
            {
               req.session.startSession = new Date().getTime(); //reinicializamos tiempo de session activa
               req.session.autoLogout = false;
               //console.log("reinicado tiempo actividad");
            }
            res.locals.session = req.session; //updatamos variables locales para mostrar mensaje inactividad
        }
    }
    next();
});


app.use('/', routes );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
