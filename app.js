 var express = require('express');
var path = require('path');

var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var Q = require('q');
var session = require('express-session');

var jqupload = require('jquery-file-upload-middleware');
var app = express();

app.get('/paginasi', function(req, res, next){
   res.render('pagination');
});

// jQuery File Upload endpoint middleware
app.use('/upload', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    // gimana cara ganti nama file gambar jadi waktu sekarang (misalkan jadi : 20151020101.png)
    uploadDir: function(){
      //return __dirname + '/public/uploads/' + now;
      return __dirname + '/public/images/produk/';
    },
    uploadUrl: function(){
      //return '/uploads/' + now;
      return '/images/produk/';
    }
  })(req, res, next);
});
app.use('/upload-gambar-toko', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    // gimana cara ganti nama file gambar jadi waktu sekarang (misalkan jadi : 20151020101.png)
    uploadDir: function(){
      //return __dirname + '/public/uploads/' + now;
      return __dirname + '/public/images/toko/';
    },
    uploadUrl: function(){
      //return '/uploads/' + now;
      return '/images/toko/';
    }
  })(req, res, next);
});
app.use('/upload-gambar-pengguna', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    // gimana cara ganti nama file gambar jadi waktu sekarang (misalkan jadi : 20151020101.png)
    uploadDir: function(){
      //return __dirname + '/public/uploads/' + now;
      return __dirname + '/public/images/pengguna/';
    },
    uploadUrl: function(){
      //return '/uploads/' + now;
      return '/images/toko/';
    }
  })(req, res, next);
});
app.use('/upload-bukti-pembayaran', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    // gimana cara ganti nama file gambar jadi waktu sekarang (misalkan jadi : 20151020101.png)
    uploadDir: function(){
      //return __dirname + '/public/uploads/' + now;
      return __dirname + '/public/images/buktiPembayaran/';
    },
    uploadUrl: function(){
      //return '/uploads/' + now;
      return '/images/buktiPembayaran/';
    }
  })(req, res, next);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//var favicon = require('serve-favicon');
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(function(req,res,next){

  //ini digunakan untuk mendapatkan jumlah barang belanjaan dikeranjang
  var cart = req.session.cart || (req.session.cart = []);
  //lingkungan produksi menggunakan session dari request session setelah login
  res.locals.session = req.session;
  // ------ lingkungan development ----- //
  //var session = {
  //  penggunaId : 1,
  //  fotoPengguna : 'default-user-photo.png',
  //  nama : 'riansyah',
  //  tokoId : 1,
  //  namaToko : 'barokah',
  //  loggedIn : 'true',
  //  cart : cart
  //};
  //res.locals.session = session;
  // ------ lingkungan development ----- //
  next();
});
app.get('/sesi',function(req,res){
   res.render('latihan')
});


// create "admin" subdomain...this should appear
// before all your other routes
var mobile = express.Router();
app.use(require('vhost')('m.*', mobile));

require('./routes.js')(app,mobile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);  
});



// error handlers

/* development error handler will print stacktrace*/
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/* production error handler no stacktraces leaked to user*/
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
