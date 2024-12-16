import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    classesRoutes, 
    subjectsRoutes, 
    unitsRoutes, 
    topicsRoutes, 
    urlRoutes, 
    eventsRoutes 
} from './routes/data.js';

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const environmentUrl = process.env.NODE_ENV === "production" ? process.env.PRODUCTION_URL : process.env.BACKEND_URL;
export const frontendUrl = process.env.NODE_ENV === "production" ? process.env.PRODUCTION_URL : process.env.FRONTEND_URL;

export const io = new Server(server, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(cors({
    origin: environmentUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());

app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/validate', urlRoutes);
app.use('/api/events', eventsRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
};

app.listen(PORT, () => {
    console.log(`Server is running on '${environmentUrl}'`);
});