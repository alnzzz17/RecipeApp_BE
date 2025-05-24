import Sequelize from 'sequelize';
import sequelize from '../utils/dbConnect.js';
import User from './userModel.js';

const Recipe = sequelize.define('Recipe', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    instructions: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

export default Recipe;
