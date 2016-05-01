//var penggunaController = require('./controllers/pengguna.js');
var pembelianController = require('./controllers/pembelian.js');
var produkController = require('./controllers/produk.js');
var penjualanController = require('./controllers/penjualan.js');
var tokoController = require('./controllers/toko.js');
var penggunaController = require('./controllers/pengguna.js');
var adminController = require('./controllers/admin.js');
var main = require('./handlers/main.js');
var cart = require('./handlers/cart.js');

module.exports = function(app,mobile){
	app.get('/', main.utama);
	app.post('/ceklogin', main.ceklogin);
	//tampilan administrasi admin
	adminController.registerRoutes(app,checkAuth);

	//tampilan administrasi pengguna
	app.get('/keluar', main.keluar);
	app.get('/pc-view/beranda', checkAuth,main.beranda);
	app.get('/baru', main.baru);
	//request AJAX
	app.get('/getpenerima/:idPenerima', main.getPenerima);


	app.get('/getkabupaten/:id', main.getKabupaten);
	app.get('/getongkir/:idKotaTujuan/:idProduk/:berat',main.getOngkir);
	//sebelum menggunakan API
	//app.get('/getkecamatan/:id', main.getKecamatan);

	app.post('/keranjang/tambah', cart.tambahCart);
	app.get('/keranjang/hapussemua', cart.hapusSemuaProdukCart);
	app.get('/keranjang/hapuspertagihan/:cartId', cart.hapusSemuaPertagihan);
	app.get('/keranjang/hapus/:produkId', cart.hapusSatuProdukCart);
	app.get('/keranjang', cart.getCart);
	app.post('/keranjang/simpan', cart.insertCartToInvoice);
	app.get('/keranjang/konfirmasi', cart.konfirmasiPembelian);

	produkController.registerRoutes(app,checkAuth);
	pembelianController.registerRoutes(app,checkAuth);
	penggunaController.registerRoutes(app,checkAuth);
	penjualanController.registerRoutes(app,checkAuth);
	tokoController.registerRoutes(app,checkAuth);

	//nanti yang di destroy local sessionya
	mobile.get('/', main.utamaMobile);
	mobile.post('/cekloginmobile', main.cekloginMobile);
	mobile.get('/beranda', main.berandaMobile);
	mobile.get('/daftarproduk/:idKategori', produkController.daftarByKategoriMobile);
	mobile.get('/detailproduk/:id', produkController.detailProdukMobile);
	//di pindah ke halaman app.js, dikarenakan ada res.locals.session ingin dicek menggunakan variabel statusLogin

	app.get('/tes-sesi', function(req,res){
		//todo: error disini, cannot set property penggunaId undefined
		req.session.penggunaId =  1;
		req.session.nama =  'r';
		req.session.tokoId =  1;
		req.session.namaToko =  'toko';
		req.session.loggedIn =  'true';
		res.redirect('/sesi');
	});
	app.get('/hapus-sesi', function(req,res){
		//tidak bisa mendelete req.session
		delete req.session.nama;
		delete req.session.penggunaId;
		delete req.session.tokoId;
		delete req.session.namaToko;
		delete req.session.loggedIn;
		delete req.session.cart;
		res.redirect('/sesi');
	});
};

function checkAuth(req, res, next) {
	if (!res.locals.session.penggunaId) {
		res.send('kamu tidak dapat mengakses halaman ini kembali ke <a href="/">halaman login</a>');
	} else {
		next();
	}
};

