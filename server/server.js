import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { classesRoutes, subjectsRoutes, unitsRoutes, topicsRoutes, urlRoutes } from './routes/data.js';

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/validate', urlRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on 'http://localhost:${PORT}'`);
});