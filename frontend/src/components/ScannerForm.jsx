import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, MapPin, AlertCircle, Check } from 'lucide-react';
import { saveCaptureLocal } from '../services/localDb';

const ScannerForm = ({ onCaptureAdded }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    setError(null);
    setSuccessMsg(null);
    setScannedBarcode(null);
    setScanning(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        /* verbose= */ false
      );
      
      scannerRef.current = scanner;
      scanner.render(onScanSuccess, onScanFailure);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setScanning(false);
        setScannedBarcode(null);
      }).catch(console.error);
    } else {
      setScanning(false);
      setScannedBarcode(null);
    }
  };

  const onScanSuccess = (decodedText) => {
    if (scannerRef.current) {
      scannerRef.current.pause(); // Pause scanning
    }
    
    // Play success sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
      audio.play().catch(() => {});
    } catch(e) {}

    setScannedBarcode(decodedText);
  };

  const onScanFailure = (err) => {
    // Ignore frequent errors like "No QR code found"
  };

  const handleConfirmCapture = () => {
    if (!scannedBarcode) return;
    setIsGettingLocation(true);
    setError(null);
    setSuccessMsg(null);
    
    if (!navigator.geolocation) {
      setError('Geolocalización no es soportada por este navegador.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await saveCaptureLocal({
            barcode: scannedBarcode,
            latitude,
            longitude
          });
          
          setSuccessMsg(`¡Código ${scannedBarcode} capturado localmente con éxito!`);
          setScannedBarcode(null);
          onCaptureAdded(); // Refresh list to show local capture
          
          // Resume scanner after 2 seconds
          setTimeout(() => {
            setSuccessMsg(null);
            if (scannerRef.current) scannerRef.current.resume();
          }, 2000);
          
        } catch (err) {
          setError('Error al guardar la captura localmente.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setError('Debes permitir el acceso a la ubicación para registrar capturas.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCancelCapture = () => {
    setScannedBarcode(null);
    setError(null);
    if (scannerRef.current) scannerRef.current.resume();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Camera className="mr-2" />
        Escáner de Terreno
      </h2>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline font-bold">{successMsg}</span>
        </div>
      )}

      {isGettingLocation && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="block sm:inline">Obteniendo coordenadas GPS y guardando...</span>
        </div>
      )}

      {!scanning ? (
        <button
          onClick={startScanner}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center"
        >
          <Camera className="mr-2" /> Iniciar Escáner
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <div id="reader" className="w-full max-w-sm border-2 border-gray-300 rounded-lg overflow-hidden relative">
            {scannedBarcode && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4 z-10">
                <div className="bg-white p-4 rounded-lg shadow-xl text-center w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Código Detectado</h3>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xl mb-4 break-all">
                    {scannedBarcode}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleConfirmCapture}
                      disabled={isGettingLocation}
                      className="bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                    >
                      <Check className="mr-2 h-5 w-5" /> Confirmar Captura
                    </button>
                    <button
                      onClick={handleCancelCapture}
                      disabled={isGettingLocation}
                      className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                      Cancelar y Leer Otro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={stopScanner}
            className="mt-4 bg-gray-500 text-white font-bold py-2 px-6 rounded hover:bg-gray-600 transition"
          >
            Detener Escáner
          </button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
        <MapPin className="w-3 h-3 mr-1" />
        La ubicación GPS es obligatoria y se procesa offline en el navegador.
      </div>
    </div>
  );
};

export default ScannerForm;
