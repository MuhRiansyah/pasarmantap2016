/**
 * Created by riansyahPC on 11/29/2015.
 */
var models  = require('../models');
var async  = require('async');
//method post dari halaman beliProduk.jade ke keranjang belanja
exports.tambahCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //TODO: cek juga jika produk dikirim untuk penerima yang beda walaupun dibeli dari toko yang sama
    var status = 0;
    for(var val in cart){
        if(req.body.tokoId == cart[val].Toko[0].id &&
            req.body.penerimaId == cart[val].Penerima[0].id){
            var totalHarga = parseInt(req.body.jumlah) * parseInt(req.body.hargaProduk);
            cart[val].Produk.push({
                id: req.body.produkId, jumlah : req.body.jumlah || 0,
                totalHargaBarang : totalHarga,
                nama : req.body.namaProduk,
                harga : req.body.hargaProduk,
                gambar : req.body.gambarProduk
            });
            status = 1;
        }
    }
    if(status == 0){
        var totalHarga = parseInt(req.body.jumlah) * parseInt(req.body.hargaProduk);
        cart.push({
            id : Date.now(),
            Produk : [
                {id: req.body.produkId, jumlah : req.body.jumlah || 0,
                    totalHargaBarang : totalHarga,
                    nama : req.body.namaProduk,
                    harga : req.body.hargaProduk,
                    gambar : req.body.gambarProduk
                }
            ],
            Toko : [{
                id : req.body.tokoId, nama : req.body.namaToko
            }],
            Penerima :[{
                id : req.body.penerimaId, nama : req.body.namaPenerima,
                alamat : req.body.alamat, kecamatan : req.body.kecamatan,
                Provinsi : [{id : req.body.idProvinsi ,nama : req.body.namaProvinsi }],
                Kabupaten : [{id : req.body.idKabupaten ,nama : req.body.namaKabupaten,
                    kodePos :  req.body.kodePos}],
                telepon : req.body.telepon
            }],
            keterangan : req.body.keterangan || '-',
            //nilai akhir subtotal jika ada pertambahan produk lagi
            ongkosKirim : req.body.ongkosKirim || 0,
            totalPerTagihan : 0,
            nilaiSubTotal : 0
        });
    }
    // ke fungsi getCart
    res.redirect('/keranjang');
};


exports.hapusSemuaProdukCart = function(req, res, next) {
    delete req.session.cart;
    res.redirect('/keranjang/');
};
exports.hapusSemuaPertagihan = function(req, res, next) {
    var cart =  req.session.cart;
    for(var val in cart){
        if(cart[val].id == req.params.cartId){
            cart.splice(val,(val+1) );
        }
    }
    res.redirect('/keranjang/');
};
exports.hapusSatuProdukCart = function(req, res, next) {
    var cart =  req.session.cart;
    for(var val in cart){
        for(var valPro in cart[val].Produk){
            if(req.params.produkId == cart[val].Produk[valPro].id){
                if(cart[val].Produk.length == 1){
                    cart.splice(val,(val+1) );
                }else{
                    cart[val].Produk.splice(valPro,(valPro+1));
                }
            }
        }
    }
    res.redirect('/keranjang/');
};
exports.getCart1 = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    var html = JSON.stringify(cart)+"<br> <a href='/produk/daftarbykategori/1'>belanja lagi</a>";
    res.send(html);
};
//app.get('/keranjang/', cart.getCart);
exports.getCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //todo: terjadi penambahan tiap kali refresh,jangan disimpan di session
    var totalPembayaran = 0;
    var totalPerTagihan = [];

    for(var val in cart){
        var cartArr = cart[val];
        totalPerTagihan[val] = 0;
        for(var valPro in cartArr.Produk){
            var produkDalamTagihan = cartArr.Produk;
            totalPerTagihan[val] = totalPerTagihan[val] +
                parseInt( produkDalamTagihan[valPro].totalHargaBarang );
            if(valPro == (produkDalamTagihan.length - 1) ){
                totalPerTagihan[val] = totalPerTagihan[val]+
                    parseInt(cartArr.ongkosKirim);
            }
        }
        //console.log('tagihan '+val+' - '+totalPerTagihan[val]);
        totalPembayaran = totalPembayaran + totalPerTagihan[val];
    }
    res.render('pc-view/pembelian/keranjangBelanja', {
        totalPerTagihan : totalPerTagihan,
        totalPembayaran : totalPembayaran,
        cart : cart
    });
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
                TokoId : cart[val].Toko[0].id,
                PenerimaId : cart[val].Penerima[0].id,
                jumlah : cart[val].jumlah,
                nilaiSubtotal : cart[val].nilaiSubtotal
            }).then(function(){
                req.session.total_tagihan = req.body.totalPembayaran;
                res.redirect('/keranjang/konfirmasi');
            })
        }
    });
};
