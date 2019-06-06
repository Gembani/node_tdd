module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Posts', 'AuthorId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Authors', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Posts', 'AuthorId')
  }
}
