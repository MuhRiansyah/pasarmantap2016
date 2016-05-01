/**
 * Created by riansyah on 4/30/2016.
 */
var models = require('../models');
var async = require('async');
var moment = require('moment');

cekLogin();
function cekLogin(){
    models.Pengguna.find({
        where : {
            $and : [ { sandi : 'biji'}, { email : 'mriansyah93@gmail.com' } ]
        },
        include : models.Toko
    }).then(function(pengguna) {
        console.error(pengguna.TokoId)
    })
}