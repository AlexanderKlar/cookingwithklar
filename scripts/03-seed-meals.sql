-- Insert sample meals for the meal planning system
INSERT INTO meals (name, meal_type, cook_time, servings, ingredients, instructions, cuisine_type, dietary_tags, difficulty, calories) VALUES

-- Breakfasts
('Overnight Oats with Berries', 'breakfast', '5 min prep', 1, 
 ARRAY['Rolled oats', 'Milk', 'Mixed berries', 'Honey', 'Chia seeds'], 
 'Mix oats with milk and chia seeds. Refrigerate overnight. Top with berries and honey.',
 'American', ARRAY['vegetarian'], 'easy', 320),

('Avocado Toast with Egg', 'breakfast', '10 min', 1,
 ARRAY['Whole grain bread', 'Avocado', 'Egg', 'Salt', 'Pepper', 'Lemon juice'],
 'Toast bread. Mash avocado with lemon juice. Fry egg. Assemble and season.',
 'American', ARRAY['vegetarian'], 'easy', 380),

('Greek Yogurt Parfait', 'breakfast', '5 min', 1,
 ARRAY['Greek yogurt', 'Granola', 'Mixed berries', 'Honey'],
 'Layer yogurt, granola, and berries in a glass. Drizzle with honey.',
 'Mediterranean', ARRAY['vegetarian'], 'easy', 280),

('Smoothie Bowl', 'breakfast', '10 min', 1,
 ARRAY['Banana', 'Spinach', 'Protein powder', 'Almond milk', 'Granola', 'Coconut flakes'],
 'Blend banana, spinach, protein powder, and almond milk. Top with granola and coconut.',
 'American', ARRAY['vegetarian', 'gluten-free'], 'easy', 350),

('Scrambled Eggs with Toast', 'breakfast', '15 min', 1,
 ARRAY['Eggs', 'Butter', 'Whole grain bread', 'Cheese', 'Chives'],
 'Scramble eggs with butter. Toast bread. Serve with cheese and chives.',
 'American', ARRAY['vegetarian'], 'easy', 420),

-- Lunches
('Mediterranean Quinoa Salad', 'lunch', '20 min', 2,
 ARRAY['Quinoa', 'Cucumber', 'Cherry tomatoes', 'Feta cheese', 'Olive oil', 'Lemon juice', 'Red onion'],
 'Cook quinoa. Mix with chopped vegetables, feta, and dressing.',
 'Mediterranean', ARRAY['vegetarian', 'gluten-free'], 'easy', 380),

('Turkey and Hummus Wrap', 'lunch', '10 min', 1,
 ARRAY['Whole wheat tortilla', 'Turkey slices', 'Hummus', 'Lettuce', 'Tomato', 'Cucumber'],
 'Spread hummus on tortilla. Add turkey and vegetables. Roll tightly.',
 'Mediterranean', ARRAY[], 'easy', 320),

('Buddha Bowl', 'lunch', '25 min', 1,
 ARRAY['Quinoa', 'Chickpeas', 'Sweet potato', 'Kale', 'Avocado', 'Tahini', 'Lemon juice'],
 'Roast sweet potato and chickpeas. Serve over quinoa with kale and tahini dressing.',
 'American', ARRAY['vegan', 'gluten-free'], 'medium', 450),

-- Dinners
('Honey Garlic Salmon with Roasted Vegetables', 'dinner', '35 min', 2,
 ARRAY['Salmon fillets', 'Honey', 'Garlic', 'Soy sauce', 'Broccoli', 'Carrots', 'Olive oil'],
 'Marinate salmon in honey-garlic sauce. Roast vegetables. Bake salmon until flaky.',
 'Asian', ARRAY['gluten-free'], 'medium', 520),

('Chicken Stir-fry with Brown Rice', 'dinner', '25 min', 3,
 ARRAY['Chicken breast', 'Mixed vegetables', 'Brown rice', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil'],
 'Cook rice. Stir-fry chicken and vegetables with aromatics and sauce.',
 'Asian', ARRAY[], 'easy', 480),

('Vegetarian Pasta Primavera', 'dinner', '30 min', 2,
 ARRAY['Pasta', 'Zucchini', 'Bell peppers', 'Cherry tomatoes', 'Parmesan cheese', 'Olive oil', 'Basil'],
 'Cook pasta. Sauté vegetables. Toss with pasta, cheese, and herbs.',
 'Italian', ARRAY['vegetarian'], 'easy', 420),

('Beef and Vegetable Curry', 'dinner', '45 min', 3,
 ARRAY['Beef chunks', 'Coconut milk', 'Curry paste', 'Mixed vegetables', 'Jasmine rice', 'Onion', 'Ginger'],
 'Brown beef. Add curry paste and coconut milk. Simmer with vegetables. Serve over rice.',
 'Thai', ARRAY['gluten-free'], 'medium', 580),

('Sheet Pan Chicken Fajitas', 'dinner', '30 min', 2,
 ARRAY['Chicken breast', 'Bell peppers', 'Onions', 'Tortillas', 'Lime', 'Cumin', 'Paprika'],
 'Season chicken and vegetables. Roast on sheet pan. Serve with tortillas and lime.',
 'Mexican', ARRAY[], 'easy', 450),

-- Additional meal options for variety
('Chia Seed Pudding', 'breakfast', '5 min prep', 1,
 ARRAY['Chia seeds', 'Almond milk', 'Vanilla extract', 'Mixed berries', 'Maple syrup'],
 'Mix chia seeds with almond milk and vanilla. Refrigerate overnight. Top with berries.',
 'American', ARRAY['vegan', 'gluten-free'], 'easy', 280),

('Breakfast Burrito', 'breakfast', '15 min', 1,
 ARRAY['Flour tortilla', 'Eggs', 'Cheese', 'Salsa', 'Avocado', 'Black beans'],
 'Scramble eggs. Warm tortilla. Fill with eggs, cheese, beans, and toppings.',
 'Mexican', ARRAY['vegetarian'], 'easy', 480),

('Chicken Caesar Salad', 'lunch', '15 min', 1,
 ARRAY['Romaine lettuce', 'Grilled chicken', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
 'Grill chicken. Toss lettuce with dressing. Top with chicken, cheese, and croutons.',
 'American', ARRAY[], 'easy', 380),

('Lemon Herb Cod', 'dinner', '25 min', 2,
 ARRAY['Cod fillets', 'Lemon', 'Fresh herbs', 'Asparagus', 'Olive oil', 'Garlic'],
 'Season cod with herbs and lemon. Roast with asparagus until fish flakes.',
 'Mediterranean', ARRAY['gluten-free'], 'easy', 320),

('Thai Green Curry', 'dinner', '35 min', 3,
 ARRAY['Chicken thighs', 'Green curry paste', 'Coconut milk', 'Thai basil', 'Jasmine rice', 'Fish sauce'],
 'Brown chicken. Add curry paste and coconut milk. Simmer until tender. Serve over rice.',
 'Thai', ARRAY['gluten-free'], 'medium', 520);
