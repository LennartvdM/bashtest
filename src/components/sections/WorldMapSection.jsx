import React, { useRef, useState, useEffect } from "react"
import { motion, useSpring, useTransform, animate } from "framer-motion"
import { Settings, Plus, Copy, Trash2, Eye, EyeOff, Move, Play, Save, MapPin, Zap, ZapOff, Upload, Download } from "lucide-react"

// World Map Viewport Component
function WorldMapViewport({ x, y, zoom, showCrosshair, transitionDuration, peakZoom, disableSpring, onViewportChange }) {
    const containerRef = useRef(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [isDragging, setIsDragging] = useState(false)

    const svgWidth = 1440
    const svgHeight = 700

    const springConfig = {
        damping: 15,
        stiffness: 30,
        mass: 1,
    }

    // Always use spring animations, but control the spring stiffness
    const effectiveSpringConfig = disableSpring ? {
        damping: 1000, // Very high damping for immediate response
        stiffness: 1000, // Very high stiffness for immediate response
        mass: 0.1, // Low mass for quick response
    } : springConfig

    const motionX = useSpring(x, effectiveSpringConfig)
    const motionY = useSpring(y, effectiveSpringConfig)
    const motionZoom = useSpring(zoom, effectiveSpringConfig)

    useEffect(() => {
        motionX.set(x)
        motionY.set(y)

        if (!disableSpring) {
            const animateZoom = async () => {
                await motionZoom.set(peakZoom, { duration: transitionDuration / 2 })
                await motionZoom.set(zoom, { duration: transitionDuration / 2 })
            }
            animateZoom()
        } else {
            motionZoom.set(zoom)
        }
    }, [x, y, zoom, transitionDuration, peakZoom, disableSpring])

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect()
                setContainerSize({ width, height })
            }
        }

        updateSize()
        window.addEventListener("resize", updateSize)
        return () => window.removeEventListener("resize", updateSize)
    }, [])

    const calculateViewBox = (x, y, zoom) => {
        if (containerSize.width && containerSize.height) {
            const scaleFactor = containerSize.height / svgHeight
            const viewBoxHeight = svgHeight / zoom
            const viewBoxWidth = containerSize.width / scaleFactor / zoom

            const viewBoxX = x - viewBoxWidth / 2
            const viewBoxY = y - viewBoxHeight / 2

            return `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
        }
        return `0 0 ${svgWidth} ${svgHeight}`
    }

    const viewBox = useTransform([motionX, motionY, motionZoom], (latest) =>
        calculateViewBox(...latest)
    )

    const handleMouseDown = (e) => {
        if (!onViewportChange) return
        setIsDragging(true)
        const rect = containerRef.current.getBoundingClientRect()
        const startX = e.clientX
        const startY = e.clientY
        const startViewX = x
        const startViewY = y

        const handleMouseMove = (e) => {
            const dx = e.clientX - startX
            const dy = e.clientY - startY
            
            // Convert pixel movement to SVG coordinates based on zoom
            const scaleFactor = containerSize.height / svgHeight
            const moveFactorX = (svgWidth / scaleFactor / zoom) / containerSize.width
            const moveFactorY = (svgHeight / zoom) / containerSize.height
            
            onViewportChange({ 
                x: Math.round(startViewX - dx * moveFactorX), 
                y: Math.round(startViewY - dy * moveFactorY), 
                zoom 
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                cursor: onViewportChange ? (isDragging ? 'grabbing' : 'grab') : 'default',
                borderRadius: '8px',
                background: 'linear-gradient(to bottom, #D3E3E3, #529C9C)',
            }}
            onMouseDown={handleMouseDown}
        >
            <motion.svg
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                viewBox={viewBox}
            >
                <image
                    href="/worldmap.svg"
                    width={svgWidth}
                    height={svgHeight}
                />
            </motion.svg>
            {showCrosshair && (
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }}
                >
                    <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="100%"
                        stroke="red"
                        strokeWidth="2"
                    />
                    <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="red"
                        strokeWidth="2"
                    />
                </svg>
            )}
        </div>
    )
}

// Main World Map Section Component
export default function WorldMapSection({ inView, sectionRef }) {
    const [editMode, setEditMode] = useState(false)
    const [showPanel, setShowPanel] = useState(true)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playIndex, setPlayIndex] = useState(0)
    const fileInputRef = useRef(null)
    
    // Each location has a pair: OUT (zoomed out) and IN (zoomed in)
    const [locationPairs, setLocationPairs] = useState([
        {
            id: 1,
            name: "Amsterdam",
            out: { x: 696, y: 164, zoom: 1 }, // zoom-out segment
            in: { x: 696, y: 164, zoom: 5 }   // zoom-in segment
        },
        {
            id: 2,
            name: "Vienna", 
            out: { x: 713, y: 197, zoom: 1 }, // zoom-out segment
            in: { x: 713, y: 197, zoom: 5 }   // zoom-in segment
        },
        {
            id: 3,
            name: "Budapest",
            out: { x: 725, y: 201, zoom: 1 }, // zoom-out segment
            in: { x: 725, y: 201, zoom: 5 }   // zoom-in segment
        },
    ])
    
    const [viewportSettings, setViewportSettings] = useState({
        x: 720,
        y: 350,
        zoom: 1,
        showCrosshair: false,
        transitionDuration: 1.5,
        peakZoom: 0.8,
        disableSpring: false
    })

    // Global animation parameters (one set for all locations)
    // Zoom-in level (where the camera settles per location)
    const [zoomInLevel, setZoomInLevel] = useState(5)
    // Zoom-out duration in seconds (hold while zoomed out)
    const [zoomOutDuration, setZoomOutDuration] = useState(2)
    // Zoom-in duration in seconds (hold while zoomed in)
    const [zoomInDuration, setZoomInDuration] = useState(5)

    // SVG path for the map - you'll need to replace this with your actual worldmap.svg path
    const [svgPath, setSvgPath] = useState("/worldmap.svg")

    // Auto-play through location pairs: OUT then IN for each location
    useEffect(() => {
        if (!isPlaying || locationPairs.length === 0) return

        const steps = locationPairs.flatMap((pair) => ([
            { type: 'out', pair: pair },
            { type: 'in', pair: pair },
        ]))

        const currentStep = steps[playIndex % steps.length]

        // Apply the step
        if (currentStep.type === 'out') {
            // Move to location at zoom-out level
            setViewportSettings(prev => ({
                ...prev,
                x: currentStep.pair.out.x,
                y: currentStep.pair.out.y,
                zoom: currentStep.pair.out.zoom,
            }))
            setCurrentLocation(currentStep.pair)
        } else {
            // Stay on same location and animate to zoom-in level
            setViewportSettings(prev => ({
                ...prev,
                x: currentStep.pair.in.x,
                y: currentStep.pair.in.y,
                zoom: currentStep.pair.in.zoom,
            }))
            setCurrentLocation(currentStep.pair)
        }

        // Determine delay: include transition time only on IN to account for zoom animation
        const delayMs = currentStep.type === 'out'
            ? Math.max(0, zoomOutDuration) * 1000
            : (Math.max(0, zoomInDuration) * 1000) + (Math.max(0, viewportSettings.transitionDuration) * 1000)

        const timeoutId = setTimeout(() => {
            setPlayIndex((i) => i + 1)
        }, delayMs)

        return () => clearTimeout(timeoutId)
    }, [isPlaying, locationPairs, playIndex, zoomOutDuration, zoomInDuration, viewportSettings.transitionDuration])

    const addLocationPair = () => {
        const newPair = {
            id: Date.now(),
            name: `Location ${locationPairs.length + 1}`,
            out: { 
                x: viewportSettings.x, 
                y: viewportSettings.y, 
                zoom: viewportSettings.peakZoom 
            },
            in: { 
                x: viewportSettings.x, 
                y: viewportSettings.y, 
                zoom: zoomInLevel 
            }
        }
        setLocationPairs([...locationPairs, newPair])
        setCurrentLocation(newPair)
    }

    const updateLocationPair = (id, updates) => {
        setLocationPairs(locationPairs.map(pair => 
            pair.id === id ? { ...pair, ...updates } : pair
        ))
    }

    const deleteLocationPair = (id) => {
        setLocationPairs(locationPairs.filter(pair => pair.id !== id))
        if (currentLocation?.id === id) {
            setCurrentLocation(null)
        }
    }

    const goToLocationPair = (pair) => {
        setViewportSettings({
            ...viewportSettings,
            x: pair.in.x,
            y: pair.in.y,
            zoom: pair.in.zoom
        })
        setCurrentLocation(pair)
    }

    const handleViewportChange = (newSettings) => {
        setViewportSettings({ ...viewportSettings, ...newSettings })
        if (currentLocation && editMode) {
            // Update the IN segment of the current pair
            updateLocationPair(currentLocation.id, {
                in: { ...currentLocation.in, ...newSettings }
            })
        }
    }

    const exportLocations = () => {
        const code = `export const locationPairs = ${JSON.stringify(locationPairs, null, 2)};

export const defaultViewportSettings = {
  showCrosshair: false,
  transitionDuration: ${viewportSettings.transitionDuration},
  peakZoom: ${viewportSettings.peakZoom},
  disableSpring: ${viewportSettings.disableSpring},
  zoomInLevel: ${zoomInLevel},
  zoomOutDuration: ${zoomOutDuration},
  zoomInDuration: ${zoomInDuration}
};`
        
        navigator.clipboard.writeText(code)
        alert('Location data copied to clipboard!')
    }

    const saveToLocalStorage = () => {
        localStorage.setItem('worldMapLocationPairs', JSON.stringify(locationPairs))
        localStorage.setItem('worldMapSettings', JSON.stringify({
            ...viewportSettings,
            zoomInLevel,
            zoomOutDuration,
            zoomInDuration
        }))
        alert('Location pairs saved!')
    }

    const loadFromLocalStorage = () => {
        const savedPairs = localStorage.getItem('worldMapLocationPairs')
        const savedSettings = localStorage.getItem('worldMapSettings')
        
        if (savedPairs) {
            setLocationPairs(JSON.parse(savedPairs))
        }
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings)
            setViewportSettings(parsed)
            if (typeof parsed.zoomInLevel === 'number') setZoomInLevel(parsed.zoomInLevel)
            if (typeof parsed.zoomOutDuration === 'number') setZoomOutDuration(parsed.zoomOutDuration)
            // Backward compat: support zoomInHoldDuration key
            if (typeof parsed.zoomInHoldDuration === 'number') setZoomInDuration(parsed.zoomInHoldDuration)
            if (typeof parsed.zoomInDuration === 'number') setZoomInDuration(parsed.zoomInDuration)
        }
    }

    const importFromFile = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target.result
                
                // Try to parse as JSON first
                let data
                try {
                    data = JSON.parse(content)
                } catch {
                    // If not JSON, try to extract from the exported code format
                    const locationsMatch = content.match(/export const mapLocations = (\[[\s\S]*?\]);/)
                    const pairsMatch = content.match(/export const locationPairs = (\[[\s\S]*?\]);/)
                    const settingsMatch = content.match(/export const defaultViewportSettings = ([\s\S]*?);/)
                    
                    if (pairsMatch) {
                        data = {
                            locationPairs: JSON.parse(pairsMatch[1]),
                            settings: settingsMatch ? JSON.parse(settingsMatch[1]) : null
                        }
                    } else if (locationsMatch) {
                        // Convert old format to new format
                        const oldLocations = JSON.parse(locationsMatch[1])
                        const newPairs = oldLocations.map(loc => ({
                            id: loc.id,
                            name: loc.name,
                            out: { x: loc.x, y: loc.y, zoom: 1 },
                            in: { x: loc.x, y: loc.y, zoom: loc.zoom || 5 }
                        }))
                        data = {
                            locationPairs: newPairs,
                            settings: settingsMatch ? JSON.parse(settingsMatch[1]) : null
                        }
                    } else {
                        throw new Error('Invalid file format')
                    }
                }

                // Handle different data structures
                if (data.locationPairs && Array.isArray(data.locationPairs)) {
                    setLocationPairs(data.locationPairs)
                } else if (data.locations && Array.isArray(data.locations)) {
                    // Convert old format
                    const newPairs = data.locations.map(loc => ({
                        id: loc.id,
                        name: loc.name,
                        out: { x: loc.x, y: loc.y, zoom: 1 },
                        in: { x: loc.x, y: loc.y, zoom: loc.zoom || 5 }
                    }))
                    setLocationPairs(newPairs)
                } else if (Array.isArray(data)) {
                    // Assume it's an array of pairs
                    setLocationPairs(data)
                } else {
                    throw new Error('No valid location pairs found')
                }

                if (data.settings) {
                    setViewportSettings(prev => ({ ...prev, ...data.settings }))
                    if (typeof data.settings.zoomInLevel === 'number') setZoomInLevel(data.settings.zoomInLevel)
                    if (typeof data.settings.zoomOutDuration === 'number') setZoomOutDuration(data.settings.zoomOutDuration)
                    if (typeof data.settings.zoomInHoldDuration === 'number') setZoomInDuration(data.settings.zoomInHoldDuration)
                    if (typeof data.settings.zoomInDuration === 'number') setZoomInDuration(data.settings.zoomInDuration)
                }

                alert('File imported successfully!')
            } catch (error) {
                alert('Error importing file: ' + error.message)
            }
        }
        reader.readAsText(file)
        
        // Reset file input
        event.target.value = ''
    }

    const downloadLocations = () => {
        const data = {
            locationPairs: locationPairs,
            settings: {
                showCrosshair: viewportSettings.showCrosshair,
                transitionDuration: viewportSettings.transitionDuration,
                peakZoom: viewportSettings.peakZoom,
                disableSpring: viewportSettings.disableSpring,
                zoomInLevel,
                zoomOutDuration,
                zoomInDuration
            }
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'worldmap-locations.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Load saved data on mount
    useEffect(() => {
        loadFromLocalStorage()
    }, [])

    return (
        <div ref={sectionRef} className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="h-full flex">
                {/* Map Container */}
                <div className="flex-1 relative">
                    <WorldMapViewport
                        {...viewportSettings}
                        onViewportChange={editMode ? handleViewportChange : null}
                    />
                    
                    {/* Floating Controls */}
                    <div className="absolute top-20 left-4 flex gap-2">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`p-2 rounded-lg transition-colors ${
                                editMode 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            title={editMode ? "Disable Edit Mode" : "Enable Edit Mode"}
                        >
                            <Move size={20} />
                        </button>
                        
                        <button
                            onClick={() => setViewportSettings({
                                ...viewportSettings,
                                showCrosshair: !viewportSettings.showCrosshair
                            })}
                            className={`p-2 rounded-lg transition-colors ${
                                viewportSettings.showCrosshair 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            title="Toggle Crosshair"
                        >
                            {viewportSettings.showCrosshair ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                        
                        <button
                            onClick={() => setViewportSettings({
                                ...viewportSettings,
                                disableSpring: !viewportSettings.disableSpring
                            })}
                            className={`p-2 rounded-lg transition-colors ${
                                viewportSettings.disableSpring 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            title={viewportSettings.disableSpring ? "Enable Spring Animations" : "Disable Spring Animations"}
                        >
                            {viewportSettings.disableSpring ? <ZapOff size={20} /> : <Zap size={20} />}
                        </button>
                        
                        <button
                            onClick={() => setShowPanel(!showPanel)}
                            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Toggle Panel"
                        >
                            <Settings size={20} />
                        </button>
                        
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`p-2 rounded-lg transition-colors ${
                                isPlaying 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            title={isPlaying ? "Stop Auto-play" : "Start Auto-play"}
                        >
                            <Play size={20} />
                        </button>

                        <button
                            onClick={saveToLocalStorage}
                            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Save to Browser"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                    
                    {/* Current Position Display */}
                    {editMode && (
                        <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg">
                            <div className="text-sm font-mono">
                                X: {viewportSettings.x} | Y: {viewportSettings.y} | Zoom-in level: {zoomInLevel.toFixed(1)} | Zoom-out level: {viewportSettings.peakZoom.toFixed(1)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                {showPanel && (
                    <div className="w-96 bg-gray-800 text-white p-6 overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Location Pairs</h2>
                        
                        {/* Import/Export Buttons */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                title="Import from file"
                            >
                                <Upload size={16} />
                                Import
                            </button>
                            <button
                                onClick={downloadLocations}
                                className="flex-1 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                title="Download as JSON"
                            >
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.json"
                            onChange={importFromFile}
                            style={{ display: 'none' }}
                        />
                        
                        {/* Location Pairs List */}
                        <div className="space-y-4 mb-6">
                            {locationPairs.map(pair => (
                                <div
                                    key={pair.id}
                                    className={`p-4 bg-gray-700 rounded-lg cursor-pointer transition-all ${
                                        currentLocation?.id === pair.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => goToLocationPair(pair)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {editMode && currentLocation?.id === pair.id ? (
                                                <input
                                                    type="text"
                                                    value={pair.name}
                                                    onChange={(e) => updateLocationPair(pair.id, { name: e.target.value })}
                                                    className="bg-gray-600 px-2 py-1 rounded w-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    {pair.name}
                                                </h3>
                                            )}
                                            
                                            {/* OUT segment */}
                                            <div className="mt-2 p-2 bg-gray-800 rounded border-l-2 border-blue-400">
                                                <div className="text-xs text-blue-400 font-medium mb-1">ZOOM OUT</div>
                                                <p className="text-sm text-gray-400">
                                                    X: {pair.out.x}, Y: {pair.out.y}, Zoom: {pair.out.zoom.toFixed(1)}
                                                </p>
                                            </div>
                                            
                                            {/* IN segment */}
                                            <div className="mt-2 p-2 bg-gray-800 rounded border-l-2 border-green-400">
                                                <div className="text-xs text-green-400 font-medium mb-1">ZOOM IN</div>
                                                <p className="text-sm text-gray-400">
                                                    X: {pair.in.x}, Y: {pair.in.y}, Zoom: {pair.in.zoom.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        {editMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteLocationPair(pair.id)
                                                }}
                                                className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                                title="Delete location pair"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Add Location Pair Button */}
                        {editMode && (
                            <button
                                onClick={addLocationPair}
                                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-6"
                            >
                                <Plus size={20} />
                                Add Current Position as Pair
                            </button>
                        )}
                        
                        {/* Settings */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="font-semibold mb-4">Viewport Settings</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Zoom-in level (global)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="20"
                                            step="0.1"
                                            value={zoomInLevel}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 1
                                                setZoomInLevel(val)
                                                setViewportSettings(prev => ({ ...prev, zoom: val }))
                                            }}
                                            className="flex-1 bg-gray-600 px-2 py-1 rounded text-sm"
                                        />
                                        <span className="text-xs text-gray-500">x</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm text-gray-400">Zoom-out duration (s)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="5"
                                            step="0.1"
                                            value={zoomOutDuration}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 2
                                                setZoomOutDuration(val)
                                            }}
                                            className="flex-1 bg-gray-600 px-2 py-1 rounded text-sm"
                                        />
                                        <span className="text-xs text-gray-500">s</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm text-gray-400">Zoom-out level</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="5"
                                            step="0.1"
                                            value={viewportSettings.peakZoom}
                                            onChange={(e) => setViewportSettings({
                                                ...viewportSettings,
                                                peakZoom: parseFloat(e.target.value) || 0.8
                                            })}
                                            className="flex-1 bg-gray-600 px-2 py-1 rounded text-sm"
                                        />
                                        <span className="text-xs text-gray-500">x</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">Zoom-in duration (s)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.1"
                                            value={zoomInDuration}
                                            onChange={(e) => setZoomInDuration(parseFloat(e.target.value) || 0)}
                                            className="flex-1 bg-gray-600 px-2 py-1 rounded text-sm"
                                        />
                                        <span className="text-xs text-gray-500">s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Export Button */}
                        <button
                            onClick={exportLocations}
                            className="w-full mt-6 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={20} />
                            Export Locations
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
} 