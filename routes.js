//var penggunaController = require('./controllers/pengguna.js');
var pembelianController = require('./controllers/pembelian.js');
var produkController = require('./controllers/produk.js');
var penjualanController = require('./controllers/penjualan.js');
var tokoController = require('./controllers/toko.js');
var penggunaController = require('./controllers/pengguna.js');
var main = require('./handlers/main.js');
var cart = require('./handlers/cart.js');


function checkAuth(req, res, next) {
	if (!req.session.loggedin) {
		res.send('kamu tidak dapat mengakses halaman ini kembali ke <a href="/">halaman login</a>');
	} else {
		next();
	}
};

module.exports = function(app,mobile){

	mobile.get('/', main.utamaMobile);
	mobile.post('/cekloginmobile', main.cekloginMobile);
	mobile.get('/beranda', main.berandaMobile);
	mobile.get('/daftarproduk/:idKategori', produkController.daftarByKategoriMobile);
	mobile.get('/detailproduk/:id', produkController.detailProdukMobile);


	// route untuk halaman tanpa controller (halaman main)
	app.get('/', main.utama);
	app.post('/ceklogin', main.ceklogin);
	app.get('/keluar', main.keluar);

	//setelah login
	//app.get('/pc-view/beranda', checkAuth,main.beranda);
	app.get('/pc-view/beranda', main.beranda);
	app.get('/baru', main.baru);


	//request AJAX
	app.get('/getpenerima/:idPenerima', main.getPenerima);
	app.get('/getkabupaten/:id', main.getKabupaten);
	app.get('/getongkir/:idKotaTujuan/:idProduk',main.getOngkir);


	//sebelum menggunakan API
	//app.get('/getkecamatan/:id', main.getKecamatan);
	//route untuk data produk
	produkController.registerRoutes(app,checkAuth);
	app.post('/keranjang/tambah', cart.tambahCart);
	app.get('/keranjang/hapussemua', cart.hapusSemuaProdukCart);
	app.get('/keranjang/hapuspertagihan/:cartId', cart.hapusSemuaPertagihan);
	app.get('/keranjang/hapus/:produkId', cart.hapusSatuProdukCart);
	app.get('/keranjang', cart.getCart);
	//route untuk menambah ke invoice
	app.post('/keranjang/simpan', cart.insertCartToInvoice);
	app.get('/keranjang/konfirmasi', cart.konfirmasiPembelian);

	//route untuk data pembelian
	pembelianController.registerRoutes(app,checkAuth);
	penggunaController.registerRoutes(app);
	//route untuk data penjualan
	penjualanController.registerRoutes(app,checkAuth);
	//route untuk data toko
	tokoController.registerRoutes(app,checkAuth);

};
