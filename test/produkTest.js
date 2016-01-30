/**
 * Created by riansyahPC on 1/4/2016.
 */
var models = require('../models');
var async = require('async');

exports.test = function (test) {
    //detailProduk(test)
    //jumlahTerjual(test)
    //produkMilikToko(test)
    //profilTokoAsync(test);
    //getPenerima(test);
    //daftarProduk(test);
    //kategoriProdukMilikToko(test);
};
function kategoriProdukMilikToko(test){
    models.Produk.findAll({
        where : {
            TokoId : 1
        },
        include: [models.Kategori_Produk],
        attributes: ['Kategori_Produk.id','Kategori_Produk.kategori'],
        group : 'Kategori_Produk.id',
    }).then(function(result){
        console.log(result);
        test.done();
    })
}
function daftarProduk(test){
    models.Produk.findAll({
        where : {
            TokoId : 1
        },
        include: [models.Kategori_Produk,models.Etalase],
        attributes: {exclude : ['tokoId','EtalaseId'] }
    }).then(function(produk){
        console.log(produk);
        test.done();
    })
}
function getPenerima(test){
    models.Penerima.find({
        include: [
            models.Provinsi,models.Kabupaten
        ],
        //nanti diganti session pengguna
        where : {penggunaId : '1'}
    }).then(function(penerima) {
        console.log(penerima.Kabupaten.nama);
        test.done();
    })
}
function insertProvinsi(test){
    var stack = {};
    stack.insertProvinsi = function(callback){
        models.Provinsi.create({
            id : 3222,
            nama : 'kendari',
        }).then(function() {
            models.Provinsi.findAndCountAll()
                .then(function(result){
                    console.log('total baris provinsi : '+result.count);
                    callback(null);
                })
        });
    };
    stack.insertKabupaten = function(callback){
        models.Kabupaten.create({
            id : 221,
            nama : 'kendari',
        }).then(function() {
            models.Provinsi.findAndCountAll()
                .then(function(result){
                    console.log('total baris kabupaten : '+result.count);
                    callback(null);
                })
        });
    };
    async.series(stack,function(err){
        test.done();
    });

}
function profilTokoAsync(test){
    var stack = {};
    stack.getToko = function(callback){
        models.Toko.find({
            include: [
                { model: models.Produk,as:'Produk',where : {etalaseId :'1'},
                    include : models.Etalase
                }
            ],
            where : { id : '1' }
        }).then(function(toko) {
            callback(null,toko);
        })
    }
    stack.getEtalase = function(callback){
        models.Etalase.find().then(function(etalase) {
            callback(null,etalase);
        })
    }
    async.series(stack,function(err,result){
        console.log(result.getToko.Produk[0].Etalase.nama);
        test.done();
    });

}

function produkMilikToko(test){
    models.Toko.find({
        include: [
            { model: models.Produk,as:'Produk',where : {etalaseId :'1'},
                include : models.Etalase
            }
        ],
        where : { id : '1' }
    }).then(function(toko) {
        models.Invoice.sum('jumlah',{where : {tokoId :'2'}})
            .then(function(produkTerjual){
            //console.log(toko.Produk[0].Etalase.nama);
            console.log(produkTerjual);
            //console.log(toko);
            test.done();
        });

    })
}
function jumlahTerjual(test){
    models.Invoice.sum('jumlah',{where : {produkId :'1'}})
        .then(function(jumlah_terjual) {
            console.log(jumlah_terjual);
            test.done();
        })
}
function detailProduk(test){
    models.Toko.find({
        include: [
            { model: models.Produk, where : {id : '1'},as:'Produk',
                include : [models.Kategori_Produk]
            }
        ],
        attributes: {exclude : ['Toko.deskripsi'] }
    }).then(function(Toko) {
        console.log(Toko.Produk[0].Kategori_Produk.kategori);
        console.log('---------');
        console.log(Toko.Produk[0]);
        test.done();
    })
}
