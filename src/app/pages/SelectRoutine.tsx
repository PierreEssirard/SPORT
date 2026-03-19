import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ArrowLeft, Play } from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

export default function SelectRoutine() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5f33992/routines`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines || []);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRoutine = (routine: Routine) => {
    navigate('/active-session', { 
      state: { 
        exercises: routine.exercises.map(ex => ({
          ...ex,
          note: '',
          sets: Array(ex.sets).fill(null).map(() => ({
            weight: 0,
            reps: 0,
            completed: false
          }))
        })),
        routineName: routine.name
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Sélectionner une routine</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des routines...</p>
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucune routine disponible</p>
            <button
              onClick={() => navigate('/create-routine')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer une routine
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{routine.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {routine.exercises.length} exercice{routine.exercises.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => startRoutine(routine)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Démarrer
                  </button>
                </div>
                <div className="space-y-2">
                  {routine.exercises.map((exercise, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {exercise.name} - {exercise.sets} × {exercise.reps}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
