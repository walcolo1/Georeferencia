import React, { useState } from 'react';
import api from '../services/api';

const CaptureForm = ({ onCaptureAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payload, setPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payloadData = payload;
      // Try to parse if it looks like JSON
      if (payload.trim().startsWith('{') || payload.trim().startsWith('[')) {
        try {
          payloadData = JSON.parse(payload);
        } catch (err) {
          // Keep as string if parsing fails
        }
      }

      await api.post('/captures', {
        title,
        description,
        payload: payloadData
      });

      setTitle('');
      setDescription('');
      setPayload('');
      
      if (onCaptureAdded) {
        onCaptureAdded();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la captura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Nueva Captura</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Título de la captura"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Descripción opcional"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datos (Payload)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            rows="4"
            placeholder='Ej: {"temperatura": 25, "humedad": 60}'
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Captura'}
        </button>
      </form>
    </div>
  );
};

export default CaptureForm;
