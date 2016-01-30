/**
 * Created by riansyahPC on 11/21/2015.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Toko = sequelize.define("Toko", {
            nama : DataTypes.STRING,
            logo : DataTypes.STRING,
            lokasi : DataTypes.STRING,
            deskripsi : DataTypes.STRING,
        }, {
            classMethods: {
                associate: function(models) {
                    Toko.hasMany(models.Invoice);
                    Toko.hasMany(models.Etalase);
                    Toko.hasMany(models.Produk,{as : 'Produk'});
                }
            }
        }
    );

    return Toko;
};
