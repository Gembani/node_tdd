'use strict'
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
  }, {})

  Author.associate = (models) => {
    Author.hasMany(models.Post)
  }
  return Author
}
