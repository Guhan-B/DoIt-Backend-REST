import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ConnectToDatabase = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    return conn;
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: Number,
        default: 0,
    }
});

const tokenSchema = new Schema({
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const logSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        required: true
    },
    due: {
        type: Date,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
    logId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Log'
    }
});

const emailOTPSchema = new Schema({
    otp: {
        type: Number,
        required: true,
    },
    validTill: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

export const Models = {
    User: mongoose.model('User', userSchema),
    Token: mongoose.model('Token', tokenSchema),
    Log: mongoose.model('Log', logSchema),
    Task: mongoose.model('Task', taskSchema),
    EmailOTP: mongoose.model('EmailOTP', emailOTPSchema),
}