/**
 * Created by riansyah on 4/22/2016.
 */
var models = require('../models');
var async = require('async');
//daftarProdukPembeli();
function daftarProdukPembeli(){
    models.Produk.findAll({
        where : {
            KategoriProdukId : 1
        },
        attributes: {exclude : ['EtalaseId'] },
        include: [{
            model: models.Toko, include :
                models.Kabupaten
        }]
    }).then(function(daftar_produk) {
        console.log(daftar_produk[0].Toko.Kabupaten.nama);
    })
}
