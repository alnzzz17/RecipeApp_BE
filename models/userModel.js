import Sequelize from 'sequelize';
import sequelize from '../utils/dbConnect.js';

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    headline: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: process.env.DEFAULT_PROFILE_PICTURE_URL,
    },
    fullName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
});

export default User;
