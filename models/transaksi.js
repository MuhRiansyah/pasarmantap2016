/**
 * Created by riansyahPC on 11/29/2015.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Transaksi = sequelize.define("Transaksi", {
            tanggal : DataTypes.DATE,
            jatuh_tempo : DataTypes.DATE,
            tanggal_pembayaran : DataTypes.DATE,
            total_tagihan : DataTypes.INTEGER,
            no_rekening : DataTypes.STRING,
            nama_pemilik_rekening : DataTypes.STRING,
            gambar_bukti_pembayaran : DataTypes.STRING,
            //jumlah_sudah_dibayar : DataTypes.INTEGER,
            status_tampil : DataTypes.INTEGER
        }, {
            classMethods: {
                associate: function(models) {
                    Transaksi.belongsTo(models.Pengguna, {
                        onDelete: "CASCADE",
                        foreignKey: 'pembeliId'
                    });
                    Transaksi.belongsTo(models.Pengguna, {
                        onDelete: "CASCADE",
                        foreignKey: 'penjualId'
                    });
                    //Transaksi.belongsTo(models.Pengguna, {
                    //    onDelete: "CASCADE",
                    //    foreignKey: {
                    //        allowNull: false
                    //    }
                    //});
                    Transaksi.belongsTo(models.Bank);
                    Transaksi.hasMany(models.Invoice);
                }
            }
        }
    );

    return Transaksi;
};
