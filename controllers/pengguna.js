/**
 * Created by riansyahPC on 11/21/2015.
 */

var models  = require('../models');
var async  = require('async');
module.exports = {

    registerRoutes: function(app,checkAuth) {
        //fitur non-pengguna atau pengguna jika ingin mengubah profil
        app.get('/pengguna/profil/:id', this.profil);
        app.get('/pengguna/registrasi', this.registrasi);
        //setelah registrasi,langsung dibuatkan sesi untuk masuk ke beranda
        app.post('/pengguna/registrasi/post', this.postRegistrasi);
        //fitur pengguna
        app.get('/pengguna/pengaturan-profil',checkAuth, this.pengaturanProfil);
        app.post('/pengguna/gantifoto/',checkAuth, this.gantiProfil);
        app.post('/pengguna/gantisandi/',checkAuth, this.gantiSandi);
        app.get('/pengguna/ceksandi/:sandilama',checkAuth, this.cekSandi);
    },

    postRegistrasi : function(req, res, next) {
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields) {
            models.Pengguna.create({
                nama : fields.nama,
                email : fields.email,
                sandi : fields.sandi,
                tokoId : 0,//diset 0 terlebih dahulu tokonya
                foto : (fields.foto) ? fields.foto : 'default-user-photo.png',
                jenis_kelamin : fields.jenis_kelamin
            }).then(function(){
                res.redirect('/pc-view/beranda')
            });
        });
    },
    registrasi : function(req, res, next) {
        res.render('pc-view/registrasi');
    },

    cekSandi : function(req, res, next) {
        models.Pengguna.find({
            where : { sandi : req.params.sandilama, id :req.session.penggunaId}
        }).then(function(pengguna) {
            var hasil = 'salah';
            if(pengguna){
                hasil = 'benar'
            }
            res.send(hasil);
        })
    },
    gantiSandi : function(req, res, next) {
        models.Pengguna.update({
            sandi : req.body.sandi
        },
        { where : { id : req.session.penggunaId }
        }).then(function(){
            res.redirect('/pengguna/profil/'+(req.session.penggunaId))
        });
    },
    gantiProfil : function(req, res, next) {
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields) {
            models.Pengguna.update({
                nama : fields.nama,
                email : fields.email,
                foto : (fields.foto) ? fields.foto : 'default-user-photo.png',
                jenis_kelamin : fields.jenis_kelamin
            },{
                where: {id: req.session.penggunaId}
            }).then(function(){
                res.redirect('/pengguna/profil/'+(req.session.penggunaId))
            });
        });
    },
    pengaturanProfil : function(req, res, next) {
        models.Penerima.find({
            include: [
                { model: models.Pengguna,where : {id :req.session.penggunaId},
                    include : models.Toko
                },models.Kabupaten,models.Provinsi
            ]
        }).then(function(penerima) {
            res.render('pc-view/profilPengguna',{
                penerima : penerima,
                produkTerjual : 0
            });
        })
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
