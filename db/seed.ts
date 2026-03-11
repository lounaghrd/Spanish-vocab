import { getDb } from './database';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000001';

export function seedDatabase(): void {
  const db = getDb();

  // Check if already seeded
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM category'
  );
  if (existing && existing.count > 0) return;

  db.withTransactionSync(() => {
  // --- CATEGORIES & SUB-CATEGORIES ---
  const categories: Record<string, string> = {};
  const subCategories: Record<string, string> = {};

  function addCategory(name: string): string {
    const id = uuid();
    categories[name] = id;
    db.runSync(`INSERT INTO category (id, name) VALUES (?, ?)`, [id, name]);
    return id;
  }

  function addSubCategory(name: string, catName: string): string {
    const id = uuid();
    subCategories[`${catName}:${name}`] = id;
    db.runSync(
      `INSERT INTO sub_category (id, name, category_id) VALUES (?, ?, ?)`,
      [id, name, categories[catName]]
    );
    return id;
  }

  // Categories
  addCategory('Home');
  addCategory('Food & Drink');
  addCategory('Travel');
  addCategory('Body & Health');
  addCategory('Nature');
  addCategory('Work & School');
  addCategory('People & Family');
  addCategory('Clothing');
  addCategory('Time & Numbers');
  addCategory('Common Verbs');

  // Sub-categories
  addSubCategory('Room', 'Home');
  addSubCategory('Furniture', 'Home');
  addSubCategory('Kitchen', 'Home');
  addSubCategory('Meals', 'Food & Drink');
  addSubCategory('Drinks', 'Food & Drink');
  addSubCategory('Fruits & Vegetables', 'Food & Drink');
  addSubCategory('Transport', 'Travel');
  addSubCategory('Places', 'Travel');
  addSubCategory('Body Parts', 'Body & Health');
  addSubCategory('Health', 'Body & Health');
  addSubCategory('Animals', 'Nature');
  addSubCategory('Weather', 'Nature');
  addSubCategory('Office', 'Work & School');
  addSubCategory('School', 'Work & School');
  addSubCategory('Family', 'People & Family');
  addSubCategory('Clothes', 'Clothing');
  addSubCategory('Accessories', 'Clothing');
  addSubCategory('Days & Months', 'Time & Numbers');
  addSubCategory('Numbers', 'Time & Numbers');
  addSubCategory('Action Verbs', 'Common Verbs');

  // --- WORDS ---
  type WordSeed = {
    spanish: string;
    english: string;
    type: string;
    cat: string;
    subcat: string;
    example: string;
  };

  const words: WordSeed[] = [
    // HOME - Room
    { spanish: 'la habitación', english: 'the room', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Esta habitación es muy grande.' },
    { spanish: 'la cocina', english: 'the kitchen', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Ella cocina en la cocina.' },
    { spanish: 'el baño', english: 'the bathroom', type: 'noun', cat: 'Home', subcat: 'Room', example: 'El baño está al fondo del pasillo.' },
    { spanish: 'el dormitorio', english: 'the bedroom', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Mi dormitorio tiene una ventana grande.' },
    { spanish: 'el salón', english: 'the living room', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Vemos la televisión en el salón.' },
    { spanish: 'el jardín', english: 'the garden', type: 'noun', cat: 'Home', subcat: 'Room', example: 'Las flores del jardín son muy bonitas.' },

    // HOME - Furniture
    { spanish: 'la mesa', english: 'the table', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Ponemos los platos en la mesa.' },
    { spanish: 'la silla', english: 'the chair', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Hay cuatro sillas alrededor de la mesa.' },
    { spanish: 'el sofá', english: 'the sofa', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Me siento en el sofá para leer.' },
    { spanish: 'la cama', english: 'the bed', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Me gusta leer en la cama.' },
    { spanish: 'el armario', english: 'the wardrobe', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'Guardo la ropa en el armario.' },
    { spanish: 'la estantería', english: 'the bookshelf', type: 'noun', cat: 'Home', subcat: 'Furniture', example: 'La estantería está llena de libros.' },

    // HOME - Kitchen
    { spanish: 'el frigorífico', english: 'the fridge', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'La leche está en el frigorífico.' },
    { spanish: 'el horno', english: 'the oven', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'El pan se cocina en el horno.' },
    { spanish: 'la sartén', english: 'the frying pan', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'Fríe el huevo en la sartén.' },
    { spanish: 'el plato', english: 'the plate', type: 'noun', cat: 'Home', subcat: 'Kitchen', example: 'Pone la comida en el plato.' },

    // FOOD & DRINK - Meals
    { spanish: 'el desayuno', english: 'the breakfast', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Como tostadas en el desayuno.' },
    { spanish: 'el almuerzo', english: 'the lunch', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El almuerzo es a las dos.' },
    { spanish: 'la cena', english: 'the dinner', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'La familia come junta en la cena.' },
    { spanish: 'el pan', english: 'the bread', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Me gusta el pan con mantequilla.' },
    { spanish: 'el queso', english: 'the cheese', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El queso manchego es muy sabroso.' },
    { spanish: 'el arroz', english: 'the rice', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'El arroz con leche es un postre típico.' },
    { spanish: 'la pasta', english: 'the pasta', type: 'noun', cat: 'Food & Drink', subcat: 'Meals', example: 'Cocinamos pasta para cenar.' },

    // FOOD & DRINK - Drinks
    { spanish: 'el agua', english: 'the water', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Bebo agua todos los días.' },
    { spanish: 'el café', english: 'the coffee', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Tomo un café por la mañana.' },
    { spanish: 'el vino', english: 'the wine', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Un vaso de vino tinto, por favor.' },
    { spanish: 'la cerveza', english: 'the beer', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'Pedimos una cerveza fría.' },
    { spanish: 'el zumo', english: 'the juice', type: 'noun', cat: 'Food & Drink', subcat: 'Drinks', example: 'El zumo de naranja es delicioso.' },

    // FOOD & DRINK - Fruits & Vegetables
    { spanish: 'la manzana', english: 'the apple', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Ella come una manzana cada día.' },
    { spanish: 'el plátano', english: 'the banana', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Los plátanos de Canarias son los mejores.' },
    { spanish: 'la naranja', english: 'the orange', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'Exprimo una naranja para el zumo.' },
    { spanish: 'la patata', english: 'the potato', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'La tortilla española lleva patata y huevo.' },
    { spanish: 'el tomate', english: 'the tomato', type: 'noun', cat: 'Food & Drink', subcat: 'Fruits & Vegetables', example: 'El gazpacho se hace con tomate.' },

    // TRAVEL - Transport
    { spanish: 'el avión', english: 'the plane', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Viajamos en avión a Madrid.' },
    { spanish: 'el tren', english: 'the train', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'El tren sale a las ocho.' },
    { spanish: 'el autobús', english: 'the bus', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Tomo el autobús para ir al trabajo.' },
    { spanish: 'el coche', english: 'the car', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Mi coche es de color azul.' },
    { spanish: 'la bicicleta', english: 'the bicycle', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Voy al trabajo en bicicleta.' },
    { spanish: 'el taxi', english: 'the taxi', type: 'noun', cat: 'Travel', subcat: 'Transport', example: 'Pedimos un taxi al aeropuerto.' },

    // TRAVEL - Places
    { spanish: 'el aeropuerto', english: 'the airport', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Llegamos al aeropuerto a tiempo.' },
    { spanish: 'la estación', english: 'the station', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'La estación de tren está en el centro.' },
    { spanish: 'el hotel', english: 'the hotel', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'El hotel tiene cinco estrellas.' },
    { spanish: 'la playa', english: 'the beach', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Pasamos el verano en la playa.' },
    { spanish: 'la montaña', english: 'the mountain', type: 'noun', cat: 'Travel', subcat: 'Places', example: 'Hacemos senderismo en la montaña.' },

    // BODY & HEALTH - Body Parts
    { spanish: 'la cabeza', english: 'the head', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Me duele la cabeza.' },
    { spanish: 'la mano', english: 'the hand', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Levanta la mano para hablar.' },
    { spanish: 'el pie', english: 'the foot', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Me duele el pie derecho.' },
    { spanish: 'el ojo', english: 'the eye', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Tiene los ojos azules.' },
    { spanish: 'la boca', english: 'the mouth', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Abre la boca, por favor.' },
    { spanish: 'el brazo', english: 'the arm', type: 'noun', cat: 'Body & Health', subcat: 'Body Parts', example: 'Romper un brazo es muy doloroso.' },

    // BODY & HEALTH - Health
    { spanish: 'el médico', english: 'the doctor', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'Voy al médico esta tarde.' },
    { spanish: 'el hospital', english: 'the hospital', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'El hospital está cerca de aquí.' },
    { spanish: 'la medicina', english: 'the medicine', type: 'noun', cat: 'Body & Health', subcat: 'Health', example: 'Toma la medicina dos veces al día.' },
    { spanish: 'enfermo', english: 'sick', type: 'adjective', cat: 'Body & Health', subcat: 'Health', example: 'Hoy estoy enfermo y me quedo en casa.' },

    // NATURE - Animals
    { spanish: 'el perro', english: 'the dog', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El perro ladra mucho por las noches.' },
    { spanish: 'el gato', english: 'the cat', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El gato se sienta en el sofá.' },
    { spanish: 'el pájaro', english: 'the bird', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'Hay un pájaro cantando en el árbol.' },
    { spanish: 'el caballo', english: 'the horse', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'El caballo corre muy rápido.' },
    { spanish: 'el pez', english: 'the fish', type: 'noun', cat: 'Nature', subcat: 'Animals', example: 'Tengo un pez en una pecera.' },

    // NATURE - Weather
    { spanish: 'el sol', english: 'the sun', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'El sol brilla hoy.' },
    { spanish: 'la lluvia', english: 'the rain', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'La lluvia hace ruido en el tejado.' },
    { spanish: 'el viento', english: 'the wind', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'Hace mucho viento hoy.' },
    { spanish: 'la nieve', english: 'the snow', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'La nieve cubre las montañas en invierno.' },
    { spanish: 'el calor', english: 'the heat', type: 'noun', cat: 'Nature', subcat: 'Weather', example: 'En verano hay mucho calor.' },

    // WORK & SCHOOL - Office
    { spanish: 'el trabajo', english: 'the work / job', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Voy al trabajo a las nueve.' },
    { spanish: 'la reunión', english: 'the meeting', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Tenemos una reunión a las tres.' },
    { spanish: 'el ordenador', english: 'the computer', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Trabajo ocho horas frente al ordenador.' },
    { spanish: 'el correo', english: 'the email / mail', type: 'noun', cat: 'Work & School', subcat: 'Office', example: 'Tengo muchos correos sin leer.' },

    // WORK & SCHOOL - School
    { spanish: 'el libro', english: 'the book', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Leo un libro todas las noches.' },
    { spanish: 'el lápiz', english: 'the pencil', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Escribe con un lápiz en el cuaderno.' },
    { spanish: 'la clase', english: 'the class', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'La clase de español empieza a las diez.' },
    { spanish: 'el examen', english: 'the exam', type: 'noun', cat: 'Work & School', subcat: 'School', example: 'Estudié mucho para el examen.' },

    // PEOPLE & FAMILY
    { spanish: 'la madre', english: 'the mother', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi madre cocina muy bien.' },
    { spanish: 'el padre', english: 'the father', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi padre trabaja en una empresa.' },
    { spanish: 'el hermano', english: 'the brother', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Tengo un hermano mayor.' },
    { spanish: 'la hermana', english: 'the sister', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi hermana vive en Barcelona.' },
    { spanish: 'el hijo', english: 'the son', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Su hijo tiene diez años.' },
    { spanish: 'la hija', english: 'the daughter', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Su hija estudia medicina.' },
    { spanish: 'el amigo', english: 'the friend', type: 'noun', cat: 'People & Family', subcat: 'Family', example: 'Mi mejor amigo se llama Carlos.' },

    // CLOTHING
    { spanish: 'la camisa', english: 'the shirt', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Lleva una camisa blanca.' },
    { spanish: 'el pantalón', english: 'the trousers', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Compré un pantalón negro ayer.' },
    { spanish: 'los zapatos', english: 'the shoes', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'Me pongo los zapatos para salir.' },
    { spanish: 'el abrigo', english: 'the coat', type: 'noun', cat: 'Clothing', subcat: 'Clothes', example: 'En invierno llevo un abrigo grueso.' },
    { spanish: 'el sombrero', english: 'the hat', type: 'noun', cat: 'Clothing', subcat: 'Accessories', example: 'Lleva un sombrero en la playa.' },
    { spanish: 'el bolso', english: 'the bag / handbag', type: 'noun', cat: 'Clothing', subcat: 'Accessories', example: 'Ella lleva un bolso de cuero.' },

    // TIME & NUMBERS - Days & Months
    { spanish: 'el lunes', english: 'Monday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El lunes empieza la semana.' },
    { spanish: 'el martes', english: 'Tuesday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Tengo clase de yoga el martes.' },
    { spanish: 'el miércoles', english: 'Wednesday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El miércoles es el día del mercado.' },
    { spanish: 'el jueves', english: 'Thursday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Los jueves hay partido de fútbol.' },
    { spanish: 'el viernes', english: 'Friday', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El viernes salimos con amigos.' },
    { spanish: 'el fin de semana', english: 'the weekend', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'El fin de semana descanso.' },
    { spanish: 'enero', english: 'January', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'Enero es el primer mes del año.' },
    { spanish: 'julio', english: 'July', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'En julio hace mucho calor.' },
    { spanish: 'diciembre', english: 'December', type: 'noun', cat: 'Time & Numbers', subcat: 'Days & Months', example: 'En diciembre celebramos la Navidad.' },

    // TIME & NUMBERS - Numbers
    { spanish: 'uno', english: 'one', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Tengo uno hermano.' },
    { spanish: 'dos', english: 'two', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Somos dos personas.' },
    { spanish: 'diez', english: 'ten', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Tengo diez euros.' },
    { spanish: 'cien', english: 'one hundred', type: 'adjective', cat: 'Time & Numbers', subcat: 'Numbers', example: 'Cuesta cien euros.' },

    // COMMON VERBS
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

  for (const w of words) {
    const id = uuid();
    const catId = categories[w.cat] ?? null;
    const subcatKey = `${w.cat}:${w.subcat}`;
    const subcatId = subCategories[subcatKey] ?? null;
    db.runSync(
      `INSERT INTO word (id, spanish_word, english_translation, type, category_id, sub_category_id, example_sentence, source, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', 1)`,
      [id, w.spanish, w.english, w.type, catId, subcatId, w.example]
    );
  }
  }); // end withTransactionSync
}
