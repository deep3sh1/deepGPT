import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;


// MIDDLEWARE
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


// ROUTES
app.use('/chat', chatRoutes);

app.use('/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


// DATABASE CONNECTION
const connectDB = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(
                `Server is running on port ${PORT}`
            );
        });

    } catch (error) {

        console.error(
            'Error connecting to MongoDB:',
            error
        );
    }
};

connectDB();