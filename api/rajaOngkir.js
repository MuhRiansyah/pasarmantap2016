/**
 * Created by riansyahPC on 1/25/2016.
 */
var https = require('https'),
    qs = require('querystring');
var http       = require("http");

module.exports = function(rajaOngkirOptions){

    // this variable will be invisible outside of this module
    var accessToken;

    // this function will be invisible outside of this module
    function getAccessToken(cb){
        if(accessToken) return cb(accessToken);

        var options = {
            "method": "GET",
            "hostname": "api.rajaongkir.com",
            "port": null,
            "path": "/starter/province?id=12",
            "headers": {
                "key": rajaOngkirOptions.key
            }
        };
        //melakukan dekrispi dari api-key , nanti aja digunakan
        //var bearerToken = Buffer(
        //    encodeURIComponent(rajaOngkirOptions.key) + ':' +
        //    encodeURIComponent(rajaOngkirOptions.consumerSecret)
        //).toString('base64');
        //var options = {
        //    hostname: 'api.twitter.com',
        //    port: 443,
        //    method: 'POST',
        //    path: '/oauth2/token?grant_type=client_credentials',
        //    headers: {
        //        'Authorization': 'Basic ' + bearerToken,
        //    },
        //};
        //mengambilkan kode token yang digunakan untuk mengakses
        //https.request(options, function(res){
        //    var data = '';
        //    res.on('data', function(chunk){
        //        data += chunk;
        //    });
        //    res.on('end', function(){
        //        var auth = JSON.parse(data);
        //        if(auth.token_type!=='bearer') {
        //            console.log('Twitter auth failed.');
        //            return;
        //        }
        //        accessToken = auth.access_token;
        //        cb(accessToken);
        //    });
        //}).end();
    }
    // tahapan awal untuk otentifikasi twitter
    // data-data yang akan dikembalikan, perhatikan pola method dibawah
    return {
        //getListProvinsi : function(cb){
        //        var options = {
        //            "method": "GET",
        //            "hostname": "api.rajaongkir.com",
        //            "port": null,
        //            "path": "/starter/province",
        //            "headers": {
        //                "key": rajaOngkirOptions.key
        //            }
        //        };
        //        //cek penggunaan https dan http secara bersamaan di nodejs
        //        http.request(options, function(res){
        //            var chunks = [];
        //            res.on('data', function(chunk){
        //                chunks.push(chunk);
        //            });
        //            res.on('end', function(){
        //                //console.log(JSON.parse(chunks));
        //                var provinsi = JSON.parse(chunks);
        //                cb(provinsi.rajaongkir.results);
        //            });
        //        }).end();
        //},
        getOngkosKirimOffline : function(idKotaAsal,idKotaTujuan,beratProduk,cb){
            cb(20000);
        },
        //saatpengujian selesai gunakan yang versi API ini
        getOngkosKirim : function(idKotaAsal,idKotaTujuan,beratProduk,cb){
            var options = {
                "method": "POST",
                "hostname": "api.rajaongkir.com",
                "port": null,
                "path": "/starter/cost",
                "headers": {
                    "key": rajaOngkirOptions.key,
                    "Content-Type" : 'application/x-www-form-urlencoded'
                }
            };

            var req = http.request(options, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function (err,next) {
                    var ongkir = JSON.parse(chunks);
                    if(err){
                        console.log(ongkir.rajaongkir.results);
                        next();
                    }
                    cb(ongkir.rajaongkir.results[0].costs[0].cost[0].value);

                });
            });

            req.write(qs.stringify({
                origin: idKotaAsal,
                destination: idKotaTujuan,
                weight: beratProduk,
                courier: 'pos'
            }));
            req.end();
        },

        //getListKabupaten : function(idProvinsi,cb){
        //    var options = {
        //        "method": "GET",
        //        "hostname": "api.rajaongkir.com",
        //        "port": null,
        //        "path": "/starter/city?province="+idProvinsi,
        //        "headers": {
        //            "key": rajaOngkirOptions.key
        //        }
        //    };
        //    //cek penggunaan https dan http secara bersamaan di nodejs
        //    http.request(options, function(res){
        //        var chunks = [];
        //        res.on('data', function(chunk){
        //            chunks.push(chunk);
        //        });
        //        res.on('end', function(err,next){
        //            if(err){
        //                next();
        //            }
        //            var kabupaten = JSON.parse(chunks);
        //            cb(kabupaten.rajaongkir.results);
        //        });
        //    }).end();
        //},
    };
};
