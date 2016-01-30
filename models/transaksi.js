/**
 * Created by riansyahPC on 11/29/2015.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Transaksi = sequelize.define("Transaksi", {
            tanggal : DataTypes.DATE,
            jatuh_tempo : DataTypes.DATE,
            total_tagihan : DataTypes.INTEGER,
        }, {
            classMethods: {
                associate: function(models) {
                    Transaksi.belongsTo(models.Pengguna, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Transaksi.hasMany(models.Invoice);
                }
            }
        }
    );

    return Transaksi;
};
