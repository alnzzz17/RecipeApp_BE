import Sequelize from 'sequelize';
import sequelize from '../utils/dbConnect.js';
import User from './userModel.js';
import Recipe from './recipeModel.js';

const Comment = sequelize.define('Comment', {
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
    recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Recipe,
            key: 'id',
        },
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});

export default Comment;
