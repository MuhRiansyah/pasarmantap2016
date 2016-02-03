/**
 * Created by riansyahPC on 11/21/2015.
 */

var models  = require('../models');
var async  = require('async');

module.exports = {

    registerRoutes: function(app) {
        //menampilkan orang lain
        app.get('/pengguna/profil/:id', this.profil);
        app.get('/pengguna/pengaturan-profil', this.profil);
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
            //perbaki ! bukan pakai params.id nya pengguna,pakai paramater idn-ya toko,gunakan include ke toko
            models.Invoice.sum('jumlah',{where : {tokoId :req.params.id}})
                .then(function(jumlah) {
                    callback(null,jumlah);
                })
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
