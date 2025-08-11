import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Move, Download, Plus, X } from 'lucide-react';
import WorldMapViewport from './WorldMapViewport';
import { mapLocations, defaultViewportSettings } from './mapLocations';

const WorldMapEditor = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [locations, setLocations] = useState(mapLocations);
  const [viewportSettings, setViewportSettings] = useState(defaultViewportSettings);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [showAccessPrompt, setShowAccessPrompt] = useState(true);
  const [accessCode, setAccessCode] = useState('');

  // Motion values for dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Access control
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost';
    const urlParams = new URLSearchParams(window.location.search);
    const editorParam = urlParams.get('editor');
    
    if (isLocalhost || editorParam === 'true') {
      setShowAccessPrompt(false);
    }
  }, []);

  const handleAccessSubmit = () => {
    if (accessCode === 'map2024') {
      setShowAccessPrompt(false);
    } else {
      alert('Invalid access code');
    }
  };

  const handleDrag = (event, info) => {
    if (isEditMode) {
      x.set(x.get() + info.delta.x);
      y.set(y.get() + info.delta.y);
      
      // Update current position for coordinate display
      setCurrentPosition({
        x: Math.round((x.get() / window.innerWidth) * 100),
        y: Math.round((y.get() / window.innerHeight) * 100)
      });
    }
  };

  const addCurrentPosition = () => {
    const newLocation = {
      id: Date.now(),
      name: `Location ${locations.length + 1}`,
      coordinates: {
        x: currentPosition.x,
        y: currentPosition.y
      },
      viewport: {
        x: x.get(),
        y: y.get(),
        zoom: 1
      }
    };
    
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const exportLocations = () => {
    const exportData = {
      mapLocations: locations,
      defaultViewportSettings: viewportSettings
    };
    
    const exportString = `export const mapLocations = ${JSON.stringify(locations, null, 2)};\n\nexport const defaultViewportSettings = ${JSON.stringify(viewportSettings, null, 2)};`;
    
    navigator.clipboard.writeText(exportString).then(() => {
      alert('Locations exported to clipboard!');
    });
  };

  if (showAccessPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Map Editor Access</h2>
          <p className="mb-4 text-gray-600">Enter the access code to use the map editor:</p>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter access code"
            onKeyPress={(e) => e.key === 'Enter' && handleAccessSubmit()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAccessSubmit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Access Editor
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">World Map Editor</h1>
            <p className="text-gray-400">Drag to position, click to add locations</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isEditMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Move size={20} />
              {isEditMode ? 'Edit Mode ON' : 'Enable Edit Mode'}
            </button>
            
            <button
              onClick={exportLocations}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              <Download size={20} />
              Export Locations
            </button>
          </div>
        </div>

        {/* Coordinate Display */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Position</label>
              <div className="text-lg font-mono">
                X: {currentPosition.x}%, Y: {currentPosition.y}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pixel Position</label>
              <div className="text-lg font-mono">
                X: {Math.round(x.get())}px, Y: {Math.round(y.get())}px
              </div>
            </div>
          </div>
          
          {isEditMode && (
            <button
              onClick={addCurrentPosition}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <Plus size={20} />
              Add Current Position
            </button>
          )}
        </div>

        {/* Map Container */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <motion.div
            drag={isEditMode ? "x" : false}
            dragConstraints={false}
            onDrag={handleDrag}
            className="relative"
            style={{ x, y }}
          >
            <WorldMapViewport 
              locations={locations}
              viewportSettings={viewportSettings}
              isEditMode={isEditMode}
            />
          </motion.div>
        </div>

        {/* Locations List */}
        {locations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Saved Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div key={location.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{location.name}</h4>
                    <button
                      onClick={() => removeLocation(location.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>X: {location.coordinates.x}%</div>
                    <div>Y: {location.coordinates.y}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-900 bg-opacity-20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Enable Edit Mode" to start positioning</li>
            <li>Drag the map to position the viewport</li>
            <li>Click "Add Current Position" to save the location</li>
            <li>Click "Export Locations" to copy the coordinate data</li>
            <li>Paste the exported data into your mapLocations.js file</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WorldMapEditor; 