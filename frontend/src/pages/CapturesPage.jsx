import React, { useEffect, useState } from 'react';
import ScannerForm from '../components/ScannerForm';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { getPendingCaptures, db } from '../services/localDb';

const CapturesPage = () => {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuthStore();

  const fetchCaptures = async () => {
    try {
      setLoading(true);
      // Fetch local pending captures
      const localPending = await getPendingCaptures();
      
      // Fetch remote captures
      const response = await api.get('/captures');
      const remoteCaptures = response.data;

      // Combine both and sort by date (newest first)
      const merged = [...localPending, ...remoteCaptures].sort((a, b) => {
        const dateA = new Date(a.created_at || a.scanned_at);
        const dateB = new Date(b.created_at || b.scanned_at);
        return dateB - dateA;
      });
      
      setCaptures(merged);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar capturas');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    try {
      setSyncing(true);
      
      // Get local captures
      const localPending = await getPendingCaptures();
      
      // Send them to backend individually
      if (localPending.length > 0) {
        await Promise.all(localPending.map(capture => {
          const captureData = {
            barcode: capture.barcode,
            latitude: capture.latitude,
            longitude: capture.longitude
          };
          console.log("Datos de captura a guardar:", captureData);
          console.log("Token actual:", localStorage.getItem("token"));
          console.log("URL guardado:", `${api.defaults.baseURL}/captures`);
          return api.post('/captures', captureData);
        }));
        
        // Remove from local IndexedDB since they are now synced
        await db.captures.bulkDelete(localPending.map(c => c.id));
      }

      // Sync existing pending records in backend
      const response = await api.post('/captures/sync');
      
      await fetchCaptures();
      alert(`Sincronización exitosa: ${localPending.length + (response.data.syncedCount || 0)} registros procesados.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error en la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, []);

  const pendingCapturesCount = captures.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Capturas</h1>
          </div>
          
          <button
            onClick={handleSync}
            disabled={syncing || pendingCapturesCount === 0}
            className={`flex items-center px-4 py-2 rounded-md font-medium text-white transition-all ${
              syncing || pendingCapturesCount === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 shadow-md active:transform active:scale-95'
            }`}
          >
            {syncing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sincronizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Sincronizar Pendientes ({pendingCapturesCount})
              </>
            )}
          </button>
        </div>

        <ScannerForm onCaptureAdded={fetchCaptures} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-medium text-gray-800">
              {user?.role === 'Administrador' ? 'Todas las capturas' : 'Mis capturas'}
            </h2>
            <span className="text-sm text-gray-500">
              Total: {captures.length}
            </span>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500 font-medium">Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-red-50">{error}</div>
          ) : captures.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg">No hay capturas registradas.</p>
              <p className="text-sm">Las capturas que realices aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código (Barcode)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {captures.map((capture) => (
                    <tr key={capture.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 font-mono">{capture.barcode}</div>
                        <div className="text-xs text-gray-500">Lat: {capture.latitude}, Lng: {capture.longitude}</div>
                        {user?.role === 'Administrador' && (
                          <div className="text-[10px] mt-1 text-blue-600 font-mono">By: {capture.created_by}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          capture.status === 'synced' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {capture.status === 'synced' ? (
                            <><CheckCircle className="w-3 h-3 mr-1 self-center" /> Sincronizado</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1 self-center" /> Pendiente</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(capture.created_at || capture.scanned_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {capture.status === 'pending' ? (
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Bloqueado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapturesPage;
