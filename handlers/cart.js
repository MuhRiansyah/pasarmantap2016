/**
 * Created by riansyahPC on 11/29/2015.
 */
var models  = require('../models');
exports.tambahCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    //masalahnya, bagaimana kalau yang belum buat alamat penerima baru?
    //apa yang akan dipush?? jadi tetap disimpan alamat penerima di session
    //walaupun alamat sudah terdaftar, diretrieve aja dari database
    // terus dijadikan value pada inputan form
    models.Provinsi.find({
        where : {id: req.body.idProvinsi}
    }).then(function(provinsi){
        models.Kabupaten.find({
            where : {id: req.body.idKabupaten}
        }).then(function(kabupaten){
            models.Kecamatan.find({
                where : {id: req.body.idKecamatan}
            }).then(function(kecamatan){
                cart.push({
                    idProduk : req.body.idProduk,
                    jumlah : req.body.jumlah || 0,
                    totalHarga : req.body.totalHarga,
                    //idPenerima : req.body.idPenerima,
                    idProvinsi : req.body.idProvinsi,
                    provinsi : provinsi.nama,
                    idKabupaten : req.body.idKabupaten,
                    kabupaten : kabupaten.nama,
                    idKecamatan : req.body.idKecamatan,
                    kecamatan : kecamatan.nama,
                    alamat : req.body.alamat,
                    telepon : req.body.telepon,
                    kode_pos : req.body.kode_pos,
                    nama : req.body.nama,
                });
                res.redirect('/keranjang');
            })
        })
    });


    // buat pengondisian jika sudah punya alamat, tampilkan alamat,jika belum tampilkan form

};
exports.insertCartToInvoice = function(req, res, next) {
    // saat cart di insert ke invoice, field transaksi baru juga dicreate(beserta jatuh tempo dan total tagihan)
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
}
exports.getCart = function(req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    models.Produk.find({
        where : {
            id : cart[0].idProduk
        },
        include: [models.Toko]
    }).then(function(produk) {
        res.render('pc-view/pembelian/keranjangBelanja', {
            produk : produk
        });
    })
};
