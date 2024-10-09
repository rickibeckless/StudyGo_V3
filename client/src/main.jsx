import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Import Pages
import NotFound from './pages/NotFound.jsx';
import Home from './pages/Home.jsx';
import Subjects from './pages/Subjects.jsx';
import Classes from './pages/Classes.jsx';
import ClassDetails from './pages/ClassDetails.jsx';
import Units from './pages/Units.jsx';

const router = createBrowserRouter([
    { // Main Pages
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/subjects', element: <Subjects /> },
            { path: '/classes', element: <Classes /> },
            { path: '/:subjectId', element: <Classes /> },
            { path: '/:subjectId/:classId', element: <ClassDetails /> },
            { path: '/:subjectId/:classId/:unitId', element: <Units /> },
            { path: '/units', element: <Units /> },
            { path: '*', element: <NotFound /> },
            { path: '/404', element: <NotFound /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);