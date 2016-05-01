/**
 * Created by riansyahPC on 11/23/2015.
 */
var moment = require("moment");
var async = require('async');
var models  = require('../models');
var sequelize = require("sequelize");
module.exports = {

    registerRoutes: function(app,checkAuth) {
        //fitur pembeli
        //nanti dibuatkan cek-auth untuk superadmin
        app.get('/admin/verifikasipembayaran/:status', this.verifikasiPembayaran);
        app.get('/admin/verifikasipembayaran/update/:invoiceId', this.updateVerifikasiPembayaran);
        app.get('/admin/pengirimansampai/:status/',checkAuth,this.verifikasiPembayaran);
        //todo: dibedakan halamannya untuk konfirmasi kurir ke pasarmantap bahwa pengiriman telah sampai
        //todo: buat halaman pendaftaran pengguna baru
        app.get('/admin/pengirimansampai/:invoiceId',checkAuth,this.updatePengiriman);
    },

    updatePengiriman : function(req, res, next){
        models.Invoice.update({
            status_tampil : 3
        },{
            where: { id : req.params.invoiceId }
        }).then(function() {
            var now = moment();
            models.Invoice_Status.create({
                invoiceId : req.params.invoiceId,
                statusId : 2,
                waktu : moment(now).format('YYYY-MM-DD HH:mm')
            }).then(function() {
                res.redirect('/admin/verifikasipembayaran/belum');
            })
        });
    },
    updateVerifikasiPembayaran : function(req, res, next){
        models.Invoice.update({
            status_tampil : 3
        },{
            where: { id : req.params.invoiceId }
        }).then(function() {
            var now = moment();
            models.Invoice_Status.create({
                invoiceId : req.params.invoiceId,
                statusId : 2,
                waktu : moment(now).format('YYYY-MM-DD HH:mm')
            }).then(function() {
                res.redirect('/admin/verifikasipembayaran/belum');
            })
        });
    },
    verifikasiPembayaran : function(req, res, next){
        var status_tampil = {};
        if(req.params.status == 'sudah'){
            status_tampil = {$or : [3,5] };
        }else if(req.params.status == 'belum'){
            status_tampil = 2
        }else{
            status_tampil = 5
        }
        models.Invoice.findAll({
            where : {
                status_tampil : status_tampil
            },
            include: [
                models.Pengguna,models.Toko,models.Produk,
                { model:models.Status,order : ['waktu']},
                {model : models.Penerima, include :[models.Provinsi,models.Kabupaten]}
            ]
        }).then(function(invoice){
            res.render('pc-view/admin/verifikasiPembayaran', {
                moment : moment,
                invoice : invoice,
                status : req.params.status
            })
        });
    },

};
