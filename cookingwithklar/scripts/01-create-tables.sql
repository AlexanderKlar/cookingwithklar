-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create survey_submissions table to store user preferences
CREATE TABLE survey_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Info (Step 1)
    people INTEGER NOT NULL DEFAULT 1,
    breakfasts INTEGER NOT NULL DEFAULT 0,
    lunches INTEGER NOT NULL DEFAULT 0,
    dinners INTEGER NOT NULL DEFAULT 0,
    days INTEGER NOT NULL DEFAULT 7,
    
    -- Location & Preferences (Step 2)
    location TEXT,
    dietary_restrictions TEXT[] DEFAULT '{}',
    other_restriction TEXT,
    sensitivities TEXT,
    
    -- Cooking Style (Step 3)
    cooking_time TEXT, -- 'quick', 'mixed', 'longer'
    leftovers TEXT, -- 'love', 'some', 'fresh'
    
    -- Current Inventory (Step 4)
    pantry_items TEXT,
    cuisines TEXT,
    
    -- Protein Preferences (Step 5)
    proteins TEXT[] DEFAULT '{}',
    
    -- Session tracking
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create meals table for storing individual meal items
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    cook_time TEXT NOT NULL,
    servings INTEGER NOT NULL DEFAULT 1,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    instructions TEXT,
    cuisine_type TEXT,
    dietary_tags TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    
    -- Nutritional info (optional)
    calories INTEGER,
    protein_g INTEGER,
    carbs_g INTEGER,
    fat_g INTEGER
);

-- Create meal_plans table to store generated meal plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    survey_submission_id UUID REFERENCES survey_submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    title TEXT DEFAULT 'Weekly Meal Plan',
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft'))
);

-- Create meal_plan_items table to store individual meals in a plan
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    
    planned_date DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    order_index INTEGER DEFAULT 0,
    
    -- Modifications
    is_removed BOOLEAN DEFAULT FALSE,
    is_doubled BOOLEAN DEFAULT FALSE,
    custom_servings INTEGER,
    notes TEXT
);

-- Create grocery_lists table
CREATE TABLE grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    title TEXT DEFAULT 'Weekly Grocery List',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'))
);

-- Create grocery_list_items table
CREATE TABLE grocery_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    
    item_name TEXT NOT NULL,
    quantity TEXT, -- e.g., "2 lbs", "1 container", "3 pieces"
    category TEXT NOT NULL, -- proteins, produce, pantry, dairy, other
    is_checked BOOLEAN DEFAULT FALSE,
    is_already_owned BOOLEAN DEFAULT FALSE,
    
    -- Link to meals that require this item
    source_meal_ids UUID[] DEFAULT '{}',
    
    order_index INTEGER DEFAULT 0,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_survey_submissions_user_id ON survey_submissions(user_id);
CREATE INDEX idx_survey_submissions_session_id ON survey_submissions(session_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_survey_id ON meal_plans(survey_submission_id);
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_planned_date ON meal_plan_items(planned_date);
CREATE INDEX idx_grocery_lists_meal_plan_id ON grocery_lists(meal_plan_id);
CREATE INDEX idx_grocery_list_items_grocery_list_id ON grocery_list_items(grocery_list_id);
CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_dietary_tags ON meals USING GIN(dietary_tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_survey_submissions_updated_at BEFORE UPDATE ON survey_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plan_items_updated_at BEFORE UPDATE ON meal_plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grocery_list_items_updated_at BEFORE UPDATE ON grocery_list_items FOR EACH ROW EXECUTE FUNCTION update_grocery_list_items_updated_at_column();
