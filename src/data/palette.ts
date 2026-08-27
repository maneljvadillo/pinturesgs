/**
 * Paleta de la herramienta "Pinta el teu espai".
 * Organizada por familias; cada color tiene nombre comercial y hex.
 * Añadir un color = añadir una entrada. No hay nada más que tocar.
 */

export type Swatch = { name: string; hex: string };
export type PaletteGroup = { group: string; colors: Swatch[] };

/**
 * Luminancia relativa (la fórmula de la WCAG): 0 es negro, 1 es blanco.
 *
 * No sirve la media de R, G y B: el ojo no ve los tres canales igual de
 * brillantes —el verde pesa siete veces más que el azul—, así que ordenando
 * por la media un azul oscuro y un verde oscuro caen en sitios que no se
 * corresponden con lo que se ve. Con esta fórmula el orden coincide con lo
 * que percibe quien mira la carta.
 */
function luminancia(hex: string): number {
  const canal = (i: number): number => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/**
 * Cada familia se ordena SOLA, de más fuerte (oscuro) a más flojo (claro).
 *
 * Va aquí, en la fábrica, y no en la lista de abajo a mano: así se pueden
 * añadir colores al final de su familia sin pensar dónde colocarlos, que es
 * como se acaba desordenando una carta de colores. Y no hay dos sitios que
 * mantener sincronizados.
 */
const g = (group: string, colors: [string, string][]): PaletteGroup => ({
  group,
  colors: colors
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => luminancia(a.hex) - luminancia(b.hex)),
});

