import React from 'react';
import { motion } from 'framer-motion';

const WorldMapViewport = ({ locations, viewportSettings, isEditMode }) => {
  // Using external SVG file for the world map
  // The actual SVG from https://github.com/LennartvdM/kaart/blob/main/worldmap.svg
  // should be placed in the worldmap.svg file with transparent oceans and white land mass

  return (
    <div className="relative w-full h-[600px] bg-blue-50">
      {/* Map Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src="/worldmap.svg"
          alt="World Map"
          className="w-full h-full object-contain"
          style={{ filter: 'brightness(1.1) contrast(1.1)' }}
        />
      </div>

      {/* Crosshair for positioning (only in edit mode) */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500 opacity-50 transform -translate-x-1/2" />
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500 opacity-50 transform -translate-y-1/2" />
          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Location markers */}
      {locations.map((location) => (
        <motion.div
          key={location.id}
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${location.coordinates.x}%`,
            top: `${location.coordinates.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
        >
          {/* Location tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
            {location.name}
          </div>
        </motion.div>
      ))}

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          EDIT MODE
        </div>
      )}

      {/* Instructions overlay */}
      {isEditMode && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Drag to position the viewport, then click "Add Current Position"</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMapViewport; 