/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var sequelize = require("sequelize");
var moment = require("moment");

module.exports = {

    registerRoutes: function(app,checkAuth) {
        //app.get('/pembelian/daftarpembelian',checkAuth,this.daftarPembelian);
        app.get('/pembelian/daftarpembelian',this.daftarPembelian);
        //app.get('/pembelian/konfirmasipembayaran',checkAuth,this.konfirmasiPembayaran);
        app.get('/pembelian/konfirmasipembayaran',this.konfirmasiPembayaran);
        //app.get('/pembelian/konfirmasipenerimaan',checkAuth,this.konfirmasiPenerimaan);
        app.get('/pembelian/konfirmasipenerimaan',this.konfirmasiPenerimaan);
        //app.get('/pembelian/statuspemesanan',checkAuth,this.statusPemesanan);
        app.get('/pembelian/statuspemesanan',this.statusPemesanan);
        //app.get('/pembelian/keranjangbelanja/:id',checkAuth,this.keranjangBelanja);
        app.get('/pembelian/keranjangbelanja/:id',this.keranjangBelanja);
        //app.get('/pembelian/konfirmasiPembelian/',checkAuth,this.konfirmasiPembelian);
        app.get('/pembelian/konfirmasipembelian/',this.konfirmasiPembelian);
        //app.post('/pembelian/konfirmasiPembelian/simpanbelanjaan',checkAuth,this.simpanBelanjaan);
        app.post('/pembelian/keranjangbelanja/simpanbelanjaan',this.simpanBelanjaan);

    },

    keranjangBelanja : function(req, res, next){
        models.Produk.find({
            where : {
                id : req.params.id
            },
            include: [
                { model: models.Etalase, include: [
                    { model: models.Toko }
                ]}
            ],
            //attributes: ['kategori','deskripsi']
        }).then(function(produk) {
            res.render('pc-view/pembelian/keranjangBelanja', {
               produk : produk
            });
        })
    },
    simpanBelanjaan : function(req, res, next){
        //buat sesi untuk menyimpan data belanjaan pembeli, nanti sesinya didestroy kalau udah disimpan ke database
        res.send('jos');
        //redirect('/pembelian/konfirmasipembelian/');
    },
    konfirmasiPembelian : function(req, res, next){

        res.render('pc-view/pembelian/konfirmasiPembelian', {

        });
    },
    daftarPembelian : function(req, res, next){
        res.render('pc-view/pembelian/daftarPembelian', {
            tabMenu: 'Daftar Transaksi Pembelian',
        });
    },

    konfirmasiPembayaran : function(req, res, next){
        models.Transaksi.findAll({
            where : { penggunaId : 1 },
            include: [
                {
                    model: models.Invoice, include:
                    [
                        models.Toko,models.Produk,{
                            model : models.Penerima, include :[
                                models.Provinsi,models.Kabupaten,models.Kecamatan
                            ]
                        }
                    ]
                }
            ],
        }).then(function(transaksi) {
            res.render('pc-view/pembelian/konfirmasiPembayaran', {
                tabMenu: 'Konfirmasi Pembayaran',
                daftarTransaksi : transaksi,
                moment : moment
            });
        })

    },

    konfirmasiPenerimaan : function(req, res, next){
        res.render('pc-view/pembelian/konfirmasiPenerimaan', {
            tabMenu: 'Konfirmasi Penerimaan',
        });
    },

    statusPemesanan: function(req, res, next){
        res.render('pc-view/pembelian/statusPemesanan', {
            tabMenu: 'Status Pemesanan',
        });
    },
};
