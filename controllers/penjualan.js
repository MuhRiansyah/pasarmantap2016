/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var moment = require("moment");
module.exports = {

    registerRoutes: function(app,checkAuth) {
        app.get('/penjualan/daftarpenjualan',checkAuth,this.daftarPenjualan);
        app.get('/penjualan/pesananbaru',checkAuth,this.pesananBaru);
        app.get('/penjualan/konfirmasipengiriman',checkAuth,this.konfirmasiPengiriman);
        app.get('/penjualan/statuspengiriman',checkAuth,this.statusPengiriman);
    },

    daftarPenjualan : function(req, res, next){
        models.Transaksi.findAll({
            where : {
                //todo : pakai tokoId atau penjualId??
                tokoId : res.locals.session.tokoId,
                status_tampil : 1
            },
            include: [models.Pengguna,
                {
                    //todo: order sesuai tanggal status
                    model: models.Invoice, include:
                    [
                        { model:models.Status,order : ['waktu']}
                        ,models.Toko,models.Produk,
                        {model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
                    ]
                }
            ]
        }).then(function(transaksi){
            //res.send(transaksi);
            res.render('pc-view/penjualan/daftarPenjualan', {
                tabMenu: 'Daftar Transaksi Penjualan',
                moment : moment,
                transaksi : transaksi
            })
        });
    },

    pesananBaru : function(req, res, next){
        models.Transaksi.findAll({
            where : {
                penjualId : res.locals.session.penggunaId,
                status_tampil : 1
            },
            include: [models.Pengguna,
                {
                    model: models.Invoice, include:
                    [
                        models.Toko,
                        { model:models.Status,where : {id : 2 }},
                        { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
                    ]
                }
            ]
        }).then(function(transaksi){
            res.render('pc-view/penjualan/pesananBaru', {
                tabMenu: 'Pesanan Baru',
                transaksi : transaksi,
                moment : moment
            });
        });
    },

    konfirmasiPengiriman : function(req, res, next){
        models.Transaksi.findAll({
            where : {
                penjualId : res.locals.session.penggunaId,
                status_tampil : 1
            },
            include: [models.Pengguna,
                {
                    model: models.Invoice, include:
                    [
                        models.Toko,
                        { model:models.Status,where : {id : 3 }},
                        { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
                    ]
                }
            ]
        }).then(function(transaksi) {
            res.render('pc-view/penjualan/konfirmasiPengiriman', {
                tabMenu: 'Konfirmasi Pengiriman',
                transaksi: transaksi
            });
        })
    },

    statusPengiriman: function(req, res, next){
        models.Transaksi.findAll({
            where : {
                penjualId : res.locals.session.penggunaId,
                status_tampil : 1
            },
            include: [models.Pengguna,
                {
                    model: models.Invoice, include:
                    [
                        models.Toko,models.Produk,
                        { model:models.Status},
                        { model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
                    ]
                }
            ]
        }).then(function(transaksi){
            res.render('pc-view/penjualan/statusPengiriman', {
                tabMenu: 'Status Pengiriman',
                transaksi : transaksi,
                moment : moment
            });
        });
    }
};
