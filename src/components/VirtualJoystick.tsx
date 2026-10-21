import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Compass, Move } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (heading: { x: number; y: number }, intensity: number) => void;
  onRelease: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onRelease }) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const maxRadius = 44; // Maximum travel distance in px for the knob

  const updateHeadingFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        setKnobPos({ x: 0, y: 0 });
        onRelease();
        return;
      }

      const clampedDist = Math.min(dist, maxRadius);
      const nx = dx / dist;
      const ny = dy / dist;

      setKnobPos({
        x: nx * clampedDist,
        y: ny * clampedDist,
      });

      const intensity = Math.min(1.0, clampedDist / maxRadius);
      onMove({ x: nx, y: ny }, intensity);
    },
    [maxRadius, onMove, onRelease]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHeadingFromCoords(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    updateHeadingFromCoords(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onRelease();
  };

  // Fallback cleanup if pointer is canceled or window loses focus
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onRelease();
      }
    };
    window.addEventListener('pointercancel', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('pointercancel', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
    };
  }, [isDragging, onRelease]);

  return (
    <div
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 select-none touch-none pointer-events-auto flex flex-col items-center gap-1.5"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
      }}
    >
      {/* Outer Circular Base Panel */}
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all cursor-grab active:cursor-grabbing backdrop-blur-md flex items-center justify-center select-none touch-none ${
          isDragging
            ? 'bg-cyan-950/75 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)] ring-4 ring-cyan-500/20'
            : 'bg-black/60 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,0,0,0.7)]'
        }`}
        title="Panel de Control: Arrastra la bola para deslizarte y moverte en el mapa"
      >
        {/* Concentric Guide Rings */}
        <div className="absolute inset-2.5 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute inset-5 rounded-full border border-cyan-400/10 pointer-events-none" />

        {/* Directional compass tick marks */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />

        {/* Center Resting Anchor Target */}
        <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 pointer-events-none flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 pointer-events-none animate-ping opacity-60" />
        </div>

        {/* Inner Movable Floating 3D Ball / Knob */}
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full pointer-events-none transition-transform duration-75 flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.8)]"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            background: isDragging
              ? 'radial-gradient(circle at 35% 30%, #a5f3fc 0%, #22d3ee 35%, #0891b2 75%, #0e7490 100%)'
              : 'radial-gradient(circle at 35% 30%, #f1f5f9 0%, #cbd5e1 35%, #64748b 75%, #334155 100%)',
            boxShadow: isDragging
              ? '0 0 25px rgba(6,182,212,0.9), inset 0 2px 5px rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.7)'
              : '0 4px 16px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7)',
            border: isDragging ? '2.5px solid #cffafe' : '2px solid rgba(255,255,255,0.75)',
          }}
        >
          {/* Specular 3D Reflection Highlight */}
          <div className="w-3.5 h-3.5 rounded-full bg-white/80 absolute top-1.5 left-2 blur-[0.5px]" />
          
          {/* Inner Bioluminescent Core */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-colors flex items-center justify-center ${
              isDragging ? 'bg-cyan-950/80 shadow-[inset_0_0_6px_#06b6d4]' : 'bg-slate-800/70'
            }`}
          >
            <Move className={`w-2.5 h-2.5 ${isDragging ? 'text-cyan-300 animate-pulse' : 'text-slate-300'}`} />
          </div>
        </div>
      </div>

      {/* Mini Panel Footer Label */}
      <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300/90 bg-black/75 px-2.5 py-0.5 rounded-full border border-cyan-500/30 backdrop-blur-sm pointer-events-none shadow-md">
        <Compass className={`w-3 h-3 ${isDragging ? 'text-cyan-400 animate-spin' : 'text-cyan-500'}`} />
        <span>{isDragging ? 'Deslizando' : 'Panel Deslizar'}</span>
      </div>
    </div>
  );
};
