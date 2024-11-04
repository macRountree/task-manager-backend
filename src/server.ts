import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from './config/db';
import projectRoutes from './routes/projectRoutes';
import {corsConfig} from './config/cors';
import authRoutes from './routes/authRoutes';
import morgan from 'morgan';
dotenv.config();
connectDB();
const app = express();

//cors|cross-origin resource sharing
app.use(cors(corsConfig));

//*logging

app.use(morgan('dev'));

//*Add read json format

app.use(express.json());

//routes

// app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', projectRoutes);
export default app;
