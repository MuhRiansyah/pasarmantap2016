/**
 * Created by riansyahPC on 11/29/2015.
 */
var models  = require('../models');
var async  = require('async');
exports.tambahCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    cart.push({
        produkId : req.body.produkId,
        penerimaId : req.body.penerimaId,
        keterangan : req.body.keterangan || '-',
        jumlah : req.body.jumlah || 0,
        nilaiSubTotal : req.body.nilaiSubTotal
    });
    // ke fungsi getCart
    res.redirect('/keranjang');
};

//app.get('/keranjang/', cart.getCart);
exports.getCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //var cart = [];
    cart.push({
        produkId : 2,
        tokoId : 1,
        penerimaId : 1,
        keterangan : req.body.keterangan || '-',
        jumlah : req.body.jumlah || 0,
        nilaiSubTotal : 100040
    });
    cart.push({
        produkId : 1,
        tokoId : 1,
        penerimaId : 1,
        keterangan : 'hati hati',
        jumlah : req.body.jumlah || 0,
        nilaiSubTotal : 100000
    });
    var produkCart = [];
    var penerimaCart = [];
    var totalPembayaran = 0;
    for(val in cart){
        produkCart.push(cart[val].produkId);
        penerimaCart.push(cart[val].penggunaId);
        totalPembayaran = totalPembayaran+cart[val].nilaiSubTotal;
    }
    //masukan data penerima
    models.Produk.findAll({
        where : {
            id : {$in: produkCart}
        },
        include: [models.Toko]
    }).then(function(produk) {
        models.Penerima.findAll({
            include: [models.Kabupaten,models.Provinsi]
        }).then(function(penerima) {
            res.render('pc-view/pembelian/keranjangBelanja', {
                produk : produk,
                penerima : penerima,
                totalPembayaran : totalPembayaran,
                cart : cart
            });
        })
    })
};
//app.post('/keranjang/konfirmasi', cart.konfirmasiPembelian);
exports.konfirmasiPembelian = function(req, res, next){
    res.render('pc-view/pembelian/konfirmasiPembelian', {
        total_tagihan : req.session.total_tagihan
    });
};

//app.post('/keranjang/simpan', cart.insertCartToInvoice);
exports.insertCartToInvoice = function(req, res, next) {
    var moment = require("moment");
    var now = moment();
    var jatuh_tempo = moment(now).add(3,'days');
    models.Transaksi.create({
        PenggunaId : res.locals.session.penggunaId,
        tanggal : moment(now).format('YYYY-MM-DD'),
        jatuh_tempo : moment(jatuh_tempo).format('YYYY-MM-DD'),
        total_tagihan : req.body.totalPembayaran
    }).then(function(transaksi){
        var cart = req.session.cart;
        var date = new Date();
        for(val in cart){
            //TODO: cari cara insert produkId ke invoice_produk
            models.Invoice.create({
                id : 'INV/'+Date.now()+'/'+date.getMilliseconds(),
                ProdukId : cart[val].produkId,
                TransaksiId : transaksi.id,
                TokoId : cart[val].tokoId,
                PenerimaId : cart[val].penerimaId,
                jumlah : cart[val].jumlah,
                nilaiSubtotal : cart[val].nilaiSubtotal
            }).then(function(){
                req.session.total_tagihan = req.body.totalPembayaran;
                res.redirect('/keranjang/konfirmasi');
            })
        }
    });
};
