import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface SurveySubmission {
  id: string
  created_at: string
  updated_at: string
  people: number
  breakfasts: number
  lunches: number
  dinners: number
  days: number
  location?: string
  dietary_restrictions: string[]
  other_restriction?: string
  sensitivities?: string
  cooking_time?: string
  leftovers?: string
  pantry_items?: string
  cuisines?: string
  proteins: string[]
  session_id?: string
  user_id?: string
}

export interface Meal {
  id: string
  created_at: string
  name: string
  meal_type: "breakfast" | "lunch" | "dinner"
  cook_time: string
  servings: number
  ingredients: string[]
  instructions?: string
  cuisine_type?: string
  dietary_tags: string[]
  difficulty?: "easy" | "medium" | "hard"
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export interface MealPlan {
  id: string
  created_at: string
  updated_at: string
  survey_submission_id: string
  user_id?: string
  title: string
  start_date: string
  end_date: string
  status: "active" | "archived" | "draft"
}

export interface MealPlanItem {
  id: string
  created_at: string
  updated_at: string
  meal_plan_id: string
  meal_id: string
  planned_date: string
  meal_type: "breakfast" | "lunch" | "dinner"
  order_index: number
  is_removed: boolean
  is_doubled: boolean
  custom_servings?: number
  notes?: string
  meal?: Meal // Join relationship
}

export interface GroceryList {
  id: string
  created_at: string
  updated_at: string
  meal_plan_id: string
  user_id?: string
  title: string
  status: "active" | "completed" | "archived"
}

export interface GroceryListItem {
  id: string
  created_at: string
  updated_at: string
  grocery_list_id: string
  item_name: string
  quantity?: string
  category: string
  is_checked: boolean
  is_already_owned: boolean
  source_meal_ids: string[]
  order_index: number
  notes?: string
}
