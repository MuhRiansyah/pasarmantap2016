/**
 * Created by riansyahPC on 11/27/2015.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Invoice = sequelize.define("Invoice", {
            jumlah : DataTypes.INTEGER,
            total_harga : DataTypes.INTEGER,
            tanggal_pembayaran : DataTypes.DATE
        }, {
            classMethods: {
                associate: function(models) {
                    Invoice.belongsTo(models.Transaksi, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Invoice.belongsTo(models.Penerima, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Invoice.belongsTo(models.Toko, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Invoice.belongsTo(models.Produk, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                }
            }
        }
    );

    return Invoice;
};
