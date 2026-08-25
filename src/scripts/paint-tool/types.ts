/** Tipos compartidos de la herramienta "Pinta el teu espai". */

export type ToolName = 'brocha' | 'rodillo' | 'rellenar' | 'borrar';

/** Rectángulo en fracciones del encuadre (0–1). */
export type FractionRect = { x: number; y: number; w: number; h: number };

export type Region = {
  id: string;
  label: string;
  /**
   * 'pared'  — la pared del fondo, con máscara real generada en build.
   * 'rect'   — zona rectangular marcada por el usuario.
   */
  kind: 'pared' | 'rect';
  /** Sólo en las de tipo 'rect'. */
  rect?: FractionRect;
  /** Color aplicado, o null si sigue con su color original. */
  color: string | null;
  /** Alfa = dónde está la forma de la zona. Constante durante su vida. */
  shape: HTMLCanvasElement;
  /** Gris = sombreado de la foto normalizado. Constante. */
  shade: HTMLCanvasElement;
  /** Alfa = dónde ha pintado el usuario dentro de la forma. Mutable. */
  paint: HTMLCanvasElement;
};

/**
 * Una entrada del historial. Guarda los lienzos de pintura POR REFERENCIA:
 * antes de modificar uno se clona (copy-on-write), así que las entradas
 * antiguas siguen apuntando al contenido que tenían.
 */
export type Snapshot = {
  regions: Array<{
    id: string;
    label: string;
    kind: Region['kind'];
    rect?: FractionRect;
    color: string | null;
    shape: HTMLCanvasElement;
    shade: HTMLCanvasElement;
    paint: HTMLCanvasElement;
  }>;
  selectedId: string | null;
};
