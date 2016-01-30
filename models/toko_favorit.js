/**
 * Created by riansyahPC on 11/27/2015.
 */

/**
 * Created by riansyahPC on 11/21/2015.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Toko_Favorit = sequelize.define("Toko_Favorit", {
        }, {
            classMethods: {
                associate: function(models) {
                    Toko_Favorit.belongsTo(models.Toko, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Toko_Favorit.belongsTo(models.Pengguna, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                    Toko_Favorit.belongsTo(models.Etalase, {
                        foreignKey: 'TokoId', targetKey: 'TokoId'
                    });

                }
            }
        }
    );

    return Toko_Favorit;
};
