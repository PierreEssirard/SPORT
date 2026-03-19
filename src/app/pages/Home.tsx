import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Play, FileText, Sparkles, LogOut, Dumbbell } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const options = [
    {
      icon: <PlusCircle className="w-8 h-8" />,
      title: 'Créer une routine',
      description: 'Planifiez vos séances d\'entraînement',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      action: () => navigate('/create-routine')
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: 'Commencer une routine',
      description: 'Démarrez une routine existante',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      action: () => navigate('/select-routine')
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Séance vide',
      description: 'Commencez une séance libre',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      action: () => navigate('/active-session', { state: { exercises: [] } })
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Routine IA',
      description: 'Générez une routine par groupe musculaire',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      action: () => navigate('/muscle-group-selection')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SPORT</h1>
              <p className="text-sm text-gray-500">Bonjour, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Que voulez-vous faire aujourd'hui ?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className={`${option.color} p-8 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-4">{option.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                    <p className="text-white/90">{option.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
