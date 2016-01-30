var models  = require('../models');
var async  = require('async');
var sequelize = require("sequelize");



exports.baru= function(req, res) {
	res.render('baru',{
	})
}

exports.utamaMobile = function(req, res){
	async.series([
			function(callback){
				models.Invoice.findAll({
					attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
					limit : '3',
					order : 'id DESC',
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
			res.render('mobile/index',{
				hotlist : result[0],
				kategori_produk : result[1]
			})
		}
	)
}

exports.utama= function(req, res){
		async.series([
				function(callback){
					models.Invoice.findAll({
						attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
						limit : '3',
						order : 'id DESC',
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
				res.render('index',{
					hotlist : result[0],
					kategori_produk : result[1]
				})
			}
		)
};

exports.berandaMobile = function(req, res){
	//mengambil daftar produk terlaris
	models.Invoice.findAll({
		attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
		limit : '3',
		order : 'id DESC',
		include : models.Produk,
		group : 'produkId',
		order : [ [sequelize.fn('sum',sequelize.col('jumlah')),'DESC'] ]
	}).then(function(produkTerlaris) {
		//mengambil wish list
		models.Wishlist.findAll({
			include : models.Produk
		}).then(function(wishList) {
			//mengambil toko favorit
			models.Toko_Favorit.findAll({
				include : models.Toko
			}).then(function(tokoFavorit) {
				//pc-view id diganti sesuai sesi
				//mengambil produk rekomendasi toko favorit
				//harus disusun dari tabel child hingga ke parrentnya
				models.Produk.findAll({
					include : [
						{ model: models.Etalase,
							include : [{model : models.Toko_Favorit,where : {PenggunaId : 1},required : false }]
						}]
					//attributes : ['Toko.Etalases.Produks.nama'],
				}).then(function(rekomendasi) {
					models.Kategori_Produk.findAll({
						attributes : {exclude :['deskripsi']}
					}).then(function(kategori_produk) {
						res.render('mobile/pc-view/beranda',{
							kategori_produk : kategori_produk,
							hotlist : produkTerlaris,
							rekomendasiTokoFavorit : rekomendasi,
							tokoFavorit : tokoFavorit,
							wishList : wishList
						})
					})
				})
			})
		})
	})
};

exports.beranda = function(req, res){
	async.series([
			function(callback){
				models.Invoice.findAll({
					attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
					limit : '3',
					order : 'id DESC',
					include : models.Produk,
					group : 'produkId',
					order : [ [sequelize.fn('sum',sequelize.col('jumlah')),'DESC'] ]
				}).then(function(produk) {
					callback(null,produk);
				})
			},
			function(callback){
				models.Invoice.findAll({
					attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
					limit : '3',
					order : 'id DESC',
					include : [{model : models.Produk,where : {KategoriProdukId : 12} }],
					group : 'produkId',
					order : [ [sequelize.fn('sum',sequelize.col('jumlah')),'DESC'] ]
				}).then(function(produk) {
					callback(null,produk);
				})
				//models.Hotlist.findAll({
				//	where : { $and : [ { terlaris : 1 }, { KategoriProdukId : 12  } ] },
				//}).then(function(smartphone) {
				//	callback(null,smartphone);
				//})
			},
			function(callback){
				models.Invoice.findAll({
					attributes : ['Produk.nama','Produk.harga','Produk.gambar'],
					limit : '3',
					order : 'id DESC',
					include : [{model : models.Produk,where : {KategoriProdukId : 1} }],
					group : 'produkId',
					order : [ [sequelize.fn('sum',sequelize.col('jumlah')),'DESC'] ]
				}).then(function(produk) {
					callback(null,produk);
				})
				//models.Hotlist.findAll({
				//	where : { $and : [ { terlaris : 1 }, { KategoriProdukId : 1  } ] },
				//}).then(function(pakaian) {
				//	callback(null,pakaian);
				//})
			}
		],
		function(err,result){
			res.render('pc-view/beranda',{
				hotlist : result[0],
				smartphone : result[1],
				pakaian : result[2]
			})
		}
	)
};
exports.keluar = function(req, res, next) {
	req.session.destroy();
	res.redirect('/');
};

exports.ceklogin = function(req, res, next) {
	//buat session jika berhasil login
	models.Pengguna.find({
		attributes: ['nama'],
		where : {
			$and : [ { sandi : req.body.sandi}, { email : req.body.email } ]
		}
	}).then(function(pengguna) {
		if(pengguna){
			req.session.nama =  pengguna.nama;
			req.session.loggedin = "true";
			res.redirect('/pc-view/beranda');
		}else{
			//buat pesan gagal
			res.send('gagal masuk')
		}
	})
}
exports.cekloginMobile = function(req, res, next) {
	//buat session jika berhasil login
	models.Pengguna.find({
		attributes: ['nama'],
		where : {
			$and : [ { sandi : req.body.sandi}, { email : req.body.email } ]
		}
	}).then(function(pengguna) {
		if(pengguna){
			req.session.nama =  pengguna.nama;
			req.session.loggedin = "true";
			res.redirect('/beranda');
		}else{
			//buat pesan gagal
			res.send('gagal masuk')
		}
	})
};

exports.getPenerima = function(req, res, next) {
	models.Penerima.find({
		include: [
			models.Provinsi,models.Kabupaten
		],
		//nanti menggunakan session pengguna
		where : {id : req.params.idPenerima}
	}).then(function(penerima) {
		res.send({penerimaHTML:penerima});
	})
};
//fungsi ini sebelum menggunakan API, data kabupaten didapatkan dari database local
exports.getKabupaten = function(req, res, next) {
	//buat session jika berhasil login
	models.Kabupaten.findAll({
		attributes: ['nama','id'],
		where : { provinsiId : req.params.id }
	}).then(function(listKabupaten) {
		var kabupatenHTML = [];
		for(var val in listKabupaten){
			kabupatenHTML[val] = "<option value="+listKabupaten[val].id+">" +
				listKabupaten[val].nama+"</option>";
		}
		res.send({listArr:kabupatenHTML});
	})
}
//fungsi ini sebelum menggunakan API, data kecamatan didapatkan dari database local
//exports.getKecamatan = function(req, res, next) {
//	models.Kecamatan.findAll({
//		attributes: ['nama','id'],
//		where : { kabupatenId : req.params.id }
//	}).then(function(listKecamatan) {
//		var kecamatanHTML = [];
//		for(var val in listKecamatan){
//			kecamatanHTML[val] = "<option value="+listKecamatan[val].id+">" +
//				listKecamatan[val].nama+"</option>";
//		}
//		res.send({listArr:kecamatanHTML});
//	})
//}

exports.profil = function(req, res){
	res.render('pc-view/beranda');
};
