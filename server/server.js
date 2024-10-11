import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { classesRoutes, subjectsRoutes, unitsRoutes, topicsRoutes, urlRoutes, eventsRoutes } from './routes/data.js';

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/validate', urlRoutes);
app.use('/api/events', eventsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on 'http://localhost:${PORT}'`);
});