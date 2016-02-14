/**
 * Created by riansyahPC on 1/4/2016.
 */
var models = require('../models');
var async = require('async');
var credentials = require('../api/credentials.js');
var moment = require("moment");
var ongkir = require('../api/rajaOngkir')({
    key: credentials.rajaOngkir.key
});

exports.test = function (test) {
    //detailProduk(test)
    //jumlahTerjual(test)
    //produkMilikToko(test)
    //profilTokoAsync(test);
    //getPenerima(test);
    //daftarProduk(test);
    //kategoriProdukMilikToko(test);
    //beliPrroduk(test);
    //getToko(test);
    //getOngkir(test);
    //pengaturanToko(test);
    //getCart(test);
    //postCartToInvoice(test);
    //konfirmasiPembayaran(test);
    //hotlist(test);
    statusPemesanan(test);
};
function statusPemesanan(test){
    //masih salah
    models.Transaksi.findAll({
        where : {
            PenggunaId : 1,
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
        for(indexTrans in transaksi){
            console.log(transaksi[indexTrans].id);
            for(indexInv in transaksi[indexTrans].Invoices){
                var invoice = transaksi[indexTrans].Invoices[indexInv];
                console.log(invoice.id);
                for(indexPro in invoice.Produks){
                    var produk = invoice.Produks[indexPro];
                    console.log(indexPro+' - '+produk.nama);
                }
            }
        }

        test.done();
    });
}
var sequelize = require("sequelize");
function hotlist(test){
    async.parallel([
            function(callback){
                models.Invoice.findAll({
                    attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
                    limit : '3',
                    //order : 'id DESC',
                    include : models.Produk,
                    group : 'produkId',
                    order : [ [sequelize.fn('sum',sequelize.col('jumlah')),'DESC'] ]
                }).then(function(produk) {
                    callback(null,produk);
                })
            },
            function(callback){
                models.Kategori_Produk.findAll({
                    attributes : {exclude :['deskripsi']}
                }).then(function(kategori_produk) {
                    callback(null,kategori_produk);
                })
            }
        ],
        function(err,result){
            //TODO: hasilnya kosong
            console.log(result[0]);
            test.done();
        }
    )
}
function konfirmasiPembayaran(test){
    models.Transaksi.findAll({
        where : { PenggunaId : 1 },
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
       console.log(transaksi[0].Invoices[0].Produk);
       test.done()
    });
}
function postCartToInvoice(test){
    var cart = [];
    cart.push({
        produkId : 2,
        penerimaId : 1,
        keterangan : '-',
        jumlah : 20,
        nilaiSubTotal : 100040
    });
    cart.push({
        produkId : 1,
        penerimaId : 1,
        keterangan : 'hati hati',
        jumlah : 10,
        nilaiSubTotal : 100000
    });

    var stack = {};
    var now = moment();
    var jatuh_tempo = moment(now).add(3,'days');
        models.Transaksi.create({
            PenggunaId : 1,
            tanggal : moment(now).format('YYYY-MM-DD'),
            jatuh_tempo : moment(jatuh_tempo).format('YYYY-MM-DD'),
            total_tagihan : 100000000
        }).then(
            function(transaksi){
                for(val in cart){
                    models.Invoice.create({
                        ProdukId : cart[val].produkId,
                        //TODO:cara mengambil nilai transaksi yang telah dipost sebelumnya?
                        TransaksiId : transaksi.id,
                        TokoId : 1,
                        PenerimaId : cart[val].penerimaId,
                        jumlah : cart[val].jumlah,
                        nilaiSubtotal : cart[val].nilaiSubtotal
                    }).then(function(){
                        console.log(val+' - '+cart.length);
                        test.done();
                        //if((val+2) == cart.length){
                        //    console.log(val+' - '+cart.length)
                        //    //habis ini di redirect ke halaman konfirmasi
                        //    test.done();
                        //}
                    })
                }
        });
}
function getCart(test){
    var cart = [];
    cart.push({
        produkId : 1
    });
    cart.push({
        produkId : 2
    });
    var cart1 = [];
    for(val in cart){
        cart1.push(cart[val].produkId);
    }
    models.Produk.findAll({
        where : {
            id : {$in: cart1}
        },
        include: [models.Toko]
    }).then(function(produk) {
        console.log(produk);
        test.done();
    });
}
function pengaturanToko(test){
    models.Produk.findAndCountAll({
        include : models.Etalase,
        group   : 'etalaseId',
        where   : {tokoId:'1'}
    }).then(function(produk){
        console.log(produk.count);
        console.log(produk.rows);
        console.log(produk.rows[0].Etalase.nama+' - '+produk.count[0].count);
        console.log(produk.rows[1].Etalase.nama+' - '+produk.count[1].count);
        test.done()
    });
}
function getOngkir(test){
    models.Toko.find({
        where:{id:'1'}
    }).then(function(toko){
        models.Produk.find({
            where:{id:'1'}
        }).then(function(produk){
            console.log(produk.berat);
            console.log(toko.KabupatenId);
            ongkir.getOngkosKirim(
                toko.KabupatenId,'1',produk.berat,
                function(ongkosKirim){
                    console.log('============')
                    console.log(ongkosKirim);
                    test.done();
                });
        });
    });
}
function getToko(test){
    models.Toko.find({
        include: [
            { model: models.Produk, where : {id : '1'},as:'Produk',
                include : [models.Kategori_Produk] },
            models.Kabupaten
        ]
    }).then(function(toko) {
        console.log(toko.Kabupaten.nama);
        test.done();
    })
}
function beliProduk(test){

}

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
            nama : 'kendari'
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
