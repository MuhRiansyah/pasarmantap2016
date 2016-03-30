/**
 * Created by riansyahPC on 11/21/2015.
 */

var models  = require('../models');
var async  = require('async');

module.exports = {

    registerRoutes: function(app) {
        //fitur orang lain atau pengguna jika ingin mengubah profil
        app.get('/pengguna/profil/:id', this.profil);
        //fitur pengguna
        app.get('/pengguna/pengaturan-profil', this.pengaturanProfil);
    },

    pengaturanProfil : function(req, res, next) {
        res.render('pc-view/profilPengguna',{

        });
    },
    profil : function(req, res, next) {
        var moment  = require('moment');
        var stack = {};
        stack.getPengguna = function(callback){

            models.Penerima.find({
                include: [
                    { model: models.Pengguna,where : {id :req.params.id},
                        include : models.Toko
                    },models.Kabupaten,models.Provinsi
                ]
            }).then(function(penerima) {
                callback(null,penerima);
            })
        };
        stack.getJumlahProdukTerjual = function(callback){
            //todo: perbaki ! bukan pakai params.id nya pengguna,pakai paramater idn-ya toko,gunakan include ke toko
            //models.Invoice.sum('jumlah',{where : {tokoId :req.params.id}})
            //    .then(function(jumlah) {
            //        callback(null,jumlah);
            //    })
            callback(null,100);
        };
        async.parallel(stack,function(err,result){
            res.render('pc-view/profilPengguna',{
                penerima : result.getPengguna,
                moment : moment,
                produkTerjual : result.getJumlahProdukTerjual,
            });
        });


    }

};
