import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateRoutine from './pages/CreateRoutine';
import SelectRoutine from './pages/SelectRoutine';
import ActiveSession from './pages/ActiveSession';
import MuscleGroupSelection from './pages/MuscleGroupSelection';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-routine',
    element: (
      <ProtectedRoute>
        <CreateRoutine />
      </ProtectedRoute>
    ),
  },
  {
    path: '/select-routine',
    element: (
      <ProtectedRoute>
        <SelectRoutine />
      </ProtectedRoute>
    ),
  },
  {
    path: '/active-session',
    element: (
      <ProtectedRoute>
        <ActiveSession />
      </ProtectedRoute>
    ),
  },
  {
    path: '/muscle-group-selection',
    element: (
      <ProtectedRoute>
        <MuscleGroupSelection />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
]);
