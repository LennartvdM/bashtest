/**
 * CalibrationToolbox — Dev overlay for tuning IntroSlide animation parameters.
 *
 * Renders a draggable panel with sliders for every tuneable timing, spring,
 * and rotation value. Values are passed up via `onChange(params)` on every
 * slider move, so the parent can spread them into IntroSlide / NeoflixLogo.
 *
 * Usage:
 *   const [params, setParams] = useState(DEFAULT_PARAMS);
 *   <CalibrationToolbox onChange={setParams} />
 *   <IntroSlide {...params.slide} logoProps={params.logo} />
 */
import { useState, useCallback, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Default values (mirrors production defaults)
// ---------------------------------------------------------------------------

export const DEFAULT_PARAMS = {
  // IntroSlide timing
  readyDelay: 300,       // useReadyToDrop minDelayMs
  headlineDelay: 2400,   // ms after readyToDrop to show headline

  // Drop physics (rigid-body simulation)
  dropStartY: -600,
  dropGravity: 2800,        // px/s²
  dropRestitution: 0.45,    // coefficient of restitution (0=dead stop, 1=perfect bounce)
  dropTilt: 2,              // initial tilt in degrees (positive = clockwise)
  dropSpin: 0,              // initial angular velocity in deg/s
  dropHalfWidth: 200,       // effective half-width for corner contact (px)
  dropAngularDamping: 0.02, // continuous angular friction per second

  // Headline tween
  headlineDuration: 0.8,
  headlineStartY: 16,

  // NeoflixLogo — assembly spring (SPRING_HEAVY)
  assemblyDamping: 24,
  assemblyMass: 9,
  assemblyStiffness: 500,

  // NeoflixLogo — clatter spring (SPRING_CLATTER)
  clatterDamping: 4,
  clatterMass: 5,
  clatterStiffness: 200,

  // NeoflixLogo — ring rotations
  innerSplayed: -62,
  innerHover: -6,
  outerSplayed: 97,
  outerHover: 5,

  // NeoflixLogo — clatter impulse
  clatterInner: -14,
  clatterOuter: 11,

  // NeoflixLogo — timing
  autoPlayDelay: 300,
  clatterDelay: 340,

  // RecordReflectRefine
  cycleDelay: 1800,

  // Logo margin
  logoMarginBottom: 60,
};

// ---------------------------------------------------------------------------
// Slider definitions — grouped by section
// ---------------------------------------------------------------------------

const SECTIONS = [
  {
    label: "Drop physics",
    keys: [
      { key: "readyDelay", label: "Ready delay", min: 0, max: 1000, step: 50, unit: "ms" },
      { key: "dropStartY", label: "Start Y", min: -1200, max: 0, step: 10, unit: "px" },
      { key: "dropGravity", label: "Gravity", min: 500, max: 6000, step: 100, unit: "px/s²" },
      { key: "dropRestitution", label: "Restitution", min: 0, max: 0.95, step: 0.01 },
      { key: "dropTilt", label: "Initial tilt", min: -15, max: 15, step: 0.5, unit: "°" },
      { key: "dropSpin", label: "Initial spin", min: -90, max: 90, step: 1, unit: "°/s" },
      { key: "dropHalfWidth", label: "Half-width", min: 50, max: 500, step: 10, unit: "px" },
      { key: "dropAngularDamping", label: "Ang. damping", min: 0, max: 0.2, step: 0.005 },
    ],
  },
  {
    label: "Assembly spring",
    keys: [
      { key: "assemblyDamping", label: "Damping", min: 1, max: 60, step: 1 },
      { key: "assemblyMass", label: "Mass", min: 1, max: 20, step: 0.5 },
      { key: "assemblyStiffness", label: "Stiffness", min: 50, max: 1000, step: 10 },
    ],
  },
  {
    label: "Clatter spring",
    keys: [
      { key: "clatterDelay", label: "Delay", min: 0, max: 2000, step: 50, unit: "ms" },
      { key: "clatterDamping", label: "Damping", min: 1, max: 30, step: 0.5 },
      { key: "clatterMass", label: "Mass", min: 1, max: 15, step: 0.5 },
      { key: "clatterStiffness", label: "Stiffness", min: 20, max: 600, step: 10 },
      { key: "clatterInner", label: "Inner impulse", min: -40, max: 0, step: 1, unit: "°" },
      { key: "clatterOuter", label: "Outer impulse", min: 0, max: 40, step: 1, unit: "°" },
    ],
  },
  {
    label: "Ring rotations",
    keys: [
      { key: "innerSplayed", label: "Inner splayed", min: -180, max: 0, step: 1, unit: "°" },
      { key: "innerHover", label: "Inner hover", min: -30, max: 0, step: 0.5, unit: "°" },
      { key: "outerSplayed", label: "Outer splayed", min: 0, max: 180, step: 1, unit: "°" },
      { key: "outerHover", label: "Outer hover", min: 0, max: 30, step: 0.5, unit: "°" },
      { key: "autoPlayDelay", label: "Unfurl delay", min: 0, max: 1500, step: 50, unit: "ms" },
    ],
  },
  {
    label: "Headline",
    keys: [
      { key: "headlineDelay", label: "Show delay", min: 500, max: 5000, step: 100, unit: "ms" },
      { key: "headlineDuration", label: "Duration", min: 0.1, max: 2, step: 0.05, unit: "s" },
      { key: "headlineStartY", label: "Start Y", min: 0, max: 60, step: 1, unit: "px" },
      { key: "cycleDelay", label: "Cycle delay", min: 500, max: 5000, step: 100, unit: "ms" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalibrationToolbox({ onChange, defaultParams }) {
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...defaultParams }));
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Notify parent on every change
  useEffect(() => {
    onChange?.(params);
  }, [params, onChange]);

  const update = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    const fresh = { ...DEFAULT_PARAMS, ...defaultParams };
    setParams(fresh);
  }, [defaultParams]);

  const copyToClipboard = useCallback(() => {
    const output = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== DEFAULT_PARAMS[k]) output[k] = v;
    }
    const text = Object.keys(output).length
      ? JSON.stringify(output, null, 2)
      : "// All values are at defaults";
    navigator.clipboard?.writeText(text);
  }, [params]);

  // Replay: toggle readyToDrop off→on
  const [replayKey, setReplayKey] = useState(0);
  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  // Drag handling
  const onPointerDown = useCallback((e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  }, [dragging]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  // Expose replayKey so parent can use it as a key prop to remount IntroSlide
  useEffect(() => {
    onChange?.({ ...params, _replayKey: replayKey });
  }, [replayKey]);

  return (
    <div
      ref={panelRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 99999,
        width: collapsed ? 200 : 310,
        maxHeight: collapsed ? "auto" : "90vh",
        overflowY: collapsed ? "hidden" : "auto",
        backgroundColor: "rgba(15, 15, 20, 0.92)",
        backdropFilter: "blur(12px)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#e0e0e0",
        fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
        fontSize: 11,
        padding: collapsed ? "8px 12px" : "10px 14px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: collapsed ? 0 : 8 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#48c1c4", letterSpacing: 0.5 }}>
          Calibration
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {!collapsed && (
            <>
              <ToolBtn onClick={replay} title="Replay animation">↻</ToolBtn>
              <ToolBtn onClick={copyToClipboard} title="Copy changed values">📋</ToolBtn>
              <ToolBtn onClick={resetAll} title="Reset all">⟲</ToolBtn>
            </>
          )}
          <ToolBtn onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? "▸" : "▾"}
          </ToolBtn>
        </div>
      </div>

      {!collapsed && SECTIONS.map((section) => (
        <div key={section.label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {section.label}
          </div>
          {section.keys.map(({ key, label, min, max, step, unit }) => (
            <SliderRow
              key={key}
              label={label}
              unit={unit}
              value={params[key]}
              min={min}
              max={max}
              step={step}
              isDefault={params[key] === DEFAULT_PARAMS[key]}
              onChange={(v) => update(key, v)}
              onReset={() => update(key, DEFAULT_PARAMS[key])}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SliderRow({ label, unit = "", value, min, max, step, isDefault, onChange, onReset }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, height: 22 }}>
      <span
        style={{
          width: 90,
          fontSize: 10,
          color: isDefault ? "#999" : "#48c1c4",
          flexShrink: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
        title={`Double-click to reset ${label}`}
        onDoubleClick={onReset}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.max(min, Math.min(max, value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, height: 4, accentColor: "#48c1c4", cursor: "pointer" }}
      />
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        style={{
          width: 52,
          fontSize: 10,
          color: isDefault ? "#666" : "#ccc",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          textAlign: "right",
          padding: "1px 4px",
          height: 18,
          flexShrink: 0,
          fontFamily: "inherit",
          outline: "none",
        }}
        title={`Type any value${unit ? ` (${unit})` : ""}`}
      />
      {unit && (
        <span style={{ fontSize: 9, color: "#666", flexShrink: 0, width: 14 }}>
          {unit}
        </span>
      )}
    </div>
  );
}

function ToolBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        color: "#ccc",
        fontSize: 12,
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

CalibrationToolbox.displayName = "CalibrationToolbox";
