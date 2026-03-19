import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

const muscleGroups = [
  { name: 'Pectoraux', emoji: '💪' },
  { name: 'Dos', emoji: '🦵' },
  { name: 'Épaules', emoji: '🏋️' },
  { name: 'Biceps', emoji: '💪' },
  { name: 'Triceps', emoji: '💪' },
  { name: 'Jambes', emoji: '🦵' },
  { name: 'Abdominaux', emoji: '🔥' },
  { name: 'Full Body', emoji: '🏃' }
];

export default function MuscleGroupSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const generateRoutine = () => {
    if (!selected) return;

    // Routines prédéfinies basiques (sans IA)
    const routines: { [key: string]: any[] } = {
      'Pectoraux': [
        { name: 'Développé couché', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 120 },
        { name: 'Développé incliné', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 },
        { name: 'Écartés haltères', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 }
      ],
      'Dos': [
        { name: 'Tractions', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 120 },
        { name: 'Rowing barre', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 },
        { name: 'Tirage vertical', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 }
      ],
      'Épaules': [
        { name: 'Développé militaire', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 },
        { name: 'Élévations latérales', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 },
        { name: 'Oiseau haltères', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 }
      ],
      'Biceps': [
        { name: 'Curl barre', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 },
        { name: 'Curl haltères', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 },
        { name: 'Curl marteau', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 }
      ],
      'Triceps': [
        { name: 'Dips', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 },
        { name: 'Extension poulie', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 },
        { name: 'Extension nuque', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 60 }
      ],
      'Jambes': [
        { name: 'Squat', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 180 },
        { name: 'Leg press', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 120 },
        { name: 'Leg curl', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 }
      ],
      'Abdominaux': [
        { name: 'Crunch', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 45 },
        { name: 'Planche', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 45 },
        { name: 'Russian twist', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 45 }
      ],
      'Full Body': [
        { name: 'Squat', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 120 },
        { name: 'Développé couché', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 120 },
        { name: 'Rowing barre', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 },
        { name: 'Développé militaire', sets: [{ weight: 0, reps: 0, completed: false }], note: '', restTime: 90 }
      ]
    };

    const exercises = routines[selected] || [];
    navigate('/active-session', { 
      state: { 
        exercises,
        routineName: `Routine ${selected}`
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
          <h1 className="text-2xl font-bold text-gray-900">Sélectionner un groupe musculaire</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600 mb-6">
          Choisissez un groupe musculaire pour générer une routine d'entraînement.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {muscleGroups.map((group) => (
            <button
              key={group.name}
              onClick={() => setSelected(group.name)}
              className={`p-6 rounded-xl border-2 transition-all ${
                selected === group.name
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-4xl mb-2">{group.emoji}</div>
              <div className="font-semibold text-gray-900">{group.name}</div>
            </button>
          ))}
        </div>

        <button
          onClick={generateRoutine}
          disabled={!selected}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Générer la routine
        </button>
      </div>
    </div>
  );
}
