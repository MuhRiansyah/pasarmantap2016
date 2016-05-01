/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var sequelize = require("sequelize");
var moment = require("moment");
var formidable = require('formidable');
module.exports = {

    registerRoutes: function(app,checkAuth) {
        app.get('/pembelian/daftartransaksi',checkAuth,this.daftarTransaksiPembelian);
        app.get('/pembelian/konfirmasipembayaran',checkAuth,this.konfirmasiPembayaran);
        app.post('/pembelian/konfirmasipembayaran/post',checkAuth,this.postKonfirmasiPembayaran);
        app.get('/pembelian/konfirmasipembayaran/sukses',this.konfirmasiPembayaranSukses);
        //destroy session total_harga
        app.post('/pembelian/konfirmasipembayaran/sukses/post',this.postKonfirmasiPembayaranSukses);
        app.get('/pembelian/konfirmasipenerimaan',checkAuth,this.konfirmasiPenerimaan);
        app.get('/pembelian/statuspemesanan',checkAuth,this.statusPemesanan);
    },

    daftarTransaksiPembelian : function(req, res, next){
        models.Invoice.findAll({
            where : {
                //pembeliId : res.locals.session.penggunaId,
                //testing seolah ini pengguna dengan userid 2, kalau sudah fix dikembalikan lagi berdasarkan session
                pembeliId : res.locals.session.penggunaId,
                status_tampil : {$gt : 0, $lt : 8}
            },
            include: [
                models.Pengguna,models.Toko,models.Produk,
                { model:models.Status,order : ['waktu']},
                {model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(invoice){
            //res.send(Invoice);
            res.render('pc-view/pembelian/daftarTransaksiPembelian', {
                tabMenu: 'Daftar Transaksi Pembelian',
                moment : moment,
                Invoice :  invoice
            })
        });
    },
    postKonfirmasiPembayaran : function(req, res, next){
        //TODO: update status Invoice menjadi lunas
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields){
            //tidak apa-apa diupload dengan nama file gambar yang sama
            models.Invoice.update({
                tanggal_pembayaran : fields.tanggal_pembayaran,
                no_rekening : fields.no_rekening,
                nama_pemilik_rekening : fields.nama_pemilik_rekening,
                bankId : fields.bankId,
                gambar_bukti_pembayaran : fields.gambar_bukti_pembayaran,
                //status_tampil dan status id selalu berselisih 1
                status_tampil : 2
            },{
                where: { id : fields.invoiceId }
            }).then(function() {
                var now = moment();
                models.Invoice_Status.create({
                    invoiceId : fields.invoiceId,
                    statusId : 1,
                    waktu : moment(now).format('YYYY-MM-DD HH:mm')
                }).then(function() {
                    req.session.total_harga = fields.total_harga;
                    res.redirect('/pembelian/konfirmasipembayaran/sukses');
                })
            });
        });
    },
    // keranjangBelanja : function(req, res, next){
    //     models.Produk.find({
    //         where : {
    //             id : req.params.id
    //         },
    //         include: [
    //             { model: models.Etalase, include: [
    //                 { model: models.Toko }
    //             ]}
    //         ]
    //         //attributes: ['kategori','deskripsi']
    //     }).then(function(produk) {
    //         res.render('pc-view/pembelian/keranjangBelanja', {
    //            produk : produk
    //         });
    //     })
    // },
    simpanBelanjaan : function(req, res, next){
        //buat sesi untuk menyimpan data belanjaan pembeli, nanti sesinya didestroy kalau udah disimpan ke database
        res.send('jos');
        //redirect('/pembelian/konfirmasipembelian/');
    },
    daftarPembelian : function(req, res, next){
        res.render('pc-view/pembelian/daftarPembelian', {
            tabMenu: 'Daftar Invoice Pembelian',
        });
    },
    postKonfirmasiPembayaranSukses : function(req, res, next){
        delete req.session.total_harga;
        res.redirect('/pembelian/statuspemesanan');
    },
    konfirmasiPembayaranSukses : function(req, res, next){
        res.render('pc-view/pembelian/konfirmasiPembayaranSukses', {
            total_harga : req.session.total_harga
        });
    },
    //TODO: masih eror konfirmasi pembayaran
    konfirmasiPembayaran : function(req, res, next){
        models.Invoice.findAll({
            where : {
                pembeliId : res.locals.session.penggunaId,
                //begitu sudah dikonfirmasi, invoice tidak tampil lagi dihalaman konfirmasi pembayaran
                status_tampil : 1
            },
            include: [
                models.Pengguna,models.Toko,models.Produk,
                { model : models.Penerima, include :[
                    models.Provinsi,models.Kabupaten
                ]
                }]
        }).then(function(Invoice) {
            models.Bank.findAll({
            }).then(function(bank) {
                res.render('pc-view/pembelian/konfirmasiPembayaran', {
                    tabMenu: 'Konfirmasi Pembayaran',
                    daftarInvoice : Invoice,
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
        models.Invoice.findAll({
            where : {
                //pembeliId : res.locals.session.penggunaId,
                //testing seolah ini pengguna dengan userid 2, kalau sudah fix dikembalikan lagi berdasarkan session
                pembeliId : 1,
                //status_tampil > 0 && status_tampil < 7
                status_tampil : {$gt: 0, $lt: 7 }
            },
            include: [
                    models.Pengguna,models.Toko,models.Produk,
                    {model:models.Status,order : ['waktu']},
                    {model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(Invoice){
            //res.send(Invoice);
            res.render('pc-view/pembelian/statusPemesanan', {
                tabMenu: 'Status Pemesanan',
                moment : moment,
                Invoice : Invoice
            })
        });
    },
};
