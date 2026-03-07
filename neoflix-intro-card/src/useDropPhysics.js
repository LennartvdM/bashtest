/**
 * useDropPhysics — Rigid-body drop with vibe-mapped physics.
 *
 * Instead of tuning raw physics parameters (restitution, angular damping,
 * moment of inertia, impulse coefficients), this exposes three intuitive
 * knobs that map to the underlying simulation:
 *
 * ┌─────────────┬────────────────────────────────────────────────────────┐
 * │  BOUNCINESS  │ How much life the drop has.                          │
 * │  (0–1)       │                                                      │
 * │              │ At 0: the logo hits the floor and stops dead.        │
 * │              │ At 1: it bounces several times before settling.      │
 * │              │                                                      │
 * │              │ Maps to:                                             │
 * │              │  • restitution (0 → 0.6) — how much velocity        │
 * │              │    survives each floor collision                     │
 * │              │  • per-impact vertical damping (0.2 → 0.8) — what   │
 * │              │    fraction of vy is kept after each bounce          │
 * ├─────────────┼────────────────────────────────────────────────────────┤
 * │  WOBBLE      │ How much rotational play the logo has.               │
 * │  (0–1)       │                                                      │
 * │              │ At 0: no tilt at all — drops perfectly straight.     │
 * │              │ At 1: enters with visible lean, rocks side to side   │
 * │              │   a few times before straightening.                  │
 * │              │                                                      │
 * │              │ Maps to:                                             │
 * │              │  • initialTilt (0° → 4°) — entry angle              │
 * │              │  • per-impact angular damping (0.1 → 0.7) — what    │
 * │              │    fraction of omega survives each bounce            │
 * │              │  • continuous angular decay is always aggressive     │
 * │              │    (the per-impact damping does the real work)       │
 * ├─────────────┼────────────────────────────────────────────────────────┤
 * │  SNAP        │ How quickly everything locks into its final pose.    │
 * │  (0–1)       │                                                      │
 * │              │ At 0: slow, floaty settle — takes over a second.    │
 * │              │ At 1: aggressive — motion dies in ~200ms after the  │
 * │              │   first bounce.                                      │
 * │              │                                                      │
 * │              │ Maps to:                                             │
 * │              │  • exponential decay rate — Math.pow(base, dt)       │
 * │              │    applied every frame to both vy and omega          │
 * │              │  • base goes from 0.3 (slow drain) to 0.001 (near   │
 * │              │    instant drain), meaning "fraction surviving per   │
 * │              │    second"                                           │
 * │              │  • settle thresholds widen with higher snap so the   │
 * │              │    sim exits earlier                                 │
 * └─────────────┴────────────────────────────────────────────────────────┘
 *
 * WHY THIS WORKS
 *
 * The original engine had a fundamental problem: the impulse-based collision
 * system transfers energy between linear and angular channels on every
 * bounce. With a tilted rod hitting a floor, corner A hits → angular
 * impulse → corner B swings down → hits → angular impulse back. The old
 * linear damping (omega *= 1 - c*dt) was too weak to overcome this energy
 * redistribution, causing permanent micro-vibration.
 *
 * The fix is twofold:
 *   1. Per-impact damping: after each collision impulse, immediately
 *      multiply both vy and omega by a survival fraction. This prevents
 *      the impulse system from sustaining oscillation.
 *   2. Exponential continuous decay: instead of `omega *= (1 - c*dt)`,
 *      use `omega *= Math.pow(survivalRate, dt)`. This is framerate-
 *      independent and drains energy predictably — survivalRate of 0.05
 *      means only 5% of velocity survives after one full second.
 *
 * The three vibe knobs are designed to be orthogonal:
 *   • Bounciness only affects what happens AT impact (restitution + vy damping)
 *   • Wobble only affects the rotational axis (tilt + omega damping)
 *   • Snap affects the global energy drain BETWEEN impacts (continuous decay)
 *
 * So you can dial in "bouncy but not wobbly" or "wobbly but snaps into
 * place fast" without parameters fighting each other.
 *
 * RECOMMENDED STARTING POINT for "barely there, feels natural":
 *   bounciness: 0.3, wobble: 0.2, snap: 0.7
 */
import { useEffect, useRef, useState } from "react";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/* ── Vibe → Physics mapping ─────────────────────────────────────────── */

