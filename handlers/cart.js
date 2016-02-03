/**
 * Created by riansyahPC on 11/29/2015.
 */
var models  = require('../models');
exports.tambahCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //TODO: walaupun alamat sudah terdaftar, diretrieve aja dari database terus dijadikan value pada inputan form
    //select id kabupaten penerima dan pengirim,lalu ambil biaya ongkir lewat library ongkir
    cart.push({
        produkId : req.body.produkId,
        penerimaId : req.body.penerimaId,
        keterangan : req.body.keterangan || '-',
        jumlah : req.body.jumlah || 0,
        //TODO: buat sum untuk seluruh subtotal harga yang ada di cart
        nilaiSubTotal : req.body.nilaiSubTotal
    });
    // ke fungsi getCart
    res.redirect('/keranjang');
};
exports.getCart = function(req, res, next) {
    //var cart = req.session.cart || (req.session.cart = []);
    var cart = [];
    cart.push({
        produkId : 2,
        penerimaId : 1,
        keterangan : req.body.keterangan || '-',
        jumlah : req.body.jumlah || 0,
        //TODO: buat sum untuk seluruh subtotal harga yang ada di cart
        nilaiSubTotal : 100040
    });
    cart.push({
        produkId : 1,
        penerimaId : 1,
        keterangan : 'hati hati',
        jumlah : req.body.jumlah || 0,
        //TODO: buat sum untuk seluruh subtotal harga yang ada di cart
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

exports.insertCartToInvoice = function(req, res, next) {
    //TODO: saat cart di insert ke invoice, field transaksi baru juga dicreate(beserta jatuh tempo dan total tagihan)
    //proses create alamat penerima baru di post cart (disini)
    // nanti dicek where id penerima, kalau id penerima nya sudah ada di database maka tak usah di create penerima ini
    // kalau belum ada di create saja
    models.Penerima.find({
        where : {id :req.body.penerimaId}
    }).then(function(penerima) {
        if (penerima) {

        } else {
            models.Penerima.create({
                //status : 0,
                //tanggal : today,
            }).then(function () {
                res.redirect('/checkout');
            });
        }
    });
};
