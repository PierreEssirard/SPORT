import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '/utils/supabase/info';
import { ArrowLeft, Plus, Check, Clock, StickyNote, Trash2 } from 'lucide-react';

interface Set {
  weight: number;
  reps: number;
  completed: boolean;
  previous?: string;
}

interface Exercise {
  name: string;
  note: string;
  restTime: number;
  sets: Set[];
}

export default function ActiveSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  
  const [exercises, setExercises] = useState<Exercise[]>(location.state?.exercises || []);
  const [sessionTime, setSessionTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [activeSet, setActiveSet] = useState<number | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  // Timer de session
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer de repos
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      const interval = setInterval(() => {
        setRestTimer(prev => prev !== null && prev > 0 ? prev - 1 : null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer]);

  // Charger les données historiques d'un exercice
  const loadExerciseHistory = async (exerciseName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5f33992/exercise/${encodeURIComponent(exerciseName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.exercise;
      }
    } catch (error) {
      console.error('Error loading exercise history:', error);
    }
    return null;
  };

  const addExercise = async () => {
    if (!newExerciseName) return;

    const history = await loadExerciseHistory(newExerciseName);
    
    const newExercise: Exercise = {
      name: newExerciseName,
      note: history?.note || '',
      restTime: history?.restTime || 90,
      sets: history?.lastSets || [
        { weight: 0, reps: 0, completed: false }
      ]
    };

    setExercises([...exercises, newExercise]);
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    updatedExercises[exerciseIndex].sets.push({
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      completed: false
    });
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed = true;
    setExercises(updatedExercises);
    
    // Démarrer le timer de repos
    setRestTimer(updatedExercises[exerciseIndex].restTime);
    setActiveExercise(exerciseIndex);
    setActiveSet(setIndex);
  };

  const updateNote = (exerciseIndex: number, note: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].note = note;
    setExercises(updatedExercises);
  };

  const updateRestTime = (exerciseIndex: number, time: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].restTime = time;
    setExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, i) => i !== exerciseIndex));
  };

  const finishSession = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5f33992/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          exercises,
          duration: sessionTime,
          routineName: location.state?.routineName
        })
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Erreur lors de la sauvegarde de la séance');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <Clock className="w-6 h-6" />
              {formatTime(sessionTime)}
            </div>
            <button
              onClick={finishSession}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Terminer
            </button>
          </div>
          {location.state?.routineName && (
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              {location.state.routineName}
            </h2>
          )}
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer !== null && restTimer > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl">
          <div className="text-center">
            <p className="text-sm mb-1">Temps de repos</p>
            <p className="text-4xl font-bold">{restTimer}s</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Exercises */}
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{exercise.name}</h3>
              <button
                onClick={() => removeExercise(exerciseIndex)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Note */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Note personnelle</label>
              </div>
              <input
                type="text"
                value={exercise.note}
                onChange={(e) => updateNote(exerciseIndex, e.target.value)}
                placeholder="Ajoutez une note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Rest Time */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Temps de repos (secondes)
              </label>
              <input
                type="number"
                value={exercise.restTime}
                onChange={(e) => updateRestTime(exerciseIndex, parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Set</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Previous</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">KG</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Reps</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set, setIndex) => (
                    <tr key={setIndex} className={`border-b border-gray-100 ${set.completed ? 'bg-green-50' : ''}`}>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{setIndex + 1}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">
                        {set.previous || '-'}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          disabled={set.completed}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          disabled={set.completed}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => completeSet(exerciseIndex, setIndex)}
                          disabled={set.completed}
                          className={`p-2 rounded-lg transition-colors ${
                            set.completed
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Set Button */}
            <button
              onClick={() => addSet(exerciseIndex)}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
            >
              + Ajouter une série
            </button>
          </div>
        ))}

        {/* Add Exercise */}
        {showAddExercise ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un exercice</h3>
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nom de l'exercice"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={addExercise}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowAddExercise(false);
                  setNewExerciseName('');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            Ajouter un exercice
          </button>
        )}
      </div>
    </div>
  );
}
