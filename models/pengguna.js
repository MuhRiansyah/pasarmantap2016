/**
 * Created by riansyahPC on 11/21/2015.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Pengguna = sequelize.define("Pengguna", {
            nama : DataTypes.STRING,
            email : DataTypes.STRING,
            sandi : DataTypes.STRING,
            tanggal_lahir : DataTypes.DATE,
            telepon : DataTypes.STRING,
        }, {
            classMethods: {
                associate: function(models) {
                    Pengguna.belongsTo(models.Toko);
                    Pengguna.hasMany(models.Penerima);
                }
            }
        }
    );

    return Pengguna;
};