function mapVibes({ bounciness = 0.3, wobble = 0.2, snap = 0.7 }) {
  // Clamp inputs
  const b = Math.max(0, Math.min(1, bounciness));
  const w = Math.max(0, Math.min(1, wobble));
  const s = Math.max(0, Math.min(1, snap));

  return {
    // Bounciness → restitution + vertical survival per impact
    restitution: b * 0.6,
    impactVySurvival: 0.2 + b * 0.6,       // 0.2 (dead) → 0.8 (lively)

    // Wobble → initial tilt + angular survival per impact
    initialTilt: w * 4,                      // 0° → 4°
    impactOmegaSurvival: 0.1 + w * 0.6,     // 0.1 (killed) → 0.7 (ringy)

    // Snap → continuous exponential decay (fraction surviving per second)
    // Lower = faster drain. Using exponential mapping for perceptual linearity.
    decayPerSecond: Math.pow(0.001, 0.3 + s * 0.7),
    // s=0 → pow(0.001, 0.3) ≈ 0.14 (14% survives/sec — slow)
    // s=1 → pow(0.001, 1.0) = 0.001 (0.1% survives/sec — instant)

    // Settle thresholds widen with snap for earlier exit
    settleVy: 3 + s * 12,                   // 3 → 15 px/s
    settleOmega: 0.01 + s * 0.05,           // 0.01 → 0.06 rad/s
    settleTheta: 0.003 + s * 0.01,          // 0.003 → 0.013 rad
  };
}

/* ── Hook ────────────────────────────────────────────────────────────── */

/**
 * @param {React.RefObject} ref — DOM element to animate
 * @param {Object} options
 * @param {boolean}  options.enabled      — Start simulation when true
 * @param {number}   options.bounciness   — 0–1 (default 0.3)
 * @param {number}   options.wobble       — 0–1 (default 0.2)
 * @param {number}   options.snap         — 0–1 (default 0.7)
 * @param {number}   options.gravity      — px/s² (default 2800)
 * @param {number}   options.startY       — Starting y in px (default -600)
 * @param {number}   options.halfWidth    — Half-width of logo in px (default 200)
 * @param {Function} options.onImpact     — Called on first floor contact
 * @param {Function} options.onSettle     — Called when simulation comes to rest
 * @returns {{ settled: boolean }}
 */
export default function useDropPhysics(ref, {
  enabled = false,
  bounciness = 0.3,
  wobble = 0.2,
  snap = 0.7,
  gravity = 2800,
  startY = -600,
  halfWidth = 200,
  onImpact,
  onSettle,
} = {}) {
  const [settled, setSettled] = useState(false);
  const impactFired = useRef(false);

  const onImpactRef = useRef(onImpact);
  const onSettleRef = useRef(onSettle);
  useEffect(() => { onImpactRef.current = onImpact; }, [onImpact]);
  useEffect(() => { onSettleRef.current = onSettle; }, [onSettle]);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    setSettled(false);
    impactFired.current = false;

    const el = ref.current;
    const phys = mapVibes({ bounciness, wobble, snap });

    // Physics state
    let y = startY;
    let vy = 0;
    let theta = phys.initialTilt * DEG2RAD;
    let omega = 0;

    // Rigid body
    const hw = halfWidth;
    const mass = 1;
    const I = mass * (2 * hw) * (2 * hw) / 12;

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
      if (dt > 0.05) dt = 0.05;

      // ── Integrate ──
      vy += gravity * dt;
      y += vy * dt;
      theta += omega * dt;

      // ── Continuous exponential decay (framerate-independent) ──
      const decayFactor = Math.pow(phys.decayPerSecond, dt);
      omega *= decayFactor;

      // Only decay vy when falling slowly / bouncing, not during initial drop
      if (impactFired.current) {
        vy *= decayFactor;
      }

      // ── Floor collision ──
      const sinTheta = Math.sin(theta);
      const leftCornerY = y + hw * sinTheta;
      const rightCornerY = y - hw * sinTheta;
      const maxCornerY = Math.max(leftCornerY, rightCornerY);

      if (maxCornerY > 0) {
        if (!impactFired.current) {
          impactFired.current = true;
          onImpactRef.current?.();
        }

        const d = leftCornerY >= rightCornerY ? hw : -hw;
        const vContact = vy + omega * d;

        if (vContact > 0) {
          const impulse = -(1 + phys.restitution) * vContact / (1 / mass + (d * d) / I);
          vy += impulse / mass;
          omega += (impulse * d) / I;

          // ── Per-impact energy drain ──
          // This is the key fix: prevent impulse ping-pong between
          // linear and angular channels from sustaining oscillation
          vy *= phys.impactVySurvival;
          omega *= phys.impactOmegaSurvival;
        }

        y -= maxCornerY;
      }

      // ── Settle check ──
      const isNearFloor = y >= -0.5 && y <= 0;
      const isSlowV = Math.abs(vy) < phys.settleVy;
      const isSlowO = Math.abs(omega) < phys.settleOmega;
      const isFlat = Math.abs(theta) < phys.settleTheta;

      if (isNearFloor && isSlowV && isSlowO && isFlat) {
        y = 0;
        theta = 0;
        el.style.transform = "translateY(0px) rotate(0deg)";
        setSettled(true);
        onSettleRef.current?.();
        return;
      }

      el.style.transform = `translateY(${y}px) rotate(${theta * RAD2DEG}deg)`;
      frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [enabled, bounciness, wobble, snap, gravity, startY, halfWidth]);

  return { settled };
}
