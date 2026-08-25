/**
 * Paleta de la herramienta "Pinta el teu espai".
 * Organizada por familias; cada color tiene nombre comercial y hex.
 * Añadir un color = añadir una entrada. No hay nada más que tocar.
 */

export type Swatch = { name: string; hex: string };
export type PaletteGroup = { group: string; colors: Swatch[] };

const g = (group: string, colors: [string, string][]): PaletteGroup => ({
  group,
  colors: colors.map(([name, hex]) => ({ name, hex })),
});

export const PALETTE: PaletteGroup[] = [
  g('Blancos', [
    ['Blanco Roto', '#FAFAF8'], ['Crema', '#F2EFE8'], ['Hueso', '#EDEAE0'],
    ['Arena Claro', '#E6E1D4'], ['Lino', '#DDD6C6'], ['Blanco Cal', '#F7F5F0'],
  ]),
  g('Negros', [
    ['Negro Tinta', '#161513'], ['Carbón', '#2B2A27'], ['Grafito', '#3D3B36'],
    ['Negro Mate', '#1A1A1A'], ['Negro Profundo', '#0D0D0D'], ['Pizarra', '#26262B'],
  ]),
  g('Grises', [
    ['Gris Perla', '#C9C7C1'], ['Gris Piedra', '#A9A7A0'], ['Gris Topo', '#8A8680'],
    ['Gris Plomo', '#6B6862'], ['Antracita', '#5F5D58'], ['Gris Niebla', '#DCDAD5'],
  ]),
  g('Beiges', [
    ['Beige Arena', '#E8DCC8'], ['Beige Cálido', '#DCCBAE'], ['Beige Camel', '#D1BFA0'],
    ['Beige Tostado', '#C7B091'], ['Beige Oscuro', '#BBA07E'], ['Marfil', '#F0E6D2'],
  ]),
  g('Marrones', [
    ['Marrón Cuero', '#8B5E34'], ['Marrón Café', '#6F4518'], ['Chocolate', '#5C3A21'],
    ['Marrón Tierra', '#4A2E1B'], ['Ébano', '#3B2417'], ['Caoba', '#7B4B2A'],
  ]),
  g('Rojos', [
    ['Rojo Coral', '#E63946'], ['Rojo Teja', '#C1272D'], ['Rojo Vino', '#9E1B32'],
    ['Rojo Fuego', '#F4442E'], ['Rojo Carmín', '#D7263D'], ['Rojo Burdeos', '#7B1E28'],
  ]),
  g('Naranjas', [
    ['Naranja Atardecer', '#F77F00'], ['Naranja Miel', '#FB8B24'], ['Terracota', '#E85D04'],
    ['Naranja Óxido', '#D9480F'], ['Naranja Tostado', '#C2540A'], ['Albaricoque', '#F8A66C'],
  ]),
  g('Amarillos', [
    ['Amarillo Azafrán', '#FCBF49'], ['Amarillo Mostaza', '#F4D35E'], ['Amarillo Arena', '#E9C46A'],
    ['Amarillo Dorado', '#D4A017'], ['Amarillo Trigo', '#C89B3C'], ['Amarillo Pálido', '#F7E7A8'],
  ]),
  g('Verdes', [
    ['Verde Bosque', '#52B788'], ['Verde Musgo', '#40916C'], ['Verde Pino', '#2D6A4F'],
    ['Verde Menta', '#74C69D'], ['Verde Salvia', '#95D5B2'], ['Verde Oliva', '#5C6B47'],
  ]),
  g('Turquesas', [
    ['Turquesa Mar', '#2A9D8F'], ['Turquesa Claro', '#40B5AD'], ['Turquesa Petróleo', '#0C8599'],
    ['Turquesa Esmeralda', '#0D9488'], ['Turquesa Tropical', '#14B8A6'], ['Agua', '#A8DADC'],
  ]),
  g('Azules', [
    ['Azul Cielo', '#277DA1'], ['Azul Marino', '#1B3A5C'], ['Azul Grisáceo', '#3D5A80'],
    ['Azul Noche', '#264653'], ['Azul Índigo', '#1D3557'], ['Azul Hielo', '#BFD7EA'],
  ]),
  g('Morados', [
    ['Lavanda', '#6A4C93'], ['Morado Uva', '#7B2CBF'], ['Berenjena', '#5A189A'],
    ['Orquídea', '#9D4EDD'], ['Ciruela', '#4C3575'], ['Glicina', '#C8B6E2'],
  ]),
  g('Rosas', [
    ['Rosa Fucsia', '#B5179E'], ['Rosa Frambuesa', '#D62598'], ['Rosa Coral', '#E85D75'],
    ['Rosa Carmín', '#C9184A'], ['Rosa Pastel', '#FF758F'], ['Rosa Nude', '#EFC3CA'],
  ]),
];

/** Búsqueda inversa hex -> nombre, para el resumen que viaja al formulario. */
export const COLOR_NAMES: Record<string, string> = Object.fromEntries(
  PALETTE.flatMap((grp) => grp.colors.map((c) => [c.hex.toUpperCase(), c.name])),
);

export function colorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? 'Color personalizado';
}
