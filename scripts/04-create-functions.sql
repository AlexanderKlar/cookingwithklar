-- Function to generate a meal plan based on survey submission
CREATE OR REPLACE FUNCTION generate_meal_plan(
    p_survey_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_meal_plan_id UUID;
    v_survey survey_submissions%ROWTYPE;
    v_meal_record meals%ROWTYPE;
    v_start_date DATE := CURRENT_DATE;
    v_current_date DATE;
    v_meal_count INTEGER;
BEGIN
    -- Get survey data
    SELECT * INTO v_survey FROM survey_submissions WHERE id = p_survey_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Survey submission not found';
    END IF;
    
    -- Create meal plan
    INSERT INTO meal_plans (survey_submission_id, user_id, title, start_date, end_date)
    VALUES (
        p_survey_id,
        COALESCE(p_user_id, v_survey.user_id),
        'Weekly Meal Plan',
        v_start_date,
        v_start_date + INTERVAL '7 days'
    )
    RETURNING id INTO v_meal_plan_id;
    
    -- Generate breakfasts
    IF v_survey.breakfasts > 0 THEN
        FOR i IN 1..v_survey.breakfasts LOOP
            SELECT * INTO v_meal_record 
            FROM meals 
            WHERE meal_type = 'breakfast'
            AND (
                array_length(v_survey.dietary_restrictions, 1) IS NULL 
                OR dietary_tags && v_survey.dietary_restrictions
                OR array_length(dietary_tags, 1) IS NULL
            )
            ORDER BY RANDOM() 
            LIMIT 1;
            
            INSERT INTO meal_plan_items (meal_plan_id, meal_id, planned_date, meal_type, order_index)
            VALUES (v_meal_plan_id, v_meal_record.id, v_start_date + (i-1), 'breakfast', i);
        END LOOP;
    END IF;
    
    -- Generate lunches
    IF v_survey.lunches > 0 THEN
        FOR i IN 1..v_survey.lunches LOOP
            SELECT * INTO v_meal_record 
            FROM meals 
            WHERE meal_type = 'lunch'
            AND (
                array_length(v_survey.dietary_restrictions, 1) IS NULL 
                OR dietary_tags && v_survey.dietary_restrictions
                OR array_length(dietary_tags, 1) IS NULL
            )
            ORDER BY RANDOM() 
            LIMIT 1;
            
            INSERT INTO meal_plan_items (meal_plan_id, meal_id, planned_date, meal_type, order_index)
            VALUES (v_meal_plan_id, v_meal_record.id, v_start_date + (i-1), 'lunch', i);
        END LOOP;
    END IF;
    
    -- Generate dinners
    IF v_survey.dinners > 0 THEN
        FOR i IN 1..v_survey.dinners LOOP
            SELECT * INTO v_meal_record 
            FROM meals 
            WHERE meal_type = 'dinner'
            AND (
                array_length(v_survey.dietary_restrictions, 1) IS NULL 
                OR dietary_tags && v_survey.dietary_restrictions
                OR array_length(dietary_tags, 1) IS NULL
            )
            ORDER BY RANDOM() 
            LIMIT 1;
            
            INSERT INTO meal_plan_items (meal_plan_id, meal_id, planned_date, meal_type, order_index)
            VALUES (v_meal_plan_id, v_meal_record.id, v_start_date + (i-1), 'dinner', i);
        END LOOP;
    END IF;
    
    -- Generate grocery list
    PERFORM generate_grocery_list(v_meal_plan_id);
    
    RETURN v_meal_plan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate grocery list from meal plan
CREATE OR REPLACE FUNCTION generate_grocery_list(p_meal_plan_id UUID)
RETURNS UUID AS $$
DECLARE
    v_grocery_list_id UUID;
    v_user_id UUID;
    v_ingredient TEXT;
    v_category TEXT;
    v_meal_ids UUID[];
BEGIN
    -- Get user_id from meal plan
    SELECT user_id INTO v_user_id FROM meal_plans WHERE id = p_meal_plan_id;
    
    -- Create grocery list
    INSERT INTO grocery_lists (meal_plan_id, user_id, title)
    VALUES (p_meal_plan_id, v_user_id, 'Weekly Grocery List')
    RETURNING id INTO v_grocery_list_id;
    
    -- Aggregate ingredients from all meals in the plan
    WITH meal_ingredients AS (
        SELECT 
            unnest(m.ingredients) as ingredient,
            array_agg(m.id) as meal_ids,
            count(*) as frequency
        FROM meal_plan_items mpi
        JOIN meals m ON mpi.meal_id = m.id
        WHERE mpi.meal_plan_id = p_meal_plan_id
        AND mpi.is_removed = FALSE
        GROUP BY unnest(m.ingredients)
    )
    INSERT INTO grocery_list_items (grocery_list_id, item_name, quantity, category, source_meal_ids, order_index)
    SELECT 
        v_grocery_list_id,
        mi.ingredient,
        CASE 
            WHEN mi.frequency > 1 THEN mi.frequency::text || ' portions'
            ELSE '1 portion'
        END,
        CASE 
            WHEN mi.ingredient ILIKE ANY(ARRAY['%chicken%', '%beef%', '%salmon%', '%turkey%', '%egg%', '%fish%']) THEN 'proteins'
            WHEN mi.ingredient ILIKE ANY(ARRAY['%milk%', '%cheese%', '%yogurt%', '%butter%']) THEN 'dairy'
            WHEN mi.ingredient ILIKE ANY(ARRAY['%tomato%', '%onion%', '%pepper%', '%lettuce%', '%spinach%', '%broccoli%', '%carrot%', '%avocado%', '%cucumber%', '%berries%', '%banana%']) THEN 'produce'
            WHEN mi.ingredient ILIKE ANY(ARRAY['%rice%', '%pasta%', '%bread%', '%oats%', '%quinoa%', '%flour%']) THEN 'pantry'
            ELSE 'other'
        END,
        mi.meal_ids,
        row_number() OVER (ORDER BY mi.ingredient)
    FROM meal_ingredients mi;
    
    RETURN v_grocery_list_id;
END;
$$ LANGUAGE plpgsql;
