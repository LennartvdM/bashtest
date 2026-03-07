/**
 * useDropPhysics — Rigid-body drop simulation with hard floor and tilt.
 *
 * Why not springs? Framer-motion springs allow overshoot, meaning the logo
 * can bounce *through* the floor. This hook runs a real physics simulation:
 *   - Gravity accelerates the logo downward
 *   - The floor at y=0 is an absolute constraint (never penetrated)
 *   - The logo is modelled as a rigid bar with width, so an initial tilt
 *     means one corner hits first, creating asymmetric angular bounce
 *   - Energy is lost on each bounce via the restitution coefficient
 *   - No squash — just translateY + rotate
 *
 * The simulation runs via requestAnimationFrame and applies transforms
 * directly to the DOM element (no React state per frame).
 *
 * Dependencies: React 18+
 */
import { useEffect, useRef, useCallback, useState } from "react";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * @param {React.RefObject} ref — DOM element to animate
 * @param {Object} options
 * @param {boolean}  options.enabled          — Start simulation when true
 * @param {number}   options.gravity          — px/s² (default 2800)
 * @param {number}   options.restitution      — Coefficient of restitution, 0–1 (default 0.45)
 * @param {number}   options.initialY         — Starting y in px, negative = above rest (default -600)
 * @param {number}   options.initialTilt      — Starting rotation in degrees (default 2)
 * @param {number}   options.initialSpin      — Starting angular velocity in deg/s (default 0)
 * @param {number}   options.halfWidth        — Half-width of logo for contact point calc (default 200)
 * @param {number}   options.angularDamping   — Continuous angular friction per second, 0–1 (default 0.02)
 * @param {number}   options.settleThreshold  — Stop sim when bounce amplitude < this px (default 0.5)
 * @param {Function} options.onImpact         — Called on first floor contact
 * @param {Function} options.onSettle         — Called when simulation comes to rest
 * @returns {{ settled: boolean }}
 */
export default function useDropPhysics(ref, {
  enabled = false,
  gravity = 2800,
  restitution = 0.45,
  initialY = -600,
  initialTilt = 2,
  initialSpin = 0,
  halfWidth = 200,
  angularDamping = 0.02,
  settleThreshold = 0.5,
  onImpact,
  onSettle,
} = {}) {
  const [settled, setSettled] = useState(false);
  const impactFired = useRef(false);

  // Stable callback refs so the rAF loop doesn't re-bind
  const onImpactRef = useRef(onImpact);
  const onSettleRef = useRef(onSettle);
  useEffect(() => { onImpactRef.current = onImpact; }, [onImpact]);
  useEffect(() => { onSettleRef.current = onSettle; }, [onSettle]);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    setSettled(false);
    impactFired.current = false;

    const el = ref.current;

    // Physics state
    let y = initialY;         // px, negative = above rest, 0 = floor
    let vy = 0;               // px/s
    let theta = initialTilt * DEG2RAD;  // radians
    let omega = initialSpin * DEG2RAD;  // rad/s

    // Rigid body constants
    const hw = halfWidth;
    const mass = 1;
    const I = mass * (2 * hw) * (2 * hw) / 12; // moment of inertia (uniform rod)
    const e = restitution;

    let lastTime = null;
    let frameId;

    function step(timestamp) {
      if (lastTime === null) {
        lastTime = timestamp;
        el.style.transform = `translateY(${y}px) rotate(${theta * RAD2DEG}deg)`;
        frameId = requestAnimationFrame(step);
        return;
      }

      let dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Cap dt to prevent explosion after tab switch
      if (dt > 0.05) dt = 0.05;

      // --- Integrate ---
      vy += gravity * dt;
      y += vy * dt;
      theta += omega * dt;

      // Angular damping (small continuous friction so tilt decays)
      omega *= (1 - angularDamping * dt);

      // --- Floor collision ---
      // Corner positions: left = y + hw*sin(θ), right = y - hw*sin(θ)
      const sinTheta = Math.sin(theta);
      const leftCornerY = y + hw * sinTheta;
      const rightCornerY = y - hw * sinTheta;

      // Which corner is lowest (largest y = closest to/past floor)?
      const maxCornerY = Math.max(leftCornerY, rightCornerY);

      if (maxCornerY > 0) {
        // Floor penetration detected
        if (!impactFired.current) {
          impactFired.current = true;
          onImpactRef.current?.();
        }

        // Contact point offset from center
        const d = leftCornerY >= rightCornerY ? hw : -hw;

        // Velocity of contact point (vertical component)
        const vContact = vy + omega * d;

        if (vContact > 0) {
          // Moving into floor — resolve with impulse
          const impulse = -(1 + e) * vContact / (1 / mass + (d * d) / I);
          vy += impulse / mass;
          omega += (impulse * d) / I;
        }

        // Position correction: lift center so contact corner sits at floor
        y -= maxCornerY;
      }

      // --- Settle check ---
      const isNearFloor = y >= -settleThreshold && y <= 0;
      const isSlowVertical = Math.abs(vy) < 3;
      const isSlowRotation = Math.abs(omega) < 0.01;
      const isFlatEnough = Math.abs(theta) < 0.003;

      if (isNearFloor && isSlowVertical && isSlowRotation && isFlatEnough) {
        y = 0;
        theta = 0;
        el.style.transform = "translateY(0px) rotate(0deg)";
        setSettled(true);
        onSettleRef.current?.();
        return; // stop loop
      }

      el.style.transform = `translateY(${y}px) rotate(${theta * RAD2DEG}deg)`;
      frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [enabled, gravity, restitution, initialY, initialTilt, initialSpin, halfWidth, angularDamping, settleThreshold]);

  return { settled };
}
