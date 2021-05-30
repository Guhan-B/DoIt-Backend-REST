import { Sequelize, DataTypes } from 'sequelize';

export const database = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        dialect: 'mysql',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT
    }
);

// export const database = new Sequelize(process.env.DATABASE_URI, {
//     dialect: 'postgres',
//     protocol: 'postgres',
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         }
//     }
// });

const User = database.define(
    'user',
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'users',
        timestamps: true
    }
);

const Log = database.define(
    'log',
    {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        tableName: 'logs',
        timestamps: false
    }
);

const Task = database.define('task',
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        due: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: 'tasks',
        timestamps: true,
        createdAt: true,
        updatedAt: false
    }
);

const Token = database.define('token',
    {
        refreshToken: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
    },
    {
        tableName: 'tokens',
        timestamps: true,
        updatedAt: false
    }
);

export const createAssociation = () => {
    User.hasMany(Log, { onDelete: 'CASCADE' });
    Log.belongsTo(User);

    Log.hasMany(Task, { onDelete: 'CASCADE' });
    Task.belongsTo(Log);

    User.hasMany(Token, { onDelete: 'CASCADE' });
    Token.belongsTo(User);
}

export const Models = {
    User,
    Log,
    Task,
    Token
}