import 'dotenv/config';
import sequelize from './dbConnect.js';

import User from '../models/userModel.js';
import Recipe from '../models/recipeModel.js';
import Comment from '../models/commentModel.js';

// Relasi User - Recipe (1:N)
User.hasMany(Recipe, { foreignKey: 'userId', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'userId' });

// Relasi User - Comment (1:N)
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Relasi Recipe - Comment (1:N)
Recipe.hasMany(Comment, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Comment.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Fungsi sinkronisasi
const association  = async () => {
    try {
        await sequelize.sync({ force: true }); // Diubah ke true kalau mau di-drop & re-create
        console.log('Database synced & associations established');
    } catch (error) {
        console.error('Association error:', error.message);
    }
};

export default association;
