/**
 * One-time migration script: seeds Supabase with the 111 Spanish words.
 *
 * Uses deterministic UUIDs so running it multiple times is safe (it just
 * upserts the same rows). Run once after creating the Supabase tables.
 *
 * Run with:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   npx ts-node --skip-project scripts/seed-supabase.ts
 */

import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── Deterministic UUID from content ─────────────────────────────────────────

function deterministicUUID(namespace: string, content: string): string {
  const hash = createHash('sha256')
    .update(`${namespace}:${content}`)
    .digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    (((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hash.slice(18, 20)),
    hash.slice(20, 32),
  ].join('-');
}

// ─── Seed data (matches db/seed.ts exactly) ───────────────────────────────────

const categoryNames = [
  'Home', 'Food & Drink', 'Travel', 'Body & Health', 'Nature',
  'Work & School', 'People & Family', 'Clothing', 'Time & Numbers', 'Common Verbs',
];

type SubCatDef = { name: string; cat: string };
const subCategoryDefs: SubCatDef[] = [
  { name: 'Room', cat: 'Home' },
  { name: 'Furniture', cat: 'Home' },
  { name: 'Kitchen', cat: 'Home' },
  { name: 'Meals', cat: 'Food & Drink' },
  { name: 'Drinks', cat: 'Food & Drink' },
  { name: 'Fruits & Vegetables', cat: 'Food & Drink' },
  { name: 'Transport', cat: 'Travel' },
  { name: 'Places', cat: 'Travel' },
  { name: 'Body Parts', cat: 'Body & Health' },
  { name: 'Health', cat: 'Body & Health' },
  { name: 'Animals', cat: 'Nature' },
  { name: 'Weather', cat: 'Nature' },
  { name: 'Office', cat: 'Work & School' },
  { name: 'School', cat: 'Work & School' },
  { name: 'Family', cat: 'People & Family' },
  { name: 'Clothes', cat: 'Clothing' },
  { name: 'Accessories', cat: 'Clothing' },
  { name: 'Days & Months', cat: 'Time & Numbers' },
  { name: 'Numbers', cat: 'Time & Numbers' },
  { name: 'Action Verbs', cat: 'Common Verbs' },
];

type WordDef = {
  spanish: string;
  english: string;
  type: string;
  cat: string;
  subcat: string;
  example: string;
};

const wordDefs: WordDef[] = [
  { spanish: 'la habitación', english: 'the room', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Esta habitación es muy grande.' },
  { spanish: 'la cocina', english: 'the kitchen', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Ella cocina en la cocina.' },
  { spanish: 'el baño', english: 'the bathroom', type: 'noun', cat: 'Home', subcat: 'Room', example: 'El baño está al fondo del pasillo.' },
  { spanish: 'el dormitorio', english: 'the bedroom', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Mi dormitorio tiene una ventana grande.' },
  { spanish: 'el salón', english: 'the living room', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Vemos la televisión en el salón.' },
  { spanish: 'el jardín', english: 'the garden', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Las flores del jardín son muy bonitas.' },
  { spanish: 'la mesa', english: 'the table', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Ponemos los platos en la mesa.' },
  { spanish: 'la silla', english: 'the chair', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Hay cuatro sillas alrededor de la mesa.' },
  { spanish: 'el sofá', english: 'the sofa', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Me siento en el sofá para leer.' },
  { spanish: 'la cama', english: 'the bed', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Me gusta leer en la cama.' },
  { spanish: 'el armario', english: 'the wardrobe', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Guardo la ropa en el armario.' },
  { spanish: 'la estantería', english: 'the bookshelf', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'La estantería está llena de libros.' },
  { spanish: 'el frigorífico', english: 'the fridge', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'La leche está en el frigorífico.' },
  { spanish: 'el horno', english: 'the oven', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'El pan se cocina en el horno.' },
  { spanish: 'la sartén', english: 'the frying pan', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'Fríe el huevo en la sartén.' },
  { spanish: 'el plato', english: 'the plate', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'Pone la comida en el plato.' },
  { spanish: 'el desayuno', english: 'the breakfast', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Como tostadas en el desayuno.' },
  { spanish: 'el almuerzo', english: 'the lunch', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El almuerzo es a las dos.' },
  { spanish: 'la cena', english: 'the dinner', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'La familia come junta en la cena.' },
  { spanish: 'el pan', english: 'the bread', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Me gusta el pan con mantequilla.' },
  { spanish: 'el queso', english: 'the cheese', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El queso manchego es muy sabroso.' },
  { spanish: 'el arroz', english: 'the rice', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El arroz con leche es un postre típico.' },
  { spanish: 'la pasta', english: 'the pasta', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Cocinamos pasta para cenar.' },
  { spanish: 'el agua', english: 'the water', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Bebo agua todos los días.' },
  { spanish: 'el café', english: 'the coffee', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Tomo un café por la mañana.' },
  { spanish: 'el vino', english: 'the wine', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Un vaso de vino tinto, por favor.' },
  { spanish: 'la cerveza', english: 'the beer', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Pedimos una cerveza fría.' },
  { spanish: 'el zumo', english: 'the juice', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'El zumo de naranja es delicioso.' },
  { spanish: 'la manzana', english: 'the apple', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Ella come una manzana cada día.' },
  { spanish: 'el plátano', english: 'the banana', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Los plátanos de Canarias son los mejores.' },
  { spanish: 'la naranja', english: 'the orange', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Exprimo una naranja para el zumo.' },
  { spanish: 'la patata', english: 'the potato', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'La tortilla española lleva patata y huevo.' },
  { spanish: 'el tomate', english: 'the tomato', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'El gazpacho se hace con tomate.' },
  { spanish: 'el avión', english: 'the plane', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Viajamos en avión a Madrid.' },
  { spanish: 'el tren', english: 'the train', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'El tren sale a las ocho.' },
  { spanish: 'el autobús', english: 'the bus', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Tomo el autobús para ir al trabajo.' },
  { spanish: 'el coche', english: 'the car', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Mi coche es de color azul.' },
  { spanish: 'la bicicleta', english: 'the bicycle', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Voy al trabajo en bicicleta.' },
  { spanish: 'el taxi', english: 'the taxi', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Pedimos un taxi al aeropuerto.' },
  { spanish: 'el aeropuerto', english: 'the airport', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Llegamos al aeropuerto a tiempo.' },
  { spanish: 'la estación', english: 'the station', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'La estación de tren está en el centro.' },
  { spanish: 'el hotel', english: 'the hotel', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'El hotel tiene cinco estrellas.' },
  { spanish: 'la playa', english: 'the beach', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Pasamos el verano en la playa.' },
  { spanish: 'la montaña', english: 'the mountain', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Hacemos senderismo en la montaña.' },
  { spanish: 'la cabeza', english: 'the head', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Me duele la cabeza.' },
  { spanish: 'la mano', english: 'the hand', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Levanta la mano para hablar.' },
  { spanish: 'el pie', english: 'the foot', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Me duele el pie derecho.' },
  { spanish: 'el ojo', english: 'the eye', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Tiene los ojos azules.' },
  { spanish: 'la boca', english: 'the mouth', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Abre la boca, por favor.' },
  { spanish: 'el brazo', english: 'the arm', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Romper un brazo es muy doloroso.' },
  { spanish: 'el médico', english: 'the doctor', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'Voy al médico esta tarde.' },
  { spanish: 'el hospital', english: 'the hospital', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'El hospital está cerca de aquí.' },
  { spanish: 'la medicina', english: 'the medicine', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'Toma la medicina dos veces al día.' },
  { spanish: 'enfermo', english: 'sick', type: 'adjective', cat: 'Body & Health', subcat: 'Health', example: 'Hoy estoy enfermo y me quedo en casa.' },
  { spanish: 'el perro', english: 'the dog', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El perro ladra mucho por las noches.' },
  { spanish: 'el gato', english: 'the cat', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El gato se sienta en el sofá.' },
  { spanish: 'el pájaro', english: 'the bird', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'Hay un pájaro cantando en el árbol.' },
  { spanish: 'el caballo', english: 'the horse', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El caballo corre muy rápido.' },
  { spanish: 'el pez', english: 'the fish', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'Tengo un pez en una pecera.' },
  { spanish: 'el sol', english: 'the sun', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'El sol brilla hoy.' },
  { spanish: 'la lluvia', english: 'the rain', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'La lluvia hace ruido en el tejado.' },
  { spanish: 'el viento', english: 'the wind', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'Hace mucho viento hoy.' },
  { spanish: 'la nieve', english: 'the snow', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'La nieve cubre las montañas en invierno.' },
  { spanish: 'el calor', english: 'the heat', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'En verano hay mucho calor.' },
  { spanish: 'el trabajo', english: 'the work / job', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Voy al trabajo a las nueve.' },
  { spanish: 'la reunión', english: 'the meeting', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Tenemos una reunión a las tres.' },
  { spanish: 'el ordenador', english: 'the computer', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Trabajo ocho horas frente al ordenador.' },
  { spanish: 'el correo', english: 'the email / mail', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Tengo muchos correos sin leer.' },
  { spanish: 'el libro', english: 'the book', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Leo un libro todas las noches.' },
  { spanish: 'el lápiz', english: 'the pencil', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Escribe con un lápiz en el cuaderno.' },
  { spanish: 'la clase', english: 'the class', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'La clase de español empieza a las diez.' },
  { spanish: 'el examen', english: 'the exam', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Estudié mucho para el examen.' },
  { spanish: 'la madre', english: 'the mother', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi madre cocina muy bien.' },
  { spanish: 'el padre', english: 'the father', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi padre trabaja en una empresa.' },
  { spanish: 'el hermano', english: 'the brother', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Tengo un hermano mayor.' },
  { spanish: 'la hermana', english: 'the sister', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi hermana vive en Barcelona.' },
  { spanish: 'el hijo', english: 'the son', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Su hijo tiene diez años.' },
  { spanish: 'la hija', english: 'the daughter', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Su hija estudia medicina.' },
  { spanish: 'el amigo', english: 'the friend', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi mejor amigo se llama Carlos.' },
  { spanish: 'la camisa', english: 'the shirt', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Lleva una camisa blanca.' },
  { spanish: 'el pantalón', english: 'the trousers', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Compré un pantalón negro ayer.' },
  { spanish: 'los zapatos', english: 'the shoes', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Me pongo los zapatos para salir.' },
  { spanish: 'el abrigo', english: 'the coat', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'En invierno llevo un abrigo grueso.' },
  { spanish: 'el sombrero', english: 'the hat', type: 'noun', cat: 'Clothing', subcat: 'Accessories', example: 'Lleva un sombrero en la playa.' },
  { spanish: 'el bolso', english: 'the bag / handbag', type: 'noun', cat: 'Clothing', subcat: 'Accessories', example: 'Ella lleva un bolso de cuero.' },
  { spanish: 'el lunes', english: 'Monday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El lunes empieza la semana.' },
  { spanish: 'el martes', english: 'Tuesday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Tengo clase de yoga el martes.' },
  { spanish: 'el miércoles', english: 'Wednesday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El miércoles es el día del mercado.' },
  { spanish: 'el jueves', english: 'Thursday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Los jueves hay partido de fútbol.' },
  { spanish: 'el viernes', english: 'Friday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El viernes salimos con amigos.' },
  { spanish: 'el fin de semana', english: 'the weekend', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El fin de semana descanso.' },
  { spanish: 'enero', english: 'January', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Enero es el primer mes del año.' },
  { spanish: 'julio', english: 'July', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'En julio hace mucho calor.' },
  { spanish: 'diciembre', english: 'December', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'En diciembre celebramos la Navidad.' },
  { spanish: 'uno', english: 'one', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Tengo uno hermano.' },
  { spanish: 'dos', english: 'two', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Somos dos personas.' },
  { spanish: 'diez', english: 'ten', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Tengo diez euros.' },
  { spanish: 'cien', english: 'one hundred', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Cuesta cien euros.' },
  { spanish: 'hablar', english: 'to speak', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Hablo español todos los días.' },
  { spanish: 'comer', english: 'to eat', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Como una manzana cada mañana.' },
  { spanish: 'beber', english: 'to drink', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Bebo agua cuando tengo sed.' },
  { spanish: 'ir', english: 'to go', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Voy al mercado los sábados.' },
  { spanish: 'venir', english: 'to come', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: '¿A qué hora vienes?' },
  { spanish: 'hacer', english: 'to do / to make', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Hago ejercicio por la mañana.' },
  { spanish: 'tener', english: 'to have', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Tengo dos hermanas.' },
  { spanish: 'ser', english: 'to be (permanent)', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Soy de Francia.' },
  { spanish: 'estar', english: 'to be (temporary)', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Estoy cansado hoy.' },
  { spanish: 'querer', english: 'to want / to love', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Quiero aprender español.' },
  { spanish: 'poder', english: 'to be able to / can', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: '¿Puedes ayudarme, por favor?' },
  { spanish: 'saber', english: 'to know', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Sé cocinar la paella.' },
  { spanish: 'vivir', english: 'to live', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Vivo en París desde hace dos años.' },
  { spanish: 'trabajar', english: 'to work', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Trabajo en una empresa tecnológica.' },
  { spanish: 'estudiar', english: 'to study', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Estudio español tres horas a la semana.' },
  { spanish: 'escuchar', english: 'to listen', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Me gusta escuchar música latina.' },
  { spanish: 'leer', english: 'to read', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Leo el periódico cada mañana.' },
  { spanish: 'escribir', english: 'to write', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Escribo en mi diario todos los días.' },
  { spanish: 'comprar', english: 'to buy', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Voy a comprar fruta en el mercado.' },
  { spanish: 'vender', english: 'to sell', type: 'verb', cat: 'Common Verbs', subcat: 'Action Verbs', example: 'Vende ropa en su tienda.' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding Supabase…\n');

  // Build category ID map
  const categories = categoryNames.map((name) => ({
    id: deterministicUUID('category', name),
    name,
  }));
  const catIdByName = new Map(categories.map((c) => [c.name, c.id]));

  // Build sub-category ID map
  const subCategories = subCategoryDefs.map((sc) => ({
    id: deterministicUUID('subcategory', `${sc.cat}:${sc.name}`),
    name: sc.name,
    category_id: catIdByName.get(sc.cat)!,
  }));
  const subcatIdByKey = new Map(
    subCategories.map((sc) => [`${sc.category_id}:${sc.name}`, sc.id])
  );

  // Build words
  const words = wordDefs.map((w) => {
    const categoryId = catIdByName.get(w.cat) ?? null;
    const subcatKey = categoryId ? `${categoryId}:${w.subcat}` : null;
    return {
      id: deterministicUUID('word', `${w.spanish}|${w.english}`),
      spanish_word: w.spanish,
      english_translation: w.english,
      type: w.type,
      category_id: categoryId,
      sub_category_id: subcatKey ? (subcatIdByKey.get(subcatKey) ?? null) : null,
      example_sentence: w.example,
      source: 'manual',
      is_active: true,
    };
  });

  // 1. Upsert categories
  const { error: catError } = await supabase
    .from('category')
    .upsert(categories, { onConflict: 'id' });
  if (catError) { console.error('Category error:', catError.message); process.exit(1); }
  console.log(`✓ ${categories.length} categories upserted`);

  // 2. Upsert sub-categories
  const { error: subcatError } = await supabase
    .from('sub_category')
    .upsert(subCategories, { onConflict: 'id' });
  if (subcatError) { console.error('Sub-category error:', subcatError.message); process.exit(1); }
  console.log(`✓ ${subCategories.length} sub-categories upserted`);

  // 3. Upsert words (in batches of 50 to avoid request size limits)
  const BATCH = 50;
  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH);
    const { error } = await supabase.from('word').upsert(batch, { onConflict: 'id' });
    if (error) { console.error('Word error:', error.message); process.exit(1); }
  }
  console.log(`✓ ${words.length} words upserted`);

  console.log('\nDone! Open your Supabase dashboard to verify the data.');
}

seed().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
