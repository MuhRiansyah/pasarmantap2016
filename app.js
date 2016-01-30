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
var credentials = require('./api/credentials.js');

var ongkir = require('./api/rajaOngkir')({
  key: credentials.rajaOngkir.key,
});

// jQuery File Upload endpoint middleware
app.use('/upload', function(req, res, next){
  var now = Date.now();
  jqupload.fileHandler({
    // gimana cara ganti nama file gambar jadi waktu sekarang
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

//API mengambil kabupaten, membutuhkan koneksi internet stabil
//app.get('/getkabupaten/:province_id',function(req, res, next) {
//  ongkir.getListKabupaten(req.params.province_id,function(listKabupaten){
//    var kabupatenHTML = [];
//    for(var val in listKabupaten){
//      kabupatenHTML[val] = "<option value="+listKabupaten[val].city_id+">" +
//          listKabupaten[val].city_name+"</option>";
//    }
//    res.send({listArr:kabupatenHTML});
//  });
//});
app.get('/getongkir/:idKotaTujuan',function(req, res, next) {
  var idKotaAsal = 501;
  var beratProduk = 1700;
  ongkir.getOngkosKirim(idKotaAsal,req.params.idKotaTujuan,beratProduk,
    function(ongkosKirim){
      res.send({ongkos:ongkosKirim});
  });
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
  res.locals.session = req.session;
  next();
});

// create "admin" subdomain...this should appear
// before all your other routes
var mobile = express.Router();
app.use(require('vhost')('m.*', mobile));

require('./routes.js')(app,mobile);

////level pelanggan
//var pelanggan = require('./routes/pelanggan');
// app.use('/pelanggan',checkAuth, pelanggan); yang normal




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
