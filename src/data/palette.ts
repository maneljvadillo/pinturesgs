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
      ['Blanco Nieve', '#FFFFFF'], ['Blanco Perla', '#F4F2ED'],
    ['Blanco Yeso', '#F1EFEA'], ['Blanco Algodón', '#FBFAF6'],
]),
  g('Negros', [
    ['Negro Tinta', '#161513'], ['Carbón', '#2B2A27'], ['Grafito', '#3D3B36'],
    ['Negro Mate', '#1A1A1A'], ['Negro Profundo', '#0D0D0D'], ['Pizarra', '#26262B'],
      ['Negro Grafito', '#2F2E2B'], ['Negro Humo', '#33322E'],
    ['Negro Basalto', '#232322'], ['Negro Azabache', '#141414'],
]),
  g('Grises', [
    ['Gris Perla', '#C9C7C1'], ['Gris Piedra', '#A9A7A0'], ['Gris Topo', '#8A8680'],
    ['Gris Plomo', '#6B6862'], ['Antracita', '#5F5D58'], ['Gris Niebla', '#DCDAD5'],
      ['Gris Cemento', '#9B9891'], ['Gris Marengo', '#4A4844'],
    ['Gris Ceniza', '#B4B1AA'], ['Gris Acero', '#77746E'],
]),
  g('Beiges', [
    ['Beige Arena', '#E8DCC8'], ['Beige Cálido', '#DCCBAE'], ['Beige Camel', '#D1BFA0'],
    ['Beige Tostado', '#C7B091'], ['Beige Oscuro', '#BBA07E'], ['Marfil', '#F0E6D2'],
      ['Beige Trigo', '#E0D3B8'], ['Beige Lino', '#CFC2A8'],
    ['Beige Duna', '#DED0B6'], ['Beige Nuez', '#C4AF8D'],
]),
  g('Marrones', [
    ['Marrón Cuero', '#8B5E34'], ['Marrón Café', '#6F4518'], ['Chocolate', '#5C3A21'],
    ['Marrón Tierra', '#4A2E1B'], ['Ébano', '#3B2417'], ['Caoba', '#7B4B2A'],
      ['Marrón Nogal', '#6B4A2F'], ['Marrón Canela', '#9C6B3F'],
    ['Marrón Avellana', '#8A6440'], ['Marrón Castaño', '#5A3E28'],
]),
  g('Rojos', [
    ['Rojo Coral', '#E63946'], ['Rojo Teja', '#C1272D'], ['Rojo Vino', '#9E1B32'],
    ['Rojo Fuego', '#F4442E'], ['Rojo Carmín', '#D7263D'], ['Rojo Burdeos', '#7B1E28'],
      ['Rojo Ladrillo', '#A83A2C'], ['Rojo Granate', '#6E1420'],
    ['Rojo Amapola', '#D62828'], ['Rojo Óxido', '#8E3B2E'],
]),
  g('Naranjas', [
    ['Naranja Atardecer', '#F77F00'], ['Naranja Miel', '#FB8B24'], ['Terracota', '#E85D04'],
    ['Naranja Óxido', '#D9480F'], ['Naranja Tostado', '#C2540A'], ['Albaricoque', '#F8A66C'],
      ['Naranja Calabaza', '#E8701A'], ['Naranja Arcilla', '#B85C38'],
    ['Naranja Mandarina', '#F98E3B'], ['Naranja Cobre', '#B15A28'],
]),
  g('Amarillos', [
    ['Amarillo Azafrán', '#FCBF49'], ['Amarillo Mostaza', '#F4D35E'], ['Amarillo Arena', '#E9C46A'],
    ['Amarillo Dorado', '#D4A017'], ['Amarillo Trigo', '#C89B3C'], ['Amarillo Pálido', '#F7E7A8'],
      ['Amarillo Miel', '#E3B23C'], ['Amarillo Limón', '#EFD34D'],
    ['Amarillo Paja', '#E8D5A0'], ['Amarillo Ámbar', '#C9942B'],
]),
  g('Verdes', [
    ['Verde Bosque', '#52B788'], ['Verde Musgo', '#40916C'], ['Verde Pino', '#2D6A4F'],
    ['Verde Menta', '#74C69D'], ['Verde Salvia', '#95D5B2'], ['Verde Oliva', '#5C6B47'],
      ['Verde Eucalipto', '#8FAF9A'], ['Verde Botella', '#14532D'],
    ['Verde Hoja', '#3E8E5A'], ['Verde Helecho', '#6B8E4E'],
]),
  g('Turquesas', [
    ['Turquesa Mar', '#2A9D8F'], ['Turquesa Claro', '#40B5AD'], ['Turquesa Petróleo', '#0C8599'],
    ['Turquesa Esmeralda', '#0D9488'], ['Turquesa Tropical', '#14B8A6'], ['Agua', '#A8DADC'],
      ['Turquesa Laguna', '#5FBFB3'], ['Turquesa Profundo', '#086A75'],
    ['Turquesa Piscina', '#2FB6C4'], ['Turquesa Hondo', '#075E68'],
]),
  g('Azules', [
    ['Azul Cielo', '#277DA1'], ['Azul Marino', '#1B3A5C'], ['Azul Grisáceo', '#3D5A80'],
    ['Azul Noche', '#264653'], ['Azul Índigo', '#1D3557'], ['Azul Hielo', '#BFD7EA'],
      ['Azul Denim', '#4A6FA5'], ['Azul Petróleo', '#10424F'],
    ['Azul Océano', '#2A6F97'], ['Azul Acero', '#5B7FA6'],
]),
  g('Morados', [
    ['Lavanda', '#6A4C93'], ['Morado Uva', '#7B2CBF'], ['Berenjena', '#5A189A'],
    ['Orquídea', '#9D4EDD'], ['Ciruela', '#4C3575'], ['Glicina', '#C8B6E2'],
      ['Morado Malva', '#A98DBF'], ['Morado Vino', '#3E2A56'],
    ['Morado Lila', '#8E6FB5'], ['Morado Cardenal', '#4A2A6B'],
]),
  g('Tierras', [
    ['Ocre', '#C8963E'], ['Siena Tostada', '#A85C32'], ['Tierra de Sombra', '#6E4B32'],
    ['Arcilla Rosada', '#C08A72'], ['Barro Cocido', '#9C4A2F'], ['Adobe', '#D19A6E'],
    ['Ocre Claro', '#DFB56A'], ['Tierra Verde', '#7C7A50'],
  ]),
  g('Greiges', [
    ['Greige Suave', '#D6CFC4'], ['Greige Medio', '#BDB4A7'], ['Greige Piedra', '#A69C8E'],
    ['Greige Oscuro', '#857B6E'], ['Humo', '#C4BFB8'], ['Cuerda', '#CFC6B6'],
    ['Champiñón', '#B0A69B'], ['Cáñamo', '#DAD2C3'],
  ]),
  g('Pasteles', [
    ['Azul Bebé', '#CFE3F0'], ['Verde Agua', '#D3E9DE'], ['Amarillo Vainilla', '#F6EDC8'],
    ['Rosa Algodón', '#F5DDE0'], ['Lila Suave', '#DED6EC'], ['Melocotón', '#F8DCC8'],
      ['Gris Perla Claro', '#E4E2DD'], ['Salvia Claro', '#D8E2D4'],
]),
  g('Profundos', [
    ['Verde Selva', '#1E3A2F'], ['Azul Prusia', '#14304A'], ['Burdeos Profundo', '#4A1220'],
    ['Berenjena Oscuro', '#3A1F3D'], ['Chocolate Profundo', '#35231A'], ['Antracita Profundo', '#2A2C2E'],
      ['Verde Petróleo', '#14413F'], ['Granate Profundo', '#3D1620'],
]),
  g('Rosas', [
    ['Rosa Fucsia', '#B5179E'], ['Rosa Frambuesa', '#D62598'], ['Rosa Coral', '#E85D75'],
    ['Rosa Carmín', '#C9184A'], ['Rosa Pastel', '#FF758F'], ['Rosa Nude', '#EFC3CA'],
      ['Rosa Empolvado', '#E6B7B7'], ['Rosa Terracota', '#C97B6B'],
    ['Rosa Palo', '#D9A5A5'], ['Rosa Buganvilla', '#A81E68'],
]),
];

