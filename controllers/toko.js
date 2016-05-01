/**
 * Created by riansyahPC on 11/23/2015.
 */
var async = require('async');
var models  = require('../models');
var sequelize = require("sequelize");
module.exports = {

    registerRoutes: function(app,checkAuth) {
        //fitur pembeli
        app.get('/toko/profil/:idToko/:idEtalase', this.profilToko);
        app.get('/toko/profil/:idToko/', this.profilToko);
        //fitur penjual
        app.get('/toko/buka/', checkAuth,this.bukaToko);
        app.post('/toko/post-buka/', checkAuth,this.postBukaToko);
        app.get('/toko/pengaturan/',checkAuth, this.pengaturanToko);
        app.post('/toko/tambah-etalase/',checkAuth, this.tambahEtalase);
        app.post('/toko/ubah-etalase/',checkAuth, this.ubahEtalase);
    },

    ubahEtalase : function(req, res, next){
        models.Etalase.update({
            nama : req.body.namaEtalase
        },{ where : {id : req.body.etalaseId} }
        ).then(function(){
            res.redirect('/toko/pengaturan');
        });
    },
    tambahEtalase : function(req, res, next){
        models.Etalase.create({
            nama : req.body.namaEtalase,
            TokoId : res.locals.session.tokoId
        }).then(function(){
            res.redirect('/toko/pengaturan');
        });
    },
    bukaToko : function(req, res, next){
        if(res.locals.session.tokoId != 0){
            res.redirect('/pc-view/beranda')
        }else{
            models.Provinsi.findAll({
            }).then(function(listProvinsi){
                res.render('pc-view/toko/bukaToko',{
                    listProvinsi : listProvinsi
                });
            })
        }
    },
    postBukaToko : function(req, res, next){
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields) {
            models.Toko.create({
                nama : fields.nama,
                logo : (fields.logo) ? fields.logo : 'logo-toko.png',
                deskripsi : fields.deskripsi,
                ProvinsiId : fields.provinsiId,
                KabupatenId : fields.kabupatenId,
                kecamatan : fields.kecamatan
            }).then(function(toko){
                req.session.namaToko = fields.nama
                req.session.tokoId = toko.id
                res.redirect('/pc-view/beranda');
            })
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
                models.Produk.findAll({
                    //todo: produk yang belum memiliki etalase mempunyai id 0
                    where   : {tokoId:res.locals.session.tokoId,etalaseId:'0'}
                }).then(function(produkKeEtalase){
                    res.render('pc-view/toko/pengaturanToko',{
                        produk : produk,
                        produkKeEtalase : produkKeEtalase,
                        toko : toko
                    });
                })
            });
        });
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
        };
        stack.getJumlahProdukTerjual = function(callback){
            models.Invoice_Produk.find({
                attributes : [[sequelize.fn('SUM',sequelize.col('jumlah_produk') ),'jumlah_produk'] ]  ,
                include: [
                    { model: models.Produk,where : {tokoId :req.params.idToko}
                    }
                ]
            }).then(function(jumlah) {
                callback(null,jumlah.jumlah_produk);
            })
        };
        stack.getJumlahTransaksiBerhasil = function(callback){
            models.Invoice.findAndCountAll({
                where : {tokoId :req.params.idToko,status_tampil :'2'}
            }).then(function(jumlah) {
                callback(null,jumlah);
            });
        };
        async.parallel(stack,function(err,result){
            if(!req.params.idEtalase){
                var namaEtalase = 'Semua Etalase';
            }else{
                var namaEtalase = result.getProdukMilikEtalase.Produk[0].Etalase.nama;
            }
            res.render('pc-view/toko/daftarProdukPerEtalase',{
                toko : result.getProdukMilikEtalase,
                etalase : result.getEtalase,
                produkTerjual : (result.getJumlahProdukTerjual)  ? result.getJumlahProdukTerjual : '0',
                jumlahTransaksiBerhasil : result.getJumlahTransaksiBerhasil.count,
                namaEtalase : namaEtalase
            });
        });
    }
};
