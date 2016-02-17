/**
 * Created by riansyahPC on 11/23/2015.
 */
var models  = require('../models');
var async  = require('async');

var formidable = require('formidable');


var credentials = require('../api/credentials.js');
var ongkir = require('../api/rajaOngkir')({
    key: credentials.rajaOngkir.key,
});
//pembuat cache, data disimpan selama 1 jam
//var provinsis = {
//    lastRefreshed: 0,
//    refreshInterval: 15 * 60 * 1000,
//    listProvinsi : []
//};

module.exports = {

    registerRoutes: function(app,checkAuth) {
        //ada daftar produk untuk penjual ada untuk pembelian

        //fitur untuk pembeli
        app.get('/produk/daftarbykategori/:idKategori',this.daftarByKategori);
        app.get('/produk/detail/:id',this.detailProduk);
        //nanti menggunakan otentifikasi
        app.get('/produk/beli/:idProduk',this.beliProduk);
        app.get('/produk/tambahpenerima/:idProduk/',this.formTambahPenerima);
        app.post('/produk/tambahpenerima/insert/',this.insertPenerima);

        //fitur untuk penjual
        //app.get('/produk/tambah',checkAuth,this.tambahProduk);
        app.get('/produk/tambah',this.formTambahProduk);
        app.post('/produk/insert',this.insertProduk);
        //app.get('/produk/daftar',checkAuth,this.daftarProduk);
        app.get('/produk/daftar',this.daftarProduk);
        //app.get('/produk/wishlist',checkAuth,this.getWishList);
        app.get('/produk/wishlist',this.getWishList);
    },
    formTambahPenerima : function(req,res,next){
        models.Provinsi.findAll().then(function(provinsi) {
            models.Toko.find({
                include: [
                    { model: models.Produk, where : {id : req.params.idProduk},as:'Produk'},
                    models.Kabupaten
                ]
            }).then(function(toko) {
                res.render('pc-view/produk/tambahPenerima',{
                    idProduk : req.params.idProduk,
                    listProvinsi : provinsi,
                    toko : toko
                })
            });
        })
    },
    insertPenerima : function(req,res,next){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields) {
            models.Penerima.create({
                jenis_alamat : fields.jenis_alamat,
                PenggunaId : fields.penggunaId,
                nama : fields.nama,
                telepon : fields.telepon,
                ProvinsiId : fields.provinsiId,
                KabupatenId : fields.kabupatenId,
                kecamatan : fields.kecamatan,
                alamat : fields.alamat
            }).then(function () {
                res.redirect('/produk/beli/' + fields.idproduk)
            });
        })
    },
    insertProduk : function(req,res,next){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields){
            //tidak apa-apa diupload dengan nama file gambar yang sama
            // buat pengondisian untuk tidak memasukan selain file .JPG, .PNG
            models.Etalase.find({
                where :{tokoId:res.locals.session.tokoId}
            }).then(function (etalase) {
                models.Produk.create({
                    nama : fields.nama,
                    harga : fields.nilaiHarga,
                    stok : fields.stok,
                    berat : fields.berat,
                    gambar : fields.gambar,
                    kondisi : fields.kondisi,
                    deskripsi : fields.deskripsi,
                    KategoriProdukId : fields.kategori,
                    //saat di create,produk otomatis menjadi etalase pertama milik toko,based on session id pengguna
                    EtalaseId : etalase.id,
                    TokoId : res.locals.session.tokoId
                }).then(function() {
                    res.redirect('/produk/tambah');
                });
            });
        });
    },
    getWishList: function(req,res,next){
        models.Wishlist.findAll({
            include : models.Produk
        }).then(function(wishList) {
            res.render('pc-view/produk/daftarWishlist',{
                wishList : wishList
            })
        })
    },
    daftarByKategori : function(req, res, next){
        async.series([
                function(callback){
                    models.Kategori_Produk.find({
                        where : {
                            id : req.params.idKategori
                        },
                        attributes: ['kategori','deskripsi']
                    }).then(function(kategori_produk) {
                            callback(null,kategori_produk);
                    })
                },
                function(callback){
                    models.Produk.findAll({
                        where : {
                            KategoriProdukId : req.params.idKategori
                        },
                        attributes: {exclude : ['EtalaseId'] }
                    }).then(function(daftar_produk) {
                        callback(null,daftar_produk);
                    })
                }
            ],
            function(err,result){
                res.render('pc-view/produk/daftarProdukPembeli',{
                    kategori_produk : result[0],
                    daftar_produk : result[1]
                })
            }
        )
    },

    daftarByKategoriMobile : function(req, res, next){
        async.series([
                function(callback){
                    models.Kategori_Produk.find({
                        where : {
                            id : req.params.idKategori
                        },
                        attributes: ['kategori']
                    }).then(function(kategori_produk) {
                            callback(null,kategori_produk);
                    })
                },
                function(callback){
                    models.Produk.findAll({
                        where : {
                            KategoriProdukId : req.params.idKategori
                        },
                        attributes: {exclude : ['EtalaseId'] }
                    }).then(function(daftar_produk) {
                        callback(null,daftar_produk);
                    })
                }
            ],
            function(err,result){
                res.render('mobile/produk/daftarProdukPembeli',{
                    kategori_produk : result[0],
                    daftar_produk : result[1]
                })
            }
        )
    },


    beliProduk : function(req, res, next){
        var stack = {};
        stack.getPenerima = function(callback){
            models.Penerima.findAll({
                include: [
                    models.Provinsi,models.Kabupaten
                ],
                where : {penggunaId : res.locals.session.penggunaId}
            }).then(function(penerima) {
                callback(null,penerima);
            })
        };
        stack.getToko = function(callback){
            models.Toko.find({
                include: [
                    { model: models.Produk, where : {id : req.params.idProduk},as:'Produk',
                        include : [models.Kategori_Produk] },
                    models.Kabupaten
                ],
                attributes: {exclude : ['deskripsi'] }
            }).then(function(toko) {
                callback(null,toko);
            })
        };
        stack.getListProvinsi = function(callback){
            models.Provinsi.findAll().
                then(function(provinsi) {
                    callback(null,provinsi);
                })
        };
        async.parallel(stack,function(err,result){
            var beratProduk = result.getToko.Produk[0].berat;
            var idKotaTokoPenjual = result.getToko.Kabupaten.id;
            var idKotaPenerima = result.getPenerima[0].Kabupaten.id;
            //TODO: saat pengujian selesai gunakan yang versi API ini (juga kembalikan fungsi yang ada di main.getOngkir)
            //ongkir.getOngkosKirim(
            ongkir.getOngkosKirimOffline(
                idKotaTokoPenjual,idKotaPenerima,beratProduk,
                function(ongkosKirim){
                    var subTotal = ongkosKirim + result.getToko.Produk[0].harga;
                    res.render('pc-view/produk/beliProduk',{
                        toko : result.getToko,
                        penerima : result.getPenerima,
                        listProvinsi : result.getListProvinsi,
                        ongkosKirim : ongkosKirim,
                        subTotal : subTotal
                    });
                }
            );
        });
    },
    detailProduk : function(req, res, next){
        //stack.getPenerima = function(callback){
        //    models.Penerima.findAll({
        //        include: [
        //            models.Provinsi,models.Kabupaten
        //        ],
        //        where : {penggunaId : res.locals.session.penggunaId}
        //    }).then(function(penerima) {
        //        callback(null,penerima);
        //    })
        //};
        //stack.getListProvinsi = function(callback){
        //    models.Provinsi.findAll().
        //        then(function(provinsi) {
        //        callback(null,provinsi);
        //    })
        //};
        //API provinsi dari rajaongkir
        //stack.getListProvinsi = function(callback){
        //    if(Date.now() < provinsis.lastRefreshed + provinsis.refreshInterval)
        //        return callback(null,provinsis.listProvinsi);
        //    ongkir.getListProvinsi(function(result){
        //        provinsis.lastRefreshed = Date.now();
        //        provinsis.listProvinsi = result
        //        callback(null,provinsis.listProvinsi);
        //    });
        //};
        var stack = {};
        stack.getTokoDanProduk = function(callback){
            models.Produk.find({
                include: [
                    { model: models.Toko,
                        include : [models.Kabupaten] },
                    models.Kategori_Produk
                ],
                where : {id : req.params.id}
            }).then(function(toko) {
                callback(null,toko);
            })
        };
        stack.getJumlahTerjual = function(callback){
            models.Invoice_Produk.sum('jumlah_produk',
                {where : {produkId :req.params.id}})
                .then(function(jumlah_terjual) {
                    callback(null,jumlah_terjual);
                })
        };
        async.parallel(stack,function(err,result){
            res.render('pc-view/produk/detailProduk',{
                produk : result.getTokoDanProduk,
                jumlah_terjual : result.getJumlahTerjual

                //data penerima diambil saat masih menggunakan modal
                //penerima : result.getPenerima,

                //jika eror, itu karena beberapa daerah tidak bisa dilayani POS(ex:daerah lampung)
                //cari cara error handling di node js
                //data provinsi diambil saat masih menggunakan modal
                //listProvinsi : result.getListProvinsi
            });
        });
    },
    detailProdukMobile : function(req, res, next){
        async.parallel([
                function(callback){
                    models.Toko.find({
                        include: [
                            { model: models.Produk, where : {id : req.params.id},as:'Produk',
                                include : [models.Kategori_Produk] },
                            models.Kabupaten
                        ]
                        //attributes: {exclude : ['Toko.deskripsi'] }
                    }).then(function(toko) {
                        callback(null,toko);
                    })
                },
                function(callback){
                    models.Provinsi.findAll()
                        .then(function(provinsi) {
                            callback(null,provinsi);
                        })
                }
            ],
            function(err,result){
                res.render('mobile/produk/detailProduk',{
                    toko : result[0],
                    provinsi : result[1]
                });
            }
        )
    },

    formTambahProduk : function(req, res, next){
        models.Kategori_Produk.findAll()
            .then(function(kategori_produk) {
                res.render('pc-view/produk/tambahProduk',{
                    kategori_produk : kategori_produk
                });
            })
    },

    daftarProduk : function(req, res, next){
        async.parallel([
                function(callback){
                    models.Produk.findAll({
                        where : {
                            TokoId : 1
                        },
                        include: [models.Kategori_Produk],
                        attributes: ['Kategori_Produk.id','Kategori_Produk.kategori'],
                        group : 'Kategori_Produk.id',
                    }).then(function(kategori_produk) {
                            callback(null,kategori_produk);
                        })
                },
                function(callback){
                    models.Etalase.findAll({
                        where : {
                            TokoId : res.locals.session.tokoId
                        }
                    }).then(function(etalase) {
                            callback(null,etalase);
                        })
                },
                function(callback){
                    // kalau tidak nyambung etalaseId di table produk dengan etalase ditable etalase (yang terhubung ke tokoId)
                    // maka jadi null dan eror nama etalasenya
                    models.Produk.findAll({
                        where : {
                            TokoId : 1
                        },
                        include: [models.Kategori_Produk,models.Etalase],
                        attributes: {exclude : ['tokoId','EtalaseId'] }
                    }).then(function(daftar_produk) {
                        console.log(daftar_produk);
                        callback(null,daftar_produk);
                    })
                }
            ],
            function(err,result){
                res.render('pc-view/produk/daftarProduk',{
                    kategori_produk : result[0],
                    etalase : result[1],
                    daftar_produk : result[2]
                })
            }
        )
    },
    cekTambah : function(req, res, next){
    },

};