/** Búsqueda inversa hex -> nombre, para el resumen que viaja al formulario. */
export const COLOR_NAMES: Record<string, string> = Object.fromEntries(
  PALETTE.flatMap((grp) => grp.colors.map((c) => [c.hex.toUpperCase(), c.name])),
);

export function colorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? 'Color personalizado';
}

/**
 * COMBINACIONES PARA LAS TRES ZONAS
 *
 * La pregunta que trae a la gente a esta herramienta no es "¿qué color me
 * gusta?" sino "¿qué colores pegan entre sí?". Cada combinación viste las tres
 * zonas de una vez, con el criterio de obra: una superficie con carácter y dos
 * que la acompañan, nunca tres protagonistas.
 *
 * ORDEN DE LOS COLORES: [zona 1, zona 2, zona 3]. Las dos primeras son las
 * paredes; la TERCERA es siempre un tono claro, porque es la que corresponde al
 * plano de cierre —techo o tabique— y ahí un color denso encoge la habitación.
 * Es la misma regla que se sigue pintando de verdad.
 *
 * Todos los tonos salen de la paleta de arriba: lo que se ve en pantalla es
 * pintura que la empresa puede servir, no un color inventado.
 */
export type WallCombo = {
  name: string;
  /** Qué transmite. Es lo que se lee bajo el nombre. */
  mood: string;
  /** [zona 1, zona 2, zona 3 — esta última siempre clara] */
  colors: [string, string, string];
};

export const COMBOS: WallCombo[] = [
  { name: 'Nórdico',      mood: 'Luminoso y tranquilo',        colors: ['#EDEAE0', '#95D5B2', '#FAFAF8'] },
  { name: 'Cálido',       mood: 'Acogedor, de casa vivida',    colors: ['#E8DCC8', '#C2540A', '#F0E6D2'] },
  { name: 'Elegante',     mood: 'Sobrio, con una pared que manda', colors: ['#C9C7C1', '#1B3A5C', '#FAFAF8'] },
  { name: 'Mediterráneo', mood: 'Fresco, de luz de costa',     colors: ['#A8DADC', '#0C8599', '#F7F5F0'] },
  { name: 'Bosque',       mood: 'Sereno, verde profundo',      colors: ['#DDD6C6', '#2D6A4F', '#FAFAF8'] },
  { name: 'Industrial',   mood: 'De loft, gris sobre gris',    colors: ['#A9A7A0', '#5F5D58', '#DCDAD5'] },
  { name: 'Arcilla',      mood: 'Tierras suaves, muy natural', colors: ['#C7B091', '#B85C38', '#F2EFE8'] },
  { name: 'Noche',        mood: 'Envolvente, para dormitorio', colors: ['#4A4844', '#14304A', '#DCDAD5'] },
  { name: 'Lavanda',      mood: 'Suave, un morado que no grita', colors: ['#DED6EC', '#6A4C93', '#FAFAF8'] },
  { name: 'Mostaza',      mood: 'Alegre sin pasarse',          colors: ['#F6EDC8', '#E3B23C', '#F7F5F0'] },
];
