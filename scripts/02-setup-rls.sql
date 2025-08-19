-- Enable Row Level Security
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Meals table is public (no RLS needed for recipe database)
-- Users can read all meals but only admins can modify
CREATE POLICY "Anyone can read meals" ON meals FOR SELECT USING (true);

-- Survey submissions policies
CREATE POLICY "Users can insert their own survey submissions" ON survey_submissions 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own survey submissions" ON survey_submissions 
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own survey submissions" ON survey_submissions 
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Meal plans policies
CREATE POLICY "Users can insert their own meal plans" ON meal_plans 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own meal plans" ON meal_plans 
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own meal plans" ON meal_plans 
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own meal plans" ON meal_plans 
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Meal plan items policies
CREATE POLICY "Users can manage meal plan items for their plans" ON meal_plan_items 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plans 
            WHERE meal_plans.id = meal_plan_items.meal_plan_id 
            AND (meal_plans.user_id = auth.uid() OR meal_plans.user_id IS NULL)
        )
    );

-- Grocery lists policies
CREATE POLICY "Users can manage their own grocery lists" ON grocery_lists 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Grocery list items policies
CREATE POLICY "Users can manage grocery list items for their lists" ON grocery_list_items 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM grocery_lists 
            WHERE grocery_lists.id = grocery_list_items.grocery_list_id 
            AND (grocery_lists.user_id = auth.uid() OR grocery_lists.user_id IS NULL)
        )
    );
