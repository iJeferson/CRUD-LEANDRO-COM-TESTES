'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Produtos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Produtos.init({
    nome: DataTypes.STRING,
    preco: DataTypes.DECIMAL(10, 2),
    descricao: DataTypes.STRING,
    quantidade: DataTypes.INTEGER,
    categoria: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Produtos',
  });
  return Produtos;
};