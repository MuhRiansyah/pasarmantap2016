/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var sequelize = require("sequelize");
var moment = require("moment");
var formidable = require('formidable');
module.exports = {

    registerRoutes: function(app,checkAuth) {
        //app.get('/pembelian/daftarpembelian',checkAuth,this.daftarPembelian);
        app.get('/pembelian/daftarpembelian',this.daftarPembelian);
        app.get('/pembelian/daftartransaksi',this.daftarTransaksiPembelian);
        //app.get('/pembelian/konfirmasipembayaran',checkAuth,this.konfirmasiPembayaran);
        app.get('/pembelian/konfirmasipembayaran',this.konfirmasiPembayaran);
        app.get('/pembelian/konfirmasipembayaran/sukses',this.konfirmasiPembayaranSukses);
        app.post('/konfirmasipembayaran',this.insertKonfirmasiPembayaran);
        //app.get('/pembelian/konfirmasipenerimaan',checkAuth,this.konfirmasiPenerimaan);
        app.get('/pembelian/konfirmasipenerimaan',this.konfirmasiPenerimaan);
        //app.get('/pembelian/statuspemesanan',checkAuth,this.statusPemesanan);
        app.get('/pembelian/statuspemesanan',this.statusPemesanan);
        //app.get('/pembelian/keranjangbelanja/:id',checkAuth,this.keranjangBelanja);
        app.get('/pembelian/keranjangbelanja/:id',this.keranjangBelanja);
    },

    daftarTransaksiPembelian : function(req, res, next){
        res.render('',{

        });
    },
    insertKonfirmasiPembayaran : function(req, res, next){
        //TODO: update status transaksi menjadi lunas
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields){
            //tidak apa-apa diupload dengan nama file gambar yang sama
            models.Transaksi.update({
                tanggal_pembayaran : fields.tanggal_pembayaran,
                no_rekening : fields.no_rekening,
                nama_pemilik_rekening : fields.nama_pemilik_rekening,
                bankId : fields.bankId,
                gambar_bukti_pembayaran : fields.gambar_bukti_pembayaran,
                status : 1
            },{
                where: { id : fields.transaksiId }
            }).then(function() {
                res.redirect('/pembelian/konfirmasipembayaran/sukses');
            });
        });
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
            ]
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
    daftarPembelian : function(req, res, next){
        res.render('pc-view/pembelian/daftarPembelian', {
            tabMenu: 'Daftar Transaksi Pembelian',
        });
    },
    konfirmasiPembayaranSukses : function(req, res, next){
        res.render('pc-view/pembelian/konfirmasiPembayaranSukses', {
        });
    },
    //TODO: masih eror konfirmasi pembayaran
    konfirmasiPembayaran : function(req, res, next){
        models.Transaksi.findAll({
            where : {
                PenggunaId : res.locals.session.penggunaId,
                status : 0
            },
            include: [
                {
                    model: models.Invoice, include:
                    [models.Toko,models.Produk,{
                        model : models.Penerima, include :[
                            models.Provinsi,models.Kabupaten
                        ]
                    }]
                }
            ]
        }).then(function(transaksi) {
                models.Bank.findAll({
                }).then(function(bank) {
                    res.render('pc-view/pembelian/konfirmasiPembayaran', {
                        tabMenu: 'Konfirmasi Pembayaran',
                        daftarTransaksi : transaksi,
                        daftarBank : bank,
                        moment : moment
                    });
                });
        })

    },

    konfirmasiPenerimaan : function(req, res, next){
        res.render('pc-view/pembelian/konfirmasiPenerimaan', {
            tabMenu: 'Konfirmasi Penerimaan',
        });
    },

    statusPemesanan: function(req, res, next){
        //TODO: distatus pemesanan dipilih berdasarkan invoice, bukan per transaksi
        //TODO: satu invoice dapat memiliki banyak produk pada toko yang sama
        //TODO: cari beberapa halaman yang melibatkan invoice
        // karena akan ada perubahan invoice n-m ke invoice_transaksi
        models.Transaksi.findAll({
            where : {
                PenggunaId : res.locals.session.penggunaId,
                status : 1
            },
            include: [
                {
                    model: models.Invoice, include:
                    [models.Toko,models.Produk,{
                        model : models.Penerima, include :[
                            models.Provinsi,models.Kabupaten
                        ]
                    }]
                }
            ]
        }).then(function(transaksi){
            res.render('pc-view/pembelian/statusPemesanan', {
                tabMenu: 'Status Pemesanan',
                moment : moment,
                transaksi : transaksi
            })
        });
    },
};
