/**
 * Historial de deshacer / rehacer.
 *
 * Cada entrada guarda los lienzos de pintura POR REFERENCIA. Quien vaya a
 * modificar un lienzo debe llamar antes a `cloneForWrite`, que lo sustituye
 * por una copia; así las entradas anteriores conservan intacto lo que tenían y
 * no hay que duplicar megas de píxeles en cada trazo.
 */
import type { Region, Snapshot } from './types';
import { cloneCanvas } from './canvas-utils';

/** Tope de entradas. Cada una sólo pesa si su lienzo cambió. */
const MAX_ENTRIES = 30;

export class History {
  private entries: Snapshot[] = [];
  private index = -1;

  constructor(private onChange: () => void) {}

  private snapshot(regions: Region[], selectedId: string | null): Snapshot {
    return {
      selectedId,
      regions: regions.map((r) => ({
        id: r.id, label: r.label, kind: r.kind, rect: r.rect,
        color: r.color, shape: r.shape, shade: r.shade, paint: r.paint,
      })),
    };
  }

  /** Guarda el estado actual como nuevo punto del historial. */
  push(regions: Region[], selectedId: string | null): void {
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push(this.snapshot(regions, selectedId));
    if (this.entries.length > MAX_ENTRIES) this.entries.shift();
    this.index = this.entries.length - 1;
    this.onChange();
  }

  /** Primer punto del historial; descarta cualquier cosa anterior. */
  reset(regions: Region[], selectedId: string | null): void {
    this.entries = [this.snapshot(regions, selectedId)];
    this.index = 0;
    this.onChange();
  }

  get canUndo(): boolean { return this.index > 0; }
  get canRedo(): boolean { return this.index < this.entries.length - 1; }

  undo(): Snapshot | null {
    if (!this.canUndo) return null;
    this.index--;
    this.onChange();
    return this.entries[this.index]!;
  }

  redo(): Snapshot | null {
    if (!this.canRedo) return null;
    this.index++;
    this.onChange();
    return this.entries[this.index]!;
  }
}

/**
 * Prepara una zona para ser modificada: sustituye su lienzo de pintura por una
 * copia, de modo que las entradas del historial que apuntaban al anterior se
 * queden con el contenido antiguo.
 */
export function cloneForWrite(region: Region): void {
  region.paint = cloneCanvas(region.paint);
}