export const PALETTE: PaletteGroup[] = [
  g('Blancos', [
    ['Blanco Roto', '#FAFAF8'], ['Crema', '#F2EFE8'], ['Hueso', '#EDEAE0'],
    ['Arena Claro', '#E6E1D4'], ['Lino', '#DDD6C6'], ['Blanco Cal', '#F7F5F0'],
    ['Blanco Nieve', '#FFFFFF'], ['Blanco Perla', '#F4F2ED'],
    ['Blanco Yeso', '#F1EFEA'], ['Blanco Algodón', '#FBFAF6'],
    ['Blanco Marfil', '#F6F1E6'], ['Blanco Seda', '#F8F6F1'],
    ['Blanco Lienzo', '#F3F0E7'], ['Blanco Niebla', '#EFEDE7'],
  ]),
  g('Negros', [
    ['Negro Tinta', '#161513'], ['Carbón', '#2B2A27'], ['Grafito', '#3D3B36'],
    ['Negro Mate', '#1A1A1A'], ['Negro Profundo', '#0D0D0D'], ['Pizarra', '#26262B'],
    ['Negro Grafito', '#2F2E2B'], ['Negro Humo', '#33322E'],
    ['Negro Basalto', '#232322'], ['Negro Azabache', '#141414'],
    ['Negro Obsidiana', '#191A1C'], ['Negro Volcán', '#282523'],
    ['Negro Café', '#221C18'], ['Negro Titanio', '#37383A'],
  ]),
  g('Grises', [
    ['Gris Perla', '#C9C7C1'], ['Gris Piedra', '#A9A7A0'], ['Gris Topo', '#8A8680'],
    ['Gris Plomo', '#6B6862'], ['Antracita', '#5F5D58'], ['Gris Niebla', '#DCDAD5'],
    ['Gris Cemento', '#9B9891'], ['Gris Marengo', '#4A4844'],
    ['Gris Ceniza', '#B4B1AA'], ['Gris Acero', '#77746E'],
    ['Gris Lluvia', '#8E8C87'], ['Gris Sal', '#E2E0DA'],
    ['Gris Guijarro', '#A2A09A'], ['Gris Basalto', '#565550'],
  ]),
  g('Beiges', [
    ['Beige Arena', '#E8DCC8'], ['Beige Cálido', '#DCCBAE'], ['Beige Camel', '#D1BFA0'],
    ['Beige Tostado', '#C7B091'], ['Beige Oscuro', '#BBA07E'], ['Marfil', '#F0E6D2'],
    ['Beige Trigo', '#E0D3B8'], ['Beige Lino', '#CFC2A8'],
    ['Beige Duna', '#DED0B6'], ['Beige Nuez', '#C4AF8D'],
    ['Beige Avena', '#E5DAC4'], ['Beige Almendra', '#D8C7AA'],
    ['Beige Miel', '#D6C29B'], ['Beige Concha', '#EDE2CE'],
  ]),
  g('Marrones', [
    ['Marrón Cuero', '#8B5E34'], ['Marrón Café', '#6F4518'], ['Chocolate', '#5C3A21'],
    ['Marrón Tierra', '#4A2E1B'], ['Ébano', '#3B2417'], ['Caoba', '#7B4B2A'],
    ['Marrón Nogal', '#6B4A2F'], ['Marrón Canela', '#9C6B3F'],
    ['Marrón Avellana', '#8A6440'], ['Marrón Castaño', '#5A3E28'],
    ['Marrón Cacao', '#4E3423'], ['Marrón Roble', '#7A5533'],
    ['Marrón Tabaco', '#7C5A38'], ['Marrón Corteza', '#513724'],
  ]),
  g('Rojos', [
    ['Rojo Coral', '#E63946'], ['Rojo Teja', '#C1272D'], ['Rojo Vino', '#9E1B32'],
    ['Rojo Fuego', '#F4442E'], ['Rojo Carmín', '#D7263D'], ['Rojo Burdeos', '#7B1E28'],
    ['Rojo Ladrillo', '#A83A2C'], ['Rojo Granate', '#6E1420'],
    ['Rojo Amapola', '#D62828'], ['Rojo Óxido', '#8E3B2E'],
    ['Rojo Cereza', '#B3202E'], ['Rojo Rubí', '#8E1B2C'],
    ['Rojo Chili', '#C7302B'], ['Rojo Sangría', '#902030'],
  ]),
  g('Naranjas', [
    ['Naranja Atardecer', '#F77F00'], ['Naranja Miel', '#FB8B24'], ['Terracota', '#E85D04'],
    ['Naranja Óxido', '#D9480F'], ['Naranja Tostado', '#C2540A'], ['Albaricoque', '#F8A66C'],
    ['Naranja Calabaza', '#E8701A'], ['Naranja Arcilla', '#B85C38'],
    ['Naranja Mandarina', '#F98E3B'], ['Naranja Cobre', '#B15A28'],
    ['Naranja Zanahoria', '#EE7A32'], ['Naranja Albero', '#D98A3D'],
    ['Naranja Ámbar', '#CF6A16'], ['Naranja Melón', '#F2A366'],
  ]),
  g('Amarillos', [
    ['Amarillo Azafrán', '#FCBF49'], ['Amarillo Mostaza', '#F4D35E'], ['Amarillo Arena', '#E9C46A'],
    ['Amarillo Dorado', '#D4A017'], ['Amarillo Trigo', '#C89B3C'], ['Amarillo Pálido', '#F7E7A8'],
    ['Amarillo Miel', '#E3B23C'], ['Amarillo Limón', '#EFD34D'],
    ['Amarillo Paja', '#E8D5A0'], ['Amarillo Ámbar', '#C9942B'],
    ['Amarillo Sol', '#F2C233'], ['Amarillo Maíz', '#E7C558'],
    ['Amarillo Curry', '#BD9126'], ['Amarillo Crema', '#F3E4B0'],
  ]),
  g('Verdes', [
    ['Verde Bosque', '#52B788'], ['Verde Musgo', '#40916C'], ['Verde Pino', '#2D6A4F'],
    ['Verde Menta', '#74C69D'], ['Verde Salvia', '#95D5B2'], ['Verde Oliva', '#5C6B47'],
    ['Verde Eucalipto', '#8FAF9A'], ['Verde Botella', '#14532D'],
    ['Verde Hoja', '#3E8E5A'], ['Verde Helecho', '#6B8E4E'],
    ['Verde Jade', '#4FA37A'], ['Verde Lima', '#8CBF54'],
    ['Verde Abeto', '#265C43'], ['Verde Guisante', '#A6C98A'],
  ]),
  g('Verdes oliva', [
    ['Oliva Claro', '#A3A868'], ['Oliva Medio', '#888B4A'], ['Oliva Oscuro', '#5A5C31'],
    ['Caqui', '#9A9A6B'], ['Caqui Claro', '#BFBE92'], ['Verde Militar', '#4B5320'],
    ['Salvia Oscuro', '#7A8A6A'], ['Verde Laurel', '#6E7F4F'],
    ['Verde Junco', '#8F9A63'], ['Verde Alcaparra', '#666B3C'],
    ['Verde Tomillo', '#7D8455'], ['Verde Aceituna', '#6B6E3A'],
  ]),
  g('Turquesas', [
    ['Turquesa Mar', '#2A9D8F'], ['Turquesa Claro', '#40B5AD'], ['Turquesa Petróleo', '#0C8599'],
    ['Turquesa Esmeralda', '#0D9488'], ['Turquesa Tropical', '#14B8A6'], ['Agua', '#A8DADC'],
    ['Turquesa Laguna', '#5FBFB3'], ['Turquesa Profundo', '#086A75'],
    ['Turquesa Piscina', '#2FB6C4'], ['Turquesa Hondo', '#075E68'],
    ['Turquesa Cielo', '#67C9D6'], ['Turquesa Menta', '#9FD8D2'],
    ['Turquesa Bruma', '#4E9FA8'], ['Turquesa Ártico', '#B7E1E4'],
  ]),
  g('Azules', [
    ['Azul Cielo', '#277DA1'], ['Azul Marino', '#1B3A5C'], ['Azul Grisáceo', '#3D5A80'],
    ['Azul Noche', '#264653'], ['Azul Índigo', '#1D3557'], ['Azul Hielo', '#BFD7EA'],
    ['Azul Denim', '#4A6FA5'], ['Azul Petróleo', '#10424F'],
    ['Azul Océano', '#2A6F97'], ['Azul Acero', '#5B7FA6'],
    ['Azul Cobalto', '#2451A3'], ['Azul Lavanda', '#8FA8CF'],
    ['Azul Pizarra', '#46617C'], ['Azul Porcelana', '#D5E3ED'],
  ]),
  g('Morados', [
    ['Lavanda', '#6A4C93'], ['Morado Uva', '#7B2CBF'], ['Berenjena', '#5A189A'],
    ['Orquídea', '#9D4EDD'], ['Ciruela', '#4C3575'], ['Glicina', '#C8B6E2'],
    ['Morado Malva', '#A98DBF'], ['Morado Vino', '#3E2A56'],
    ['Morado Lila', '#8E6FB5'], ['Morado Cardenal', '#4A2A6B'],
    ['Morado Amatista', '#7A5AA8'], ['Morado Violeta', '#6438A0'],
    ['Morado Brezo', '#B9A3D0'], ['Ciruela Oscuro', '#3A2350'],
  ]),
  g('Rosas', [
    ['Rosa Fucsia', '#B5179E'], ['Rosa Frambuesa', '#D62598'], ['Rosa Coral', '#E85D75'],
    ['Rosa Carmín', '#C9184A'], ['Rosa Pastel', '#FF758F'], ['Rosa Nude', '#EFC3CA'],
    ['Rosa Empolvado', '#E6B7B7'], ['Rosa Terracota', '#C97B6B'],
    ['Rosa Palo', '#D9A5A5'], ['Rosa Buganvilla', '#A81E68'],
    ['Rosa Maquillaje', '#F2D3D1'], ['Rosa Cuarzo', '#E8B4B8'],
    ['Rosa Ciruela', '#B2607E'], ['Rosa Magenta', '#C4157F'],
  ]),
  g('Terracotas', [
    ['Terracota Clara', '#E0A183'], ['Terracota Rosada', '#D08C72'], ['Terracota Media', '#C4714F'],
    ['Terracota Toscana', '#B05B3B'], ['Terracota Quemada', '#98452C'], ['Terracota Suave', '#DDAF97'],
    ['Teja Vieja', '#A65A3E'], ['Teja Clara', '#CE8462'],
    ['Barro', '#8E4E33'], ['Cobre Mate', '#B96B45'],
    ['Canela Rosada', '#C98C6E'], ['Terracota Profunda', '#7E3A25'],
  ]),
  g('Tierras', [
    ['Ocre', '#C8963E'], ['Siena Tostada', '#A85C32'], ['Tierra de Sombra', '#6E4B32'],
    ['Arcilla Rosada', '#C08A72'], ['Barro Cocido', '#9C4A2F'], ['Adobe', '#D19A6E'],
    ['Ocre Claro', '#DFB56A'], ['Tierra Verde', '#7C7A50'],
    ['Siena Natural', '#B07A46'], ['Tierra Umbra', '#5B4530'],
    ['Tierra Arcilla', '#B26A4A'], ['Tierra Sahara', '#CDA36B'],
    ['Tierra Cobre', '#A05B34'], ['Ladrillo Viejo', '#96513C'],
  ]),
  g('Greiges', [
    ['Greige Suave', '#D6CFC4'], ['Greige Medio', '#BDB4A7'], ['Greige Piedra', '#A69C8E'],
    ['Greige Oscuro', '#857B6E'], ['Humo', '#C4BFB8'], ['Cuerda', '#CFC6B6'],
    ['Champiñón', '#B0A69B'], ['Cáñamo', '#DAD2C3'],
    ['Greige Arena', '#C8BEB0'], ['Greige Lino', '#D2C9BB'],
    ['Greige Ceniza', '#9A9186'], ['Greige Cálido', '#C0B5A6'],
    ['Greige Sombra', '#787065'], ['Greige Perla', '#E0D9CE'],
  ]),
  g('Pasteles', [
    ['Azul Bebé', '#CFE3F0'], ['Verde Agua', '#D3E9DE'], ['Amarillo Vainilla', '#F6EDC8'],
    ['Rosa Algodón', '#F5DDE0'], ['Lila Suave', '#DED6EC'], ['Melocotón', '#F8DCC8'],
    ['Gris Perla Claro', '#E4E2DD'], ['Salvia Claro', '#D8E2D4'],
    ['Rosa Nube', '#F7E4E7'], ['Amarillo Nata', '#F9F0D6'],
    ['Verde Tila', '#E2EDD9'], ['Azul Bruma', '#DCE8F2'],
    ['Lila Nieve', '#EAE4F3'], ['Melocotón Claro', '#FBE8D8'],
  ]),
  g('Profundos', [
    ['Verde Selva', '#1E3A2F'], ['Azul Prusia', '#14304A'], ['Burdeos Profundo', '#4A1220'],
    ['Berenjena Oscuro', '#3A1F3D'], ['Chocolate Profundo', '#35231A'], ['Antracita Profundo', '#2A2C2E'],
    ['Verde Petróleo', '#14413F'], ['Granate Profundo', '#3D1620'],
    ['Azul Medianoche', '#0F2233'], ['Verde Abismo', '#12302A'],
    ['Marrón Sombra', '#2C1F17'], ['Morado Noche', '#2A1B33'],
    ['Rojo Sangre', '#3A1015'], ['Gris Volcánico', '#1F2224'],
  ]),
  /*
    Los "metalizados" salen de la carta con acabado metálico. En pantalla no hay
    brillo que valga: lo que se ve aquí es el TONO plano de cada uno, que es lo
    que hay que mirar para decidir. El brillo lo pone el acabado en la pared.
  */
  g('Metalizados', [
    ['Oro Viejo', '#B08D3F'], ['Oro Champán', '#D3B981'], ['Bronce', '#8A6A3B'],
    ['Cobre', '#A85F35'], ['Plata', '#BFC1C2'], ['Peltre', '#8E9294'],
    ['Latón', '#B49B57'], ['Acero Oscuro', '#6A6E71'],
    ['Titanio', '#9AA0A3'], ['Grafito Metal', '#54585B'],
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
 * El color con el que arranca la herramienta.
 *
 * Tiene que ser uno DEL CATÁLOGO. Antes salía del selector de color libre, que
 * venía con un `#C1502E` que no está en ninguna familia: la línea del nombre
 * lo llamaba "Color personalizado", que no le sirve a nadie para encargar
 * nada. Éste tiene nombre, así que se puede pedir por teléfono.
 */
export const DEFAULT_COLOR = '#C4714F'; // Terracota Media

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
