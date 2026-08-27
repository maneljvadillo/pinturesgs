/**
 * "PINTA EL TEU ESPAI" — motor de la herramienta.
 *
 * CÓMO SE COMPONE LA IMAGEN
 * Por cada zona con color se pinta, en un lienzo auxiliar:
 *     color plano  ×(multiply)  mapa de sombreado  ∩  forma  ∩  zona pintada
 * y el resultado se vuelca sobre la foto. Todo son operaciones de lienzo
 * aceleradas por GPU: no se recorren píxeles en cada fotograma, así que el
 * pincel va fluido. El sombreado es lo que conserva las sombras y el grano del
 * ladrillo en lugar de dejar una mancha plana (ver regions.ts).
 *
 * MODELO
 * Cada zona tiene UN color. La máscara de pintura decide DÓNDE se ve dentro de
 * la zona: rellenar la cubre entera, la brocha y el rodillo la van descubriendo
 * y borrar la retira. Para dos colores distintos hacen falta dos zonas.
 */
import { showToast } from '~/scripts/toast';
import { colorName, DEFAULT_COLOR } from '~/data/palette';
import type { FractionRect, Region, ToolName } from './types';
import { History, cloneForWrite } from './history';
import {
  buildLumaMap, makeRegion, maskToAlpha, rectToAlpha, type LumaMap,
} from './regions';
import { ctx2d, loadImage, makeCanvas } from './canvas-utils';

/** Las máscaras de pintura van a media resolución: el trazo es suave y así el
 *  historial no se come la memoria. La forma y el sombreado sí van completos. */
const PAINT_SCALE = 0.5;

/** Radio del trazo, en píxeles de la foto. */
const TOOL_RADIUS: Record<Exclude<ToolName, 'rellenar'>, number> = {
  brocha: 22,
  rodillo: 60,
  borrar: 42,
};

/**
 * Radio mínimo del trazo EN PÍXELES DE PANTALLA.
 *
 * Los de arriba están en píxeles de la foto, que mide 1200 de ancho: la brocha
 * es el 1,8% del ancho de la imagen, salga en la pantalla que salga. En un
 * ordenador el marco mide unos 560 px y eso son 10 px de trazo, que con el
 * ratón se controlan bien. En un móvil el marco mide 330 y el mismo trazo se
 * queda en 6 px: más fino que la yema del dedo con el que se está pintando.
 *
 * Así que el radio real es el mayor de los dos: el de la foto, o el que hace
 * falta para que en ESA pantalla el trazo tenga un grosor manejable. En
 * escritorio no cambia nada; en el móvil el trazo engorda hasta poder pintarse
 * con el dedo.
 */
const TOOL_MIN_SCREEN_RADIUS: Record<Exclude<ToolName, 'rellenar'>, number> = {
  brocha: 10,
  rodillo: 24,
  borrar: 17,
};

/** Tope de zonas que puede añadir el usuario, para no disparar la memoria. */
const MAX_USER_REGIONS = 4;

/**
 * Las cuatro zonas pintables de la sala (ver scripts/build-wall-masks.mjs).
 * El orden manda en el selector de zonas.
 *
 * Las tres paredes viajan en un PNG en color, una por canal. El techo va en un
 * archivo aparte: no cabe en un cuarto canal porque el alfa se lleva por
 * delante el RGB de los otros tres al dibujar el PNG en un lienzo.
 *
 * `combo` dice qué color de una combinación le toca a cada zona. El tercero es
 * siempre el tono claro, y lo comparten tabique y techo: son los dos planos de
 * cierre, y en obra se pintan juntos precisamente por eso.
 */
const ZONES = [
  { id: 'z-izq', label: 'Pared izquierda', mask: 'walls', channel: 0 as const, combo: 0 },
  { id: 'z-fondo', label: 'Pared del fondo', mask: 'walls', channel: 1 as const, combo: 1 },
  { id: 'z-tabique', label: 'Tabique derecho', mask: 'walls', channel: 2 as const, combo: 2 },
  { id: 'z-techo', label: 'Techo', mask: 'ceiling', channel: 0 as const, combo: 2 },
] as const;

