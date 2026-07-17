import { useRef } from 'react';

/**
 * A draggable panel divider (1f E4, owner request): drag to reallocate
 * screen space, arrow keys for keyboard users. The parent owns the
 * value and persists it in settings — layout is a device preference,
 * not game state.
 */
const Divider = ({
  orientation,
  value,
  min,
  max,
  onChange,
  label,
  dataCy,
}: {
  /** "vertical" separates side-by-side panels (drag left/right) */
  orientation: 'vertical' | 'horizontal';
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  dataCy: string;
}) => {
  const dragStart = useRef<{ pos: number; value: number } | null>(
    null,
  );
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const isVertical = orientation === 'vertical';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-cy={dataCy}
      onPointerDown={(e) => {
        dragStart.current = {
          pos: isVertical ? e.clientX : e.clientY,
          value,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragStart.current) return;
        const pos = isVertical ? e.clientX : e.clientY;
        onChange(
          clamp(dragStart.current.value + pos - dragStart.current.pos),
        );
      }}
      onPointerUp={() => {
        dragStart.current = null;
      }}
      onKeyDown={(e) => {
        const step =
          e.key === (isVertical ? 'ArrowRight' : 'ArrowDown')
            ? 16
            : e.key === (isVertical ? 'ArrowLeft' : 'ArrowUp')
              ? -16
              : 0;
        if (step !== 0) {
          e.preventDefault();
          onChange(clamp(value + step));
        }
      }}
      className={
        isVertical
          ? 'w-1.5 shrink-0 cursor-col-resize self-stretch bg-white/5 hover:bg-crt-cyan/40 focus-visible:bg-crt-cyan/60 transition-colors touch-none'
          : 'h-1.5 shrink-0 cursor-row-resize w-full bg-white/5 hover:bg-crt-cyan/40 focus-visible:bg-crt-cyan/60 rounded transition-colors touch-none'
      }
    />
  );
};

export default Divider;
