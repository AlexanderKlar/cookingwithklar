import { supabase } from "./supabase"
import type { FormData } from "@/app/page"
import type { MealPlan, MealPlanItem, GroceryList, GroceryListItem } from "./supabase"

export class MealService {
  // Submit survey and generate meal plan
  static async submitSurveyAndGeneratePlan(formData: FormData, sessionId?: string): Promise<string> {
    try {
      // Insert survey submission
      const { data: survey, error: surveyError } = await supabase
        .from("survey_submissions")
        .insert({
          people: formData.people,
          breakfasts: formData.meals.breakfasts,
          lunches: formData.meals.lunches,
          dinners: formData.meals.dinners,
          days: formData.meals.days,
          location: formData.location,
          dietary_restrictions: formData.dietaryRestrictions,
          other_restriction: formData.otherRestriction,
          sensitivities: formData.sensitivities,
          cooking_time: formData.cookingTime,
          leftovers: formData.leftovers,
          pantry_items: formData.pantryItems,
          cuisines: formData.cuisines,
          proteins: formData.proteins,
          session_id: sessionId,
        })
        .select()
        .single()

      if (surveyError) throw surveyError

      // Generate meal plan using database function
      const { data: mealPlanId, error: planError } = await supabase.rpc("generate_meal_plan", {
        p_survey_id: survey.id,
        p_user_id: null,
      })

      if (planError) throw planError

      return mealPlanId
    } catch (error) {
      console.error("Error submitting survey and generating plan:", error)
      throw error
    }
  }

  // Get meal plan with items
  static async getMealPlan(mealPlanId: string): Promise<{
    mealPlan: MealPlan
    items: MealPlanItem[]
    groceryList: GroceryList & { items: GroceryListItem[] }
  }> {
    try {
      // Get meal plan
      const { data: mealPlan, error: planError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("id", mealPlanId)
        .single()

      if (planError) throw planError

      // Get meal plan items with meal details
      const { data: items, error: itemsError } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          meal:meals(*)
        `)
        .eq("meal_plan_id", mealPlanId)
        .order("meal_type, order_index")

      if (itemsError) throw itemsError

      // Get grocery list
      const { data: groceryList, error: groceryError } = await supabase
        .from("grocery_lists")
        .select(`
          *,
          items:grocery_list_items(*)
        `)
        .eq("meal_plan_id", mealPlanId)
        .single()

      if (groceryError) throw groceryError

      return {
        mealPlan,
        items: items || [],
        groceryList: {
          ...groceryList,
          items: groceryList.items || [],
        },
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error)
      throw error
    }
  }

  // Update meal plan item (remove, double, etc.)
  static async updateMealPlanItem(itemId: string, updates: Partial<MealPlanItem>): Promise<void> {
    try {
      const { error } = await supabase.from("meal_plan_items").update(updates).eq("id", itemId)

      if (error) throw error

      // If meal was modified, regenerate grocery list
      if (updates.is_removed !== undefined || updates.is_doubled !== undefined) {
        const { data: item } = await supabase.from("meal_plan_items").select("meal_plan_id").eq("id", itemId).single()

        if (item) {
          await this.regenerateGroceryList(item.meal_plan_id)
        }
      }
    } catch (error) {
      console.error("Error updating meal plan item:", error)
      throw error
    }
  }

  // Replace meal with new suggestion
  static async replaceMeal(itemId: string, surveySubmissionId: string, mealType: string): Promise<void> {
    try {
      // Get survey preferences
      const { data: survey } = await supabase
        .from("survey_submissions")
        .select("dietary_restrictions")
        .eq("id", surveySubmissionId)
        .single()

      // Get a new random meal that matches preferences
      const { data: newMeal, error: mealError } = await supabase
        .from("meals")
        .select("*")
        .eq("meal_type", mealType)
        .or(
          survey?.dietary_restrictions?.length
            ? `dietary_tags.ov.{${survey.dietary_restrictions.join(",")}}`
            : "id.neq.00000000-0000-0000-0000-000000000000",
        )
        .order("random()")
        .limit(1)
        .single()

      if (mealError) throw mealError

      // Update the meal plan item
      const { error: updateError } = await supabase
        .from("meal_plan_items")
        .update({
          meal_id: newMeal.id,
          is_removed: false,
          is_doubled: false,
        })
        .eq("id", itemId)

      if (updateError) throw updateError

      // Regenerate grocery list
      const { data: item } = await supabase.from("meal_plan_items").select("meal_plan_id").eq("id", itemId).single()

      if (item) {
        await this.regenerateGroceryList(item.meal_plan_id)
      }
    } catch (error) {
      console.error("Error replacing meal:", error)
      throw error
    }
  }

  // Regenerate grocery list
  static async regenerateGroceryList(mealPlanId: string): Promise<void> {
    try {
      // Delete existing grocery list items
      const { data: groceryList } = await supabase
        .from("grocery_lists")
        .select("id")
        .eq("meal_plan_id", mealPlanId)
        .single()

      if (groceryList) {
        await supabase.from("grocery_list_items").delete().eq("grocery_list_id", groceryList.id)

        // Regenerate using database function
        await supabase.rpc("generate_grocery_list", {
          p_meal_plan_id: mealPlanId,
        })
      }
    } catch (error) {
      console.error("Error regenerating grocery list:", error)
      throw error
    }
  }

  // Update grocery list item
  static async updateGroceryItem(itemId: string, updates: Partial<GroceryListItem>): Promise<void> {
    try {
      const { error } = await supabase.from("grocery_list_items").update(updates).eq("id", itemId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating grocery item:", error)
      throw error
    }
  }
}