export async function initPaintTool(): Promise<void> {
  const section = document.getElementById('pinta');
  if (!section) return;

  const photoUrl = section.dataset.photo!;
  const maskUrl = section.dataset.mask!;
  const ceilingUrl = section.dataset.maskCeiling!;
  const W = Number(section.dataset.w);
  const H = Number(section.dataset.h);

  const canvas = document.getElementById('paintCanvas') as HTMLCanvasElement;
  const regionLayer = document.getElementById('regionLayer') as HTMLElement;
  const wallPicker = document.getElementById('wallPicker') as HTMLElement;
  const compareRange = document.getElementById('compareRange') as HTMLInputElement;
  const compareHandle = document.getElementById('compareHandle') as HTMLElement;
  const roomAfter = document.getElementById('roomAfter') as HTMLElement;
  const markBtn = document.getElementById('markBtn') as HTMLButtonElement;
  const photoHint = document.getElementById('photoHint') as HTMLElement;
  const loading = document.getElementById('stageLoading') as HTMLElement;
  const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;
  const redoBtn = document.getElementById('redoBtn') as HTMLButtonElement;
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
  const brushDot = document.getElementById('brushDot') as HTMLElement;
  const paletteScroll = document.getElementById('paletteScroll') as HTMLElement;
  const readout = document.getElementById('swatchReadout') as HTMLElement;

  const outCtx = ctx2d(canvas);
  const scratch = makeCanvas(W, H);
  const sCtx = ctx2d(scratch);

  // ── Carga ───────────────────────────────────────────────────────────────
  let photo: HTMLImageElement;
  let zoneShapes: HTMLCanvasElement[];
  let luma: LumaMap;
  try {
    const [p, m, c] = await Promise.all([
      loadImage(photoUrl), loadImage(maskUrl), loadImage(ceilingUrl),
    ]);
    photo = p;
    luma = buildLumaMap(p, W, H);
    zoneShapes = ZONES.map((z) => maskToAlpha(z.mask === 'walls' ? m : c, W, H, z.channel));
  } catch {
    loading.textContent = 'No se ha podido cargar la herramienta.';
    return;
  }
  loading.remove();

  // ── Estado ──────────────────────────────────────────────────────────────
  let regions: Region[] = [];
  let selectedId: string | null = null;
  let currentTool: ToolName = 'rellenar';
  let currentColor = DEFAULT_COLOR;
  let nextId = 1;
  let marking = false;
  /** Último color aplicado, que es el que enseña la línea de la paleta cuando
   *  no se está señalando ninguna muestra. Declarado aquí arriba con el resto
   *  del estado: `applyColor` lo escribe y vive mucho antes en el archivo. */
  let lastApplied: { hex: string; name: string } | null = null;
  /** Índice de zona por píxel (0 = ninguna), para saber qué hay bajo el cursor. */
  let idMap = new Uint8Array(W * H);

  const paintW = Math.round(W * PAINT_SCALE);
  const paintH = Math.round(H * PAINT_SCALE);

  function makePaintCanvas(): HTMLCanvasElement { return makeCanvas(paintW, paintH); }

  function seed(): void {
    regions = ZONES.map((z, i) => {
      const r = makeRegion(z.id, z.label, 'pared', zoneShapes[i]!, luma);
      r.paint = makePaintCanvas();
      return r;
    });
    // Arranca seleccionada la del fondo: es la más grande y la que primero
    // mira todo el mundo.
    selectedId = 'z-fondo';
    nextId = 1;
    rebuildIdMap();
  }

  /** Recalcula qué zona ocupa cada píxel. Las últimas tapan a las anteriores. */
  function rebuildIdMap(): void {
    idMap = new Uint8Array(W * H);
    regions.forEach((r, i) => {
      const g = r.shape.getContext('2d', { willReadFrequently: true })!;
      const a = g.getImageData(0, 0, W, H).data;
      for (let px = 0, j = 3; px < W * H; px++, j += 4) {
        if (a[j]! > 120) idMap[px] = i + 1;
      }
    });
  }

  const regionAt = (x: number, y: number): Region | null => {
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    const i = idMap[Math.floor(y) * W + Math.floor(x)]!;
    return i === 0 ? null : regions[i - 1]!;
  };

  const selected = (): Region | undefined => regions.find((r) => r.id === selectedId);

  // ── Composición ─────────────────────────────────────────────────────────
  function render(): void {
    outCtx.globalCompositeOperation = 'source-over';
    outCtx.clearRect(0, 0, W, H);
    outCtx.drawImage(photo, 0, 0, W, H);

    for (const r of regions) {
      if (!r.color) continue;
      sCtx.globalCompositeOperation = 'source-over';
      sCtx.clearRect(0, 0, W, H);
      sCtx.fillStyle = r.color;
      sCtx.fillRect(0, 0, W, H);
      // El sombreado real de la foto, normalizado: aquí es donde el color deja
      // de ser una mancha plana y pasa a respetar luces y sombras.
      sCtx.globalCompositeOperation = 'multiply';
      sCtx.drawImage(r.shade, 0, 0);
      // Recorte: forma de la zona ∩ lo que el usuario ha pintado.
      sCtx.globalCompositeOperation = 'destination-in';
      sCtx.drawImage(r.shape, 0, 0);
      sCtx.drawImage(r.paint, 0, 0, W, H);
      outCtx.drawImage(scratch, 0, 0);
    }

    // La zona activa sin pintar se resalta: es la señal de "puedes hacer clic".
    const sel = selected();
    if (sel && !sel.color) {
      sCtx.globalCompositeOperation = 'source-over';
      sCtx.clearRect(0, 0, W, H);
      sCtx.fillStyle = 'rgba(193, 80, 46, 0.20)';
      sCtx.fillRect(0, 0, W, H);
      sCtx.globalCompositeOperation = 'destination-in';
      sCtx.drawImage(sel.shape, 0, 0);
      outCtx.drawImage(scratch, 0, 0);
    }

    renderTags();
  }

  /** Etiquetas flotantes con el nombre de cada zona. */
  function renderTags(): void {
    regionLayer.querySelectorAll('.region-tag').forEach((n) => n.remove());
    for (const r of regions) {
      const c = centroid(r);
      const tag = document.createElement('span');
      tag.className = 'region-tag' + (r.id === selectedId ? ' selected' : '');
      tag.textContent = r.label;
      // Se mantiene dentro del marco: el tabique llega hasta el borde y su
      // centro de masas queda tan a la derecha que la etiqueta se salía.
      const x = Math.min(Math.max(c.x, 0.14), 0.86);
      tag.style.left = `${x * 100}%`;
      tag.style.top = `${c.y * 100}%`;
      regionLayer.appendChild(tag);
    }
  }

  /** Centro aproximado de una zona, en fracciones del encuadre. */
  function centroid(r: Region): { x: number; y: number } {
    if (r.rect) return { x: r.rect.x + r.rect.w / 2, y: r.rect.y + r.rect.h / 2 };
    // Para la pared se usa el centro de masas del mapa de zonas.
    const idx = regions.indexOf(r) + 1;
    let sx = 0, sy = 0, n = 0;
    for (let y = 0; y < H; y += 4) {
      for (let x = 0; x < W; x += 4) {
        if (idMap[y * W + x] === idx) { sx += x; sy += y; n++; }
      }
    }
    return n ? { x: sx / n / W, y: sy / n / H } : { x: 0.5, y: 0.5 };
  }

  // ── Historial ───────────────────────────────────────────────────────────
  const history = new History(() => {
    undoBtn.disabled = !history.canUndo;
    redoBtn.disabled = !history.canRedo;
  });

  function restore(snap: ReturnType<History['undo']>): void {
    if (!snap) return;
    regions = snap.regions.map((s) => ({ ...s }));
    selectedId = snap.selectedId;
    rebuildIdMap();
    renderWallPicker();
    render();
  }

  // ── Pintar ──────────────────────────────────────────────────────────────
  /** Rellena por completo la máscara de pintura de una zona. */
  function fillRegion(r: Region): void {
    const g = ctx2d(r.paint);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#fff';
    g.fillRect(0, 0, paintW, paintH);
  }

  function strokeAt(r: Region, x: number, y: number, prev: { x: number; y: number } | null, tool: ToolName): void {
    if (tool === 'rellenar') return;
    const g = ctx2d(r.paint);
    const radius = strokeRadius(tool as Exclude<ToolName, 'rellenar'>) * PAINT_SCALE;
    g.globalCompositeOperation = tool === 'borrar' ? 'destination-out' : 'source-over';
    g.strokeStyle = '#fff';
    g.fillStyle = '#fff';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = radius * 2;
    const px = x * PAINT_SCALE, py = y * PAINT_SCALE;
    if (prev) {
      g.beginPath();
      g.moveTo(prev.x * PAINT_SCALE, prev.y * PAINT_SCALE);
      g.lineTo(px, py);
      g.stroke();
    } else {
      g.beginPath();
      g.arc(px, py, radius, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  /** Aplica un color a la zona activa y la deja cubierta. */
  function applyColor(hex: string, cell?: HTMLElement): void {
    const r = selected();
    if (!r) { showToast('Primero selecciona una zona.'); return; }
    currentColor = hex;
    syncBrush();
    lastApplied = { hex, name: colorName(hex) };
    showInReadout(hex, lastApplied.name, true);
    document.querySelectorAll('.swatch-cell.active').forEach((c) => c.classList.remove('active'));
    cell?.classList.add('active');

    cloneForWrite(r);
    r.color = hex;
    fillRegion(r);
    history.push(regions, selectedId);
    renderWallPicker();
    render();
  }

  // ── Selector de zonas ───────────────────────────────────────────────────
  function renderWallPicker(): void {
    wallPicker.innerHTML = '';
    for (const r of regions) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'wall-chip' + (r.id === selectedId ? ' active' : '');
      chip.setAttribute('aria-pressed', String(r.id === selectedId));

      const dot = document.createElement('span');
      dot.className = 'chip-dot' + (r.color ? '' : ' empty');
      if (r.color) dot.style.background = r.color;
      chip.append(dot, document.createTextNode(r.label));

      // Con el color puesto, la pastilla dice CUÁL es. Quien está eligiendo
      // color necesita el nombre a la vista para poder pedirlo luego.
      if (r.color) {
        const name = document.createElement('span');
        name.className = 'chip-color';
        name.textContent = `· ${colorName(r.color)}`;
        chip.appendChild(name);
      }

      chip.addEventListener('click', () => {
        selectedId = r.id;
        renderWallPicker();
        render();
      });
      wallPicker.appendChild(chip);
    }
  }

  // ── Marcar una zona nueva ───────────────────────────────────────────────
  const userRegionCount = (): number => regions.filter((r) => r.kind === 'rect').length;

  function setMarking(on: boolean): void {
    if (on && userRegionCount() >= MAX_USER_REGIONS) {
      showToast(`Puedes marcar hasta ${MAX_USER_REGIONS} zonas.`);
      return;
    }
    marking = on;
    markBtn.setAttribute('aria-pressed', String(on));
    markBtn.textContent = on ? '✕ Cancelar' : '➕ Marcar otra pared';
    photoHint.hidden = !on;
    regionLayer.classList.toggle('marking', on);
    // Marcando manda la cruz del sistema: el aro de la brocha sólo despista.
    if (on) hideBrush();
  }
  markBtn.addEventListener('click', () => setMarking(!marking));

  function addRegion(rect: FractionRect): void {
    const id = `r${nextId++}`;
    const shape = rectToAlpha(rect, W, H);
    const r = makeRegion(id, `Zona ${userRegionCount() + 1}`, 'rect', shape, luma, rect);
    r.paint = makePaintCanvas();
    regions.push(r);
    selectedId = id;
    rebuildIdMap();
    // Si ya había un color elegido, la zona nueva nace pintada con él.
    if (currentColor) { r.color = currentColor; fillRegion(r); }
    history.push(regions, selectedId);
    renderWallPicker();
    render();
    showToast('Zona marcada — elige un color en la paleta.');
  }

  // ── Puntero sobre la foto ───────────────────────────────────────────────
  /*
    La posición y el tamaño del marco se cachean. `getBoundingClientRect()`
    obliga al navegador a recalcular el layout, y llamarlo en cada
    `pointermove` —hasta 120 veces por segundo mientras se pinta— es justo lo
    que hace que el trazo salga a tirones. Se invalida al desplazar la página o
    al cambiar de tamaño, que es cuando el marco se mueve de verdad.
  */
  let stage = { left: 0, top: 0, width: 0, height: 0 };
  let stageDirty = true;

  function measureStage(): void {
    const b = regionLayer.getBoundingClientRect();
    stage = { left: b.left, top: b.top, width: b.width, height: b.height };
    stageDirty = false;
  }
  window.addEventListener('scroll', () => { stageDirty = true; }, { passive: true });
  window.addEventListener('resize', () => { stageDirty = true; syncBrush(); });

  const toPhoto = (e: PointerEvent) => {
    if (stageDirty) measureStage();
    return {
      x: ((e.clientX - stage.left) / stage.width) * W,
      y: ((e.clientY - stage.top) / stage.height) * H,
    };
  };

  /** Píxeles de la foto que caben en un píxel de pantalla. */
  function photoPerPx(): number {
    if (stageDirty) measureStage();
    return stage.width > 0 ? W / stage.width : 1;
  }

  /** El radio con el que se pinta de verdad. Ver TOOL_MIN_SCREEN_RADIUS. */
  function strokeRadius(tool: Exclude<ToolName, 'rellenar'>): number {
    return Math.max(TOOL_RADIUS[tool], TOOL_MIN_SCREEN_RADIUS[tool] * photoPerPx());
  }

  // ── La brocha que se ve ─────────────────────────────────────────────────
  /**
   * Pone el aro del color y del tamaño de la herramienta activa. Se llama al
   * cambiar de herramienta, de color o de tamaño de ventana: nunca por
   * fotograma. Moverlo (`moveBrush`) sí es por fotograma, y sólo toca
   * `transform`.
   */
  function syncBrush(): void {
    if (currentTool === 'rellenar') { hideBrush(); return; }
    const tool = currentTool as Exclude<ToolName, 'rellenar'>;
    const sizePx = (strokeRadius(tool) * 2) / photoPerPx();
    brushDot.style.setProperty('--bd-size', `${sizePx.toFixed(1)}px`);
    brushDot.style.setProperty('--bd-color', currentColor || '#FFFFFF');
    brushDot.classList.toggle('erase', tool === 'borrar');
  }

  function moveBrush(e: PointerEvent): void {
    if (stageDirty) measureStage();
    const x = e.clientX - stage.left;
    const y = e.clientY - stage.top;
    brushDot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function showBrush(e: PointerEvent): void {
    if (currentTool === 'rellenar' || marking) return;
    moveBrush(e);
    brushDot.classList.add('show');
  }

  function hideBrush(): void { brushDot.classList.remove('show'); }

  let drawStart: { x: number; y: number } | null = null;
  let preview: HTMLElement | null = null;
  let painting = false;
  let lastPoint: { x: number; y: number } | null = null;
  let strokeRegion: Region | null = null;

  regionLayer.addEventListener('pointerdown', (e) => {
    // Al empezar un gesto la medida tiene que estar fresca sí o sí: es la que
    // se usará durante todo el trazo.
    measureStage();
    showBrush(e);
    const p = toPhoto(e);
    // Capturar el puntero mantiene el trazo vivo aunque el cursor se salga del
    // marco. Algunos navegadores lanzan si el pointerId ya no está activo, y
    // eso no debe tumbar el resto del gesto.
    try { regionLayer.setPointerCapture(e.pointerId); } catch { /* sin captura */ }

    if (marking) {
      drawStart = p;
      preview = document.createElement('div');
      preview.className = 'draw-preview';
      regionLayer.appendChild(preview);
      return;
    }

    const hit = regionAt(p.x, p.y);
    if (!hit) return;

    // Un clic siempre selecciona la zona tocada.
    if (hit.id !== selectedId) {
      selectedId = hit.id;
      renderWallPicker();
    }

    if (currentTool === 'rellenar') {
      cloneForWrite(hit);
      hit.color = currentColor;
      fillRegion(hit);
      history.push(regions, selectedId);
      renderWallPicker();
      render();
      return;
    }

    // Brocha, rodillo y borrar: empieza un trazo.
    painting = true;
    strokeRegion = hit;
    cloneForWrite(hit);
    if (!hit.color && currentTool !== 'borrar') hit.color = currentColor;
    strokeAt(hit, p.x, p.y, null, currentTool);
    lastPoint = p;
    render();
  });

  regionLayer.addEventListener('pointermove', (e) => {
    showBrush(e);
    const p = toPhoto(e);

    if (marking && drawStart && preview) {
      const x0 = Math.min(drawStart.x, p.x) / W, y0 = Math.min(drawStart.y, p.y) / H;
      const w = Math.abs(p.x - drawStart.x) / W, h = Math.abs(p.y - drawStart.y) / H;
      preview.style.left = `${x0 * 100}%`;
      preview.style.top = `${y0 * 100}%`;
      preview.style.width = `${w * 100}%`;
      preview.style.height = `${h * 100}%`;
      return;
    }

    if (painting && strokeRegion) {
      strokeAt(strokeRegion, p.x, p.y, lastPoint, currentTool);
      lastPoint = p;
      render();
    }
  });

  function endPointer(e: PointerEvent): void {
    try {
      if (regionLayer.hasPointerCapture(e.pointerId)) regionLayer.releasePointerCapture(e.pointerId);
    } catch { /* ya liberado */ }

    if (marking && drawStart) {
      const p = toPhoto(e);
      const x = Math.min(drawStart.x, p.x) / W, y = Math.min(drawStart.y, p.y) / H;
      const w = Math.abs(p.x - drawStart.x) / W, h = Math.abs(p.y - drawStart.y) / H;
      preview?.remove();
      preview = null;
      drawStart = null;
      // Un rectángulo diminuto suele ser un clic sin querer.
      if (w * W < 24 || h * H < 24) { setMarking(false); return; }
      setMarking(false);
      addRegion({ x, y, w, h });
      return;
    }

    if (painting) {
      painting = false;
      strokeRegion = null;
      lastPoint = null;
      history.push(regions, selectedId);
      renderWallPicker();
    }
  }
  regionLayer.addEventListener('pointerup', endPointer);
  regionLayer.addEventListener('pointercancel', endPointer);

  /*
    El ratón se lleva la brocha al salir del marco. El dedo se la lleva al
    levantarse: mientras se pinta la mano tapa el aro, pero al soltar no puede
    quedarse ahí clavado un aro que ya no sigue a nadie.
  */
  regionLayer.addEventListener('pointerleave', hideBrush);
  regionLayer.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') hideBrush(); });
  regionLayer.addEventListener('pointercancel', hideBrush);

  // ── Herramientas ────────────────────────────────────────────────────────
  document.querySelectorAll<HTMLButtonElement>('.tool-btn[data-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTool = btn.dataset.tool as ToolName;
      document.querySelectorAll('.tool-btn[data-tool]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-checked', String(b === btn));
      });
      regionLayer.classList.toggle('painting', currentTool !== 'rellenar');
      syncBrush();
    });
  });

  undoBtn.addEventListener('click', () => {
    const s = history.undo();
    if (s) { restore(s); showToast('Acción deshecha'); }
  });
  redoBtn.addEventListener('click', () => {
    const s = history.redo();
    if (s) { restore(s); showToast('Acción rehecha'); }
  });
  resetBtn.addEventListener('click', () => {
    seed();
    history.reset(regions, selectedId);
    renderWallPicker();
    render();
    showToast('Todo vuelve a su color original');
  });

  // ── Paleta ──────────────────────────────────────────────────────────────
  document.querySelectorAll<HTMLElement>('.swatch-cell').forEach((cell) => {
    cell.addEventListener('click', () => applyColor(cell.dataset.hex!, cell));
  });

  /*
    ── EL NOMBRE DEL COLOR SEÑALADO ──────────────────────────────────────
    Las muestras ya no llevan rótulo debajo (son 272 y no cabrían), así que el
    nombre y el código se leen aquí arriba, del que se está señalando.

    Los oyentes van en el CONTENEDOR, no en cada muestra: 272 pares de oyentes
    para algo que sólo cambia un texto no tienen ninguna justificación, y con
    delegación funciona igual.

    Al soltar el ratón vuelve a mostrarse el último color APLICADO, que es la
    información que de verdad hay que poder copiar. En el móvil no hay puntero
    que señale, así que allí esta línea dice directamente lo que se ha aplicado.
  */
  function showInReadout(hex: string, name: string, applied: boolean): void {
    readout.classList.add('on');
    (readout.querySelector('.ro-sq') as HTMLElement).style.background = hex;
    const txt = readout.querySelector('.ro-text')!;
    txt.textContent = `${applied ? 'Aplicado: ' : ''}${name} `;
    const code = document.createElement('span');
    code.className = 'ro-hex';
    code.textContent = hex.toUpperCase();
    txt.appendChild(code);
  }

  function restoreReadout(): void {
    if (lastApplied) showInReadout(lastApplied.hex, lastApplied.name, true);
    else {
      readout.classList.remove('on');
      readout.querySelector('.ro-text')!.textContent = 'Señala un color para ver su nombre';
    }
  }

  paletteScroll.addEventListener('pointerover', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.swatch-cell');
    if (cell) showInReadout(cell.dataset.hex!, cell.dataset.name!, false);
  });
  paletteScroll.addEventListener('pointerleave', restoreReadout);
  // Con teclado el foco hace el papel del puntero.
  paletteScroll.addEventListener('focusin', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.swatch-cell');
    if (cell) showInReadout(cell.dataset.hex!, cell.dataset.name!, false);
  });

  /*
    Combinaciones: pintan las tres paredes de una vez. Van en UN solo punto del
    historial, no tres, porque para quien lo usa es una sola decisión: deshacer
    debe devolverle la sala anterior entera, no dejarle dos paredes a medias.
  */
  function applyCombo(colors: string[], btn: HTMLElement): void {
    const zonas = regions.filter((r) => r.kind === 'pared');
    zonas.forEach((r, i) => {
      // Cada zona toma el color que le asigna ZONES: tabique y techo comparten
      // el tercero, el claro.
      const hex = colors[ZONES[i]?.combo ?? i];
      if (!hex) return;
      cloneForWrite(r);
      r.color = hex;
      fillRegion(r);
    });
    const iSel = zonas.findIndex((r) => r.id === selectedId);
    currentColor = colors[ZONES[iSel]?.combo ?? 0] ?? currentColor;
    syncBrush();
    document.querySelectorAll('.combo-btn.active').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.swatch-cell.active').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    history.push(regions, selectedId);
    renderWallPicker();
    render();
    showToast(`Combinación ${btn.dataset.name} aplicada — puedes retocar cada pared.`);
  }

  document.querySelectorAll<HTMLElement>('.combo-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyCombo(btn.dataset.combo!.split(','), btn));
  });

  /*
    Desplegar el resto de familias de color.

    Se ocultan con una clase y no quitándolas del HTML: las muestras ya están
    puestas y enganchadas al mismo manejador que las visibles, así que al
    desplegarlas funcionan sin volver a montar nada.
  */
  const paletteMore = document.getElementById('paletteMore');
  if (paletteMore) {
    const ocultas = paletteScroll.querySelectorAll('.palette-group.extra').length;
    paletteMore.addEventListener('click', () => {
      const abierto = paletteScroll.classList.toggle('expanded');
      paletteMore.setAttribute('aria-expanded', String(abierto));
      paletteMore.innerHTML = abierto
        ? 'Ver menos colores'
        : `Ver más colores <span class="pm-n">(${ocultas} familias más)</span>`;
    });
  }


  // ── Comparador ──────────────────────────────────────────────────────────
  function setCompare(v: number): void {
    roomAfter.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    compareHandle.style.left = `${v}%`;
  }
  compareRange.addEventListener('input', () => setCompare(Number(compareRange.value)));
  setCompare(50);

  // ── Arranque ────────────────────────────────────────────────────────────
  seed();
  history.reset(regions, selectedId);
  renderWallPicker();
  render();
  regionLayer.classList.toggle('painting', currentTool !== 'rellenar');
}
