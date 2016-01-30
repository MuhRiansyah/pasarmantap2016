/**
 * Created by riansyahPC on 11/21/2015.
 */
//var pc-view = require('../models/pc-view.js');

//ada fungsi yang router POST dan ada yang router GET
module.exports = {

    registerRoutes: function(app) {
        app.get('/profil/:id', this.profil);

    },

    profil : function(req, res, next) {
        models.Pengguna.find({
            include: [
                models.Provinsi,models.Kabupaten
            ],
            //nanti menggunakan session pengguna
            where : {id : req.params.id}
        }).then(function(pengguna) {
            res.render('pc-view/profilPengguna',{
                pengguna : pengguna
            });
        })

    }

};
