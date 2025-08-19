import { supabase } from "./supabase"
import { ClaudeService } from "./claude-service"
import type { FormData } from "@/app/page"
import type { MealPlan, MealPlanItem, GroceryList, GroceryListItem, Meal } from "./supabase"

export class EnhancedMealService {
  // Submit survey and generate AI-powered meal plan with fallback
  static async submitSurveyAndGenerateAIPlan(formData: FormData, sessionId?: string): Promise<string> {
    try {
      console.log("Starting meal plan generation...")

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

      if (surveyError) {
        console.error("Survey submission error:", surveyError)
        throw new Error(`Failed to save survey: ${surveyError.message}`)
      }

      console.log("Survey submitted successfully:", survey.id)

      // Create meal plan
      const { data: mealPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          survey_submission_id: survey.id,
          title: "AI-Generated Weekly Meal Plan",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single()

      if (planError) {
        console.error("Meal plan creation error:", planError)
        throw new Error(`Failed to create meal plan: ${planError.message}`)
      }

      console.log("Meal plan created:", mealPlan.id)

      // Try AI generation first, fallback to database if it fails
      let useAI = true
      const allMeals: { meal: Meal; type: string; index: number }[] = []

      try {
        // Generate AI-powered meals
        console.log("Attempting AI meal generation...")

        // Generate breakfasts
        if (formData.meals.breakfasts > 0) {
          const breakfasts = await ClaudeService.generateMealSuggestions(
            formData,
            "breakfast",
            formData.meals.breakfasts,
          )
          breakfasts.forEach((meal, index) => {
            allMeals.push({ meal, type: "breakfast", index })
          })
        }

        // Generate lunches
        if (formData.meals.lunches > 0) {
          const lunches = await ClaudeService.generateMealSuggestions(formData, "lunch", formData.meals.lunches)
          lunches.forEach((meal, index) => {
            allMeals.push({ meal, type: "lunch", index })
          })
        }

        // Generate dinners
        if (formData.meals.dinners > 0) {
          const dinners = await ClaudeService.generateMealSuggestions(formData, "dinner", formData.meals.dinners)
          dinners.forEach((meal, index) => {
            allMeals.push({ meal, type: "dinner", index })
          })
        }

        console.log(`AI generated ${allMeals.length} meals successfully`)
      } catch (aiError) {
        console.warn("AI generation failed, falling back to database meals:", aiError)
        useAI = false

        // Fallback to database-based generation
        try {
          const { data: fallbackPlanId, error: fallbackError } = await supabase.rpc("generate_meal_plan", {
            p_survey_id: survey.id,
            p_user_id: null,
          })

          if (fallbackError) throw fallbackError

          // Delete the empty meal plan we created and return the generated one
          await supabase.from("meal_plans").delete().eq("id", mealPlan.id)

          console.log("Fallback meal plan generated:", fallbackPlanId)
          return fallbackPlanId
        } catch (fallbackError) {
          console.error("Fallback generation also failed:", fallbackError)
          throw new Error("Both AI and database meal generation failed")
        }
      }

      // Insert AI-generated meals into database and create meal plan items
      for (const { meal, type, index } of allMeals) {
        try {
          // Insert meal into meals table
          const { data: insertedMeal, error: mealError } = await supabase
            .from("meals")
            .insert({
              name: meal.name,
              meal_type: meal.meal_type,
              cook_time: meal.cook_time,
              servings: meal.servings,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
              cuisine_type: meal.cuisine_type,
              dietary_tags: meal.dietary_tags,
              difficulty: meal.difficulty,
              calories: meal.calories,
            })
            .select()
            .single()

          if (mealError) {
            console.error("Error inserting meal:", mealError)
            continue // Skip this meal and continue with others
          }

          // Create meal plan item
          const { error: itemError } = await supabase.from("meal_plan_items").insert({
            meal_plan_id: mealPlan.id,
            meal_id: insertedMeal.id,
            planned_date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            meal_type: type as any,
            order_index: index + 1,
          })

          if (itemError) {
            console.error("Error creating meal plan item:", itemError)
          }
        } catch (mealInsertError) {
          console.error("Error processing meal:", mealInsertError)
          continue
        }
      }

      // Generate grocery list (simplified version)
      try {
        await this.generateSimpleGroceryList(mealPlan.id)
      } catch (groceryError) {
        console.warn("Grocery list generation failed:", groceryError)
        // Continue without grocery list - user can still see meals
      }

      console.log("Meal plan generation completed:", mealPlan.id)
      return mealPlan.id
    } catch (error) {
      console.error("Detailed error in submitSurveyAndGenerateAIPlan:", error)

      // Provide more specific error information
      if (error instanceof Error) {
        throw new Error(`Meal plan generation failed: ${error.message}`)
      } else {
        throw new Error(`Meal plan generation failed: ${JSON.stringify(error)}`)
      }
    }
  }

  // Simplified grocery list generation
  private static async generateSimpleGroceryList(mealPlanId: string): Promise<void> {
    try {
      // Get all ingredients from meal plan
      const { data: mealItems, error: itemsError } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          meal:meals(ingredients)
        `)
        .eq("meal_plan_id", mealPlanId)
        .eq("is_removed", false)

      if (itemsError) throw itemsError

      // Create grocery list
      const { data: groceryList, error: listError } = await supabase
        .from("grocery_lists")
        .insert({
          meal_plan_id: mealPlanId,
          title: "Weekly Grocery List",
        })
        .select()
        .single()

      if (listError) throw listError

      // Collect and deduplicate ingredients
      const ingredientMap = new Map<string, number>()

      mealItems?.forEach((item) => {
        if (item.meal?.ingredients) {
          const multiplier = item.is_doubled ? 2 : 1
          item.meal.ingredients.forEach((ingredient: string) => {
            const current = ingredientMap.get(ingredient) || 0
            ingredientMap.set(ingredient, current + multiplier)
          })
        }
      })

      // Insert grocery items
      const groceryItems = Array.from(ingredientMap.entries()).map(([ingredient, quantity], index) => ({
        grocery_list_id: groceryList.id,
        item_name: ingredient,
        category: this.categorizeItem(ingredient),
        order_index: index,
        quantity: quantity > 1 ? `${quantity} portions` : "1 portion",
      }))

      if (groceryItems.length > 0) {
        const { error: itemsInsertError } = await supabase.from("grocery_list_items").insert(groceryItems)
        if (itemsInsertError) throw itemsInsertError
      }
    } catch (error) {
      console.error("Error generating simple grocery list:", error)
      throw error
    }
  }

  // Replace meal with AI-generated alternative
  static async replaceWithAIMeal(itemId: string, formData: FormData, currentMeal: Meal): Promise<void> {
    try {
      // Generate new meal suggestion
      const newMeal = await ClaudeService.generateReplacementMeal(formData, currentMeal.meal_type, currentMeal)

      // Insert new meal into database
      const { data: insertedMeal, error: mealError } = await supabase
        .from("meals")
        .insert({
          name: newMeal.name,
          meal_type: newMeal.meal_type,
          cook_time: newMeal.cook_time,
          servings: newMeal.servings,
          ingredients: newMeal.ingredients,
          instructions: newMeal.instructions,
          cuisine_type: newMeal.cuisine_type,
          dietary_tags: newMeal.dietary_tags,
          difficulty: newMeal.difficulty,
          calories: newMeal.calories,
        })
        .select()
        .single()

      if (mealError) throw mealError

      // Update meal plan item
      const { error: updateError } = await supabase
        .from("meal_plan_items")
        .update({
          meal_id: insertedMeal.id,
          is_removed: false,
          is_doubled: false,
        })
        .eq("id", itemId)

      if (updateError) throw updateError

      // Regenerate grocery list
      const { data: item } = await supabase.from("meal_plan_items").select("meal_plan_id").eq("id", itemId).single()

      if (item) {
        // Get survey data for grocery list regeneration
        const { data: mealPlan } = await supabase
          .from("meal_plans")
          .select("survey_submission_id")
          .eq("id", item.meal_plan_id)
          .single()

        if (mealPlan) {
          const { data: survey } = await supabase
            .from("survey_submissions")
            .select("*")
            .eq("id", mealPlan.survey_submission_id)
            .single()

          if (survey) {
            // Convert survey back to FormData format for AI processing
            const surveyFormData: FormData = {
              people: survey.people,
              meals: {
                breakfasts: survey.breakfasts,
                lunches: survey.lunches,
                dinners: survey.dinners,
                days: survey.days,
              },
              location: survey.location || "",
              dietaryRestrictions: survey.dietary_restrictions || [],
              otherRestriction: survey.other_restriction || "",
              sensitivities: survey.sensitivities || "",
              cookingTime: survey.cooking_time || "",
              leftovers: survey.leftovers || "",
              pantryItems: survey.pantry_items || "",
              cuisines: survey.cuisines || "",
              proteins: survey.proteins || [],
            }

            await this.regenerateAIGroceryList(item.meal_plan_id, surveyFormData)
          }
        }
      }
    } catch (error) {
      console.error("Error replacing meal with AI:", error)
      throw error
    }
  }

  // Regenerate grocery list with AI optimization
  static async regenerateAIGroceryList(mealPlanId: string, formData: FormData): Promise<void> {
    try {
      // Delete existing grocery list items
      const { data: groceryList } = await supabase
        .from("grocery_lists")
        .select("id")
        .eq("meal_plan_id", mealPlanId)
        .single()

      if (groceryList) {
        await supabase.from("grocery_list_items").delete().eq("grocery_list_id", groceryList.id)
        await this.generateAIGroceryList(mealPlanId, formData)
      }
    } catch (error) {
      console.error("Error regenerating AI grocery list:", error)
      throw error
    }
  }

  // Helper method to categorize grocery items
  private static categorizeItem(item: string): string {
    const itemLower = item.toLowerCase()

    if (
      itemLower.includes("chicken") ||
      itemLower.includes("beef") ||
      itemLower.includes("salmon") ||
      itemLower.includes("turkey") ||
      itemLower.includes("egg") ||
      itemLower.includes("fish") ||
      itemLower.includes("pork") ||
      itemLower.includes("lamb")
    ) {
      return "proteins"
    }

    if (
      itemLower.includes("milk") ||
      itemLower.includes("cheese") ||
      itemLower.includes("yogurt") ||
      itemLower.includes("butter") ||
      itemLower.includes("cream")
    ) {
      return "dairy"
    }

    if (
      itemLower.includes("tomato") ||
      itemLower.includes("onion") ||
      itemLower.includes("pepper") ||
      itemLower.includes("lettuce") ||
      itemLower.includes("spinach") ||
      itemLower.includes("broccoli") ||
      itemLower.includes("carrot") ||
      itemLower.includes("avocado") ||
      itemLower.includes("cucumber") ||
      itemLower.includes("berries") ||
      itemLower.includes("banana") ||
      itemLower.includes("apple") ||
      itemLower.includes("fruit") ||
      itemLower.includes("vegetable")
    ) {
      return "produce"
    }

    if (
      itemLower.includes("rice") ||
      itemLower.includes("pasta") ||
      itemLower.includes("bread") ||
      itemLower.includes("oats") ||
      itemLower.includes("quinoa") ||
      itemLower.includes("flour") ||
      itemLower.includes("oil") ||
      itemLower.includes("vinegar") ||
      itemLower.includes("spice") ||
      itemLower.includes("sauce") ||
      itemLower.includes("stock") ||
      itemLower.includes("broth")
    ) {
      return "pantry"
    }

    return "other"
  }

  // Get meal plan with all data (same as original service)
  static async getMealPlan(mealPlanId: string): Promise<{
    mealPlan: MealPlan
    items: MealPlanItem[]
    groceryList: GroceryList & { items: GroceryListItem[] }
  }> {
    try {
      const { data: mealPlan, error: planError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("id", mealPlanId)
        .single()

      if (planError) throw planError

      const { data: items, error: itemsError } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          meal:meals(*)
        `)
        .eq("meal_plan_id", mealPlanId)
        .order("meal_type, order_index")

      if (itemsError) throw itemsError

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

  // Update meal plan item (same as original)
  static async updateMealPlanItem(itemId: string, updates: Partial<MealPlanItem>): Promise<void> {
    try {
      const { error } = await supabase.from("meal_plan_items").update(updates).eq("id", itemId)
      if (error) throw error
    } catch (error) {
      console.error("Error updating meal plan item:", error)
      throw error
    }
  }
}
