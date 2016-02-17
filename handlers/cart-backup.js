/**
 * Created by riansyahPC on 11/29/2015.
 */
var models  = require('../models');
var async  = require('async');
//method post dari halaman beliProduk.jade ke keranjang belanja
exports.tambahCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //TODO: buat pengondisian, kalau produk dibeli dari toko yang sama maka dianggap satu invoice
    //berarti isi cart yang sebelum-sebelumnya dicek,untuk memastikan tidak ada dari toko yang sama
    var status = 0;
    for(var val in cart){
        if(req.body.tokoId == cart[val].tokoId){
            cart[val].produk.push({
                id: req.body.produkId,jumlah : req.body.jumlah || 0,
                totalHargaBarang : req.body.totalHarga
            });
            status = 1;
        }
    }
    if(status == 0){
        cart.push({
            produk : [
                {id: req.body.produkId,jumlah : req.body.jumlah || 0,
                    totalHargaBarang : req.body.totalHarga}
            ],
            tokoId : req.body.tokoId,
            penerimaId : req.body.penerimaId,
            keterangan : req.body.keterangan || '-',
            nilaiSubTotal : req.body.nilaiSubTotal || 0
        });
    }
    // ke fungsi getCart
    res.redirect('/keranjang');
};

//app.get('/keranjang/', cart.getCart);
exports.getCartTest = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    var html = JSON.stringify(cart)+"<br> <a href='/produk/daftarbykategori/1'>belanja lagi</a>";
    res.send(html);
};
exports.getCart = function(req, res, next) {
    //TODO: keranjang suka error karena masalah toko yang undefined
    var cart = req.session.cart || (req.session.cart = []);
    var produkCart = [];
    var penerimaCart = [];
    var totalPembayaran = 0;
    for(val in cart){
        for(valPro in cart[val].produk){
            produkCart.push(cart[val].produk[valPro].id);
        }
        penerimaCart.push(cart[val].penggunaId);
        totalPembayaran = totalPembayaran+cart[val].nilaiSubTotal;
    }
    //masukan data penerima
    models.Produk.findAll({
        //TODO: produkcart masih  null
        where : {
            id : {$in: produkCart}
        },
        include: models.Toko
    }).then(function(produk) {

        models.Penerima.findAll({
            include: [models.Kabupaten,models.Provinsi]
        }).then(function(penerima) {
            //TODO: terdapat 2 penomoran index, dari array produk dan dari cart, jadi bingung?
            //solusinya data yang ada pada models.produk dimasukkan ke push ke cart(berupa gambar dan harga persatu produknya)
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
