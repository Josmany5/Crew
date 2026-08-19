import { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

export interface CropSelection {
  x: number; // normalized 0..1 from the left of the source image
  y: number; // normalized 0..1 from the top of the source image
  size: number; // normalized side length (relative to image width)
}

const VIEWPORT = 320;

/**
 * Drag-to-position crop screen shown right after picking a photo.
 * Drag pans the image, scroll/slider zooms. Returns a normalized square crop.
 */
function CropModal({ src, onConfirm, onCancel }: { src: string; onConfirm: (crop: CropSelection) => void; onCancel: () => void }) {
  const [img, setImg] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ tx: 0, ty: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseTx: number; baseTy: number } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg({ w: image.naturalWidth, h: image.naturalHeight });
    image.src = src;
  }, [src]);

  const clampPan = useCallback(
    (tx: number, ty: number) => {
      if (!img) return { tx: 0, ty: 0 };
      const scale0 = VIEWPORT / Math.min(img.w, img.h);
      const dw = img.w * scale0 * zoom;
      const dh = img.h * scale0 * zoom;
      return {
        tx: Math.min(0, Math.max(VIEWPORT - dw, tx)),
        ty: Math.min(0, Math.max(VIEWPORT - dh, ty)),
      };
    },
    [img, zoom],
  );

  const setZoomAndClamp = (next: number) => {
    const z = Math.min(4, Math.max(1, next));
    setZoom(z);
    setPos((prev) => clampPan(prev.tx, prev.ty));
    // re-clamp after zoom state lands
    requestAnimationFrame(() => setPos((prev) => clampPan(prev.tx, prev.ty)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!img) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseTx: pos.tx, baseTy: pos.ty };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setPos(clampPan(drag.baseTx + (e.clientX - drag.startX), drag.baseTy + (e.clientY - drag.startY)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomAndClamp(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
  };

  const commit = () => {
    if (!img) return;
    const effective = (VIEWPORT / Math.min(img.w, img.h)) * zoom;
    const left = -pos.tx / effective;
    const top = -pos.ty / effective;
    const side = VIEWPORT / effective;
    onConfirm({ x: left / img.w, y: top / img.h, size: side / img.w });
  };

  const clamped = clampPan(pos.tx, pos.ty);
  const scale0 = img ? VIEWPORT / Math.min(img.w, img.h) : 0;
  const dw = img ? img.w * scale0 * zoom : 0;
  const dh = img ? img.h * scale0 * zoom : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[26px] border border-border bg-card p-6 text-foreground shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Position your photo</h3>
          <button type="button" aria-label="Close" onClick={onCancel} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">✕</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Drag the photo to center your face, scroll to zoom.</p>

        <div
          className="relative mx-auto mt-4 h-[320px] w-[320px] cursor-grab touch-none overflow-hidden rounded-full bg-muted active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          {img && (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute select-none"
              style={{ left: clamped.tx, top: clamped.ty, width: dw, height: dh, maxWidth: 'none' }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-primary/50" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" aria-label="Zoom out" onClick={() => setZoomAndClamp(zoom - 0.25)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><ZoomOut size={16} /></button>
          <input data-testid="crop-zoom" type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoomAndClamp(Number(e.target.value))} className="w-44 accent-[hsl(var(--primary))]" />
          <button type="button" aria-label="Zoom in" onClick={() => setZoomAndClamp(zoom + 0.25)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><ZoomIn size={16} /></button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button>
          <button type="button" data-testid="button-use-photo" disabled={!img} onClick={commit} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground">Use photo</button>
        </div>
      </div>
    </div>
  );
}

export { CropModal };
