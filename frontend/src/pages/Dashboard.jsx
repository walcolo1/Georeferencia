import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-blue-800">
            Bienvenido, <span className="font-bold">{user?.name || user?.email}</span> 
            {user?.role && ` (Rol: ${user.role})`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded bg-gray-50">
            <h2 className="font-bold text-lg mb-2">Capturar Datos</h2>
            <p className="text-gray-600 mb-4">Módulo de captura georreferenciada.</p>
            <button 
              onClick={() => navigate('/captures')}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors"
            >
              Ir a Captura
            </button>
          </div>
          
          {user?.role === 'Administrador' && (
            <div className="border p-4 rounded bg-gray-50">
              <h2 className="font-bold text-lg mb-2">Logs de Sincronización</h2>
              <p className="text-gray-600 mb-4">Módulo exclusivo para Administradores.</p>
              <button 
                onClick={() => navigate('/logs')}
                className="bg-purple-600 text-white px-4 py-2 rounded w-full hover:bg-purple-700 transition-colors"
              >
                Ver Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
