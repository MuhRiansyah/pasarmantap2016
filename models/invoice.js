/**
 * Created by riansyahPC on 11/27/2015.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Invoice = sequelize.define("Invoice", {
            id : {
                type : DataTypes.STRING,
                primaryKey : true
            },
            total_berat : DataTypes.INTEGER,
            ongkos_kirim : DataTypes.INTEGER,
            total_harga : DataTypes.INTEGER,
            keterangan : DataTypes.STRING
        }, {
            classMethods: {
                associate: function(models) {
                    Invoice.belongsToMany(models.Produk, {
                        through: {
                            model: models.Invoice_Produk
                        },
                        foreignKey: 'invoiceId'
                    });
                    Invoice.belongsToMany(models.Status, {
                        through: {
                            model: models.Invoice_Status
                        },
                        foreignKey: 'invoiceId'
                    });

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
                    //Invoice.belongsTo(models.Produk, {
                    //    onDelete: "CASCADE",
                    //    foreignKey: {
                    //        allowNull: false
                    //    }
                    //});
                }
            }
        }
    );

    return Invoice;
};
