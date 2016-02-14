/**
 * Created by riansyahPC on 11/23/2015.
 */
var async = require('async');
var models  = require('../models');

module.exports = {

    registerRoutes: function(app,checkAuth) {
        app.get('/toko/profil/:idToko/:idEtalase', this.profilToko);
        app.get('/toko/profil/:idToko/', this.profilToko);
        app.get('/toko/buka/', this.bukaToko);
        app.get('/toko/favorit/', this.getTokoFavorit);
        app.get('/toko/jadikanfavorit/:idToko', this.insertTokoFavorit);
        app.get('/toko/pengaturan/', this.pengaturanToko);
    },

    bukaToko : function(req, res, next){
        res.render('',{

        });
    },
    pengaturanToko : function(req, res, next){
        models.Toko.find({
            include : [models.Kabupaten,models.Provinsi],
            where   : {id:res.locals.session.tokoId}
        }).then(function(toko){
            models.Produk.findAndCountAll({
                include : models.Etalase,
                group   : 'etalaseId',
                where   : {tokoId:res.locals.session.tokoId}
            }).then(function(produk){
                //console.log(produk.rows[0].Etalase.nama+' - '+produk.count[0].count);
                res.render('pc-view/toko/pengaturanToko',{
                    produk : produk,
                    toko : toko
                });
            });
        });
    },
    insertTokoFavorit : function(req, res, next){
        models.Toko_Favorit.create({
            include : models.Toko
        }).then(function(tokoFavorit) {
            redirect('/');
        })
    },
    getTokoFavorit : function(req, res, next){
        models.Toko_Favorit.findAll({
            include : models.Toko,
            where   : {PenggunaId:1}
        }).then(function(tokoFavorit) {
            //pc-view id diganti sesuai sesi
            //mengambil produk rekomendasi toko favorit
            //harus disusun dari tabel child hingga ke parrentnya
            res.render('pc-view/toko/daftarTokoFavorit',{
                tokoFavorit : tokoFavorit
            })
        })
    },

    profilToko : function(req, res, next){
        var stack = {};
        if(req.params.idEtalase){
            stack.getProdukMilikEtalase = function(callback){
                models.Toko.find({
                    include: [
                        { model: models.Produk,as:'Produk',where : {etalaseId :req.params.idEtalase},
                            include : models.Etalase
                        },models.Kabupaten
                    ],
                    where : { id : req.params.idToko }
                }).then(function(toko) {
                    callback(null,toko);
                })
            }
        }else{
            stack.getProdukMilikEtalase = function(callback){
                models.Toko.find({
                    include: [
                        { model: models.Produk,as:'Produk'},models.Kabupaten
                    ],
                    where : { id : req.params.idToko }
                }).then(function(toko) {
                    callback(null,toko);
                })
            }
        }

        stack.getEtalase = function(callback){
            models.Etalase.findAll({
                where : { tokoId : req.params.idToko}
            }).then(function(etalase) {
                callback(null,etalase);
            })
        }
        stack.getJumlahProdukTerjual = function(callback){
            models.Invoice.sum('jumlah',{where : {tokoId :'2'}})
                .then(function(jumlah) {
                callback(null,jumlah);
            })
        }
        //nanti tambahkan field status pada table transaksi
        //stack.getJumlahTransaksiBerhasil = function(callback){
        //    models.Invoice.sum('jumlah',{where : {tokoId :'2'}})
        //        .then(function(jumlah) {
        //        callback(null,jumlah);
        //    })
        //}
        async.parallel(stack,function(err,result){
            if(!req.params.idEtalase){
                var namaEtalase = 'Semua Etalase';
            }else{
                var namaEtalase = result.getProdukMilikEtalase.Produk[0].Etalase.nama;
            }
            res.render('pc-view/toko/etalase',{
                toko : result.getProdukMilikEtalase,
                etalase : result.getEtalase,
                produkTerjual : result.getJumlahProdukTerjual,
                namaEtalase : namaEtalase
            });
        });
    }
};
