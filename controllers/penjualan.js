/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var moment = require("moment");
module.exports = {

    registerRoutes: function(app,checkAuth) {
        app.get('/penjualan/daftarpenjualan',checkAuth,this.daftarPenjualan);
        app.get('/penjualan/pesananbaru',checkAuth,this.pesananBaru);
        app.get('/penjualan/pesananbaru/update/:status/:invoiceId',checkAuth,this.updatePesananBaru);
        app.get('/penjualan/konfirmasipengiriman',checkAuth,this.konfirmasiPengiriman);
        app.post('/penjualan/konfirmasipengiriman/update',checkAuth,this.updateKonfirmasiPengiriman);
        app.get('/penjualan/konfirmasipengiriman/batal/:invoiceId',checkAuth,this.batalkanKonfirmasiPengiriman);

        app.get('/penjualan/statuspengiriman',checkAuth,this.statusPengiriman);
    },

    daftarPenjualan : function(req, res, next){
        models.Invoice.findAll({
            where : {
                //todo : pakai tokoId karena saat insert di detailProduk.jade ada tokoId tipe nya hidden
                tokoId : res.locals.session.tokoId,
                status_tampil : {$not : '8'}
            },
            include: [
                models.Pengguna,models.Toko,models.Produk,
                { model:models.Status,where : {id : 3 }},
                {model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(Invoice){
            //res.send(Invoice);
            res.render('pc-view/penjualan/daftarPenjualan', {
                tabMenu: 'Daftar Invoice Penjualan',
                moment : moment,
                Invoice : Invoice
            })
        });
    },

    updatePesananBaru : function(req, res, next){
        //todo: beri penanganan jika dibatalkan oleh penjual
        var status_tampil = 4;
        var status_id = 3;
        if(req.params.status == 'tolak'){
            status_tampil = 0;
            status_id = 7;
        }
        models.Invoice.update({
            status_tampil : status_tampil
        },{
            where: { id : req.params.invoiceId }
        }).then(function() {
            var now = moment();
            models.Invoice_Status.create({
                invoiceId : req.params.invoiceId,
                statusId : status_id,
                waktu : moment(now).format('YYYY-MM-DD HH:mm')
            }).then(function() {
                res.redirect('/penjualan/pesananbaru');
            })
        });
    },
    pesananBaru : function(req, res, next){
        models.Invoice.findAll({
            where : {
                tokoId : res.locals.session.tokoId,
                status_tampil : 3
            },
            include: [
                models.Pengguna,models.Toko,
                { model:models.Status,where : {id : 2 }},
                { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(Invoice){
            res.render('pc-view/penjualan/pesananBaru', {
                tabMenu: 'Pesanan Baru',
                Invoice : Invoice,
                moment : moment
            });
        });
    },

    batalkanKonfirmasiPengiriman : function(req, res, next){
        models.Invoice.update({
            status_tampil : 0,
            no_resi : 7
        },{
            where: { id : req.params.invoiceId }
        }).then(function() {
            var now = moment();
            models.Invoice_Status.create({
                invoiceId : req.params.invoiceId,
                statusId : 4,
                waktu : moment(now).format('YYYY-MM-DD HH:mm')
            }).then(function() {
                res.redirect('/penjualan/konfirmasipengiriman');
            })
        });
    },
    updateKonfirmasiPengiriman : function(req, res, next){
        models.Invoice.update({
            status_tampil : 5,
            no_resi : req.body.noresi
        },{
            where: { id : req.body.invoiceId }
        }).then(function() {
            var now = moment();
            models.Invoice_Status.create({
                invoiceId : req.body.invoiceId,
                statusId : 4,
                waktu : moment(now).format('YYYY-MM-DD HH:mm')
            }).then(function() {
                res.redirect('/penjualan/konfirmasipengiriman');
            })
        });
    },
    konfirmasiPengiriman : function(req, res, next){
        models.Invoice.findAll({
            where : {
                tokoId : res.locals.session.tokoId,
                status_tampil : 4
            },
            include: [
                models.Pengguna,models.Toko,
                { model:models.Status,where : {id : 3  }},
                { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(Invoice) {
            res.render('pc-view/penjualan/konfirmasiPengiriman', {
                tabMenu: 'Konfirmasi Pengiriman',
                Invoice: Invoice
            });
        })
    },

    statusPengiriman: function(req, res, next){
        models.Invoice.findAll({
            where : {
                tokoId : res.locals.session.tokoId,
                status_tampil : {$gt : 2, $lt: 8 }
            },
            include: [
                models.Pengguna,models.Toko,models.Produk,
                { model:models.Status,where : {id : {$gt : 2 } }},
                { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(Invoice){
            res.render('pc-view/penjualan/statusPengiriman', {
                tabMenu: 'Status Pengiriman',
                Invoice : Invoice,
                moment : moment
            });
        });
    }
};
