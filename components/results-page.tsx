"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Download, Share, RotateCcw, Edit } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState } from "react"
import { Trash2, Plus, RefreshCw } from "lucide-react"
import React from "react"
import { EnhancedMealService } from "@/services/enhanced-meal-service"

interface ResultsPageProps {
  mealPlanId: string
  formData: FormData
  onPlanAnother: () => void
  onModifyPlan: () => void
}

interface MealModification {
  removed: boolean
  doubled: boolean
  originalMeal?: any
}

type MealModifications = {
  breakfasts: { [key: number]: MealModification }
  lunches: { [key: number]: MealModification }
  dinners: { [key: number]: MealModification }
}

// Mock meal plan data
const mockMealPlan = {
  breakfasts: [
    {
      name: "Overnight Oats with Berries",
      time: "5 min prep",
      servings: 1,
      ingredients: ["Oats", "Milk", "Berries", "Honey"],
    },
    { name: "Avocado Toast with Egg", time: "10 min", servings: 1, ingredients: ["Bread", "Avocado", "Egg", "Salt"] },
    { name: "Greek Yogurt Parfait", time: "5 min", servings: 1, ingredients: ["Greek yogurt", "Granola", "Berries"] },
    {
      name: "Smoothie Bowl",
      time: "10 min",
      servings: 1,
      ingredients: ["Banana", "Spinach", "Protein powder", "Almond milk"],
    },
    {
      name: "Scrambled Eggs with Toast",
      time: "15 min",
      servings: 1,
      ingredients: ["Eggs", "Butter", "Bread", "Cheese"],
    },
  ],
  lunches: [
    {
      name: "Mediterranean Quinoa Salad",
      time: "20 min",
      servings: 2,
      ingredients: ["Quinoa", "Cucumber", "Tomatoes", "Feta", "Olive oil"],
    },
    {
      name: "Turkey and Hummus Wrap",
      time: "10 min",
      servings: 1,
      ingredients: ["Tortilla", "Turkey", "Hummus", "Vegetables"],
    },
    { name: "Leftover Chicken Stir-fry", time: "5 min reheat", servings: 1, ingredients: ["From Tuesday dinner"] },
  ],
  dinners: [
    {
      name: "Honey Garlic Salmon with Roasted Vegetables",
      time: "35 min",
      servings: 2,
      ingredients: ["Salmon", "Honey", "Garlic", "Broccoli", "Carrots"],
    },
    {
      name: "Chicken Stir-fry with Brown Rice",
      time: "25 min",
      servings: 3,
      ingredients: ["Chicken breast", "Mixed vegetables", "Brown rice", "Soy sauce"],
    },
    {
      name: "Vegetarian Pasta Primavera",
      time: "30 min",
      servings: 2,
      ingredients: ["Pasta", "Zucchini", "Bell peppers", "Cherry tomatoes", "Parmesan"],
    },
    {
      name: "Beef and Vegetable Curry",
      time: "45 min",
      servings: 3,
      ingredients: ["Beef", "Coconut milk", "Curry paste", "Vegetables", "Rice"],
    },
    {
      name: "Sheet Pan Chicken Fajitas",
      time: "30 min",
      servings: 2,
      ingredients: ["Chicken", "Bell peppers", "Onions", "Tortillas", "Lime"],
    },
  ],
}

const mockGroceryList = {
  proteins: [
    "Salmon fillets (1 lb)",
    "Chicken breast (2 lbs)",
    "Ground beef (1 lb)",
    "Turkey slices (1/2 lb)",
    "Eggs (1 dozen)",
  ],
  produce: [
    "Avocados (3)",
    "Berries (2 containers)",
    "Bananas (6)",
    "Spinach (1 bag)",
    "Broccoli (2 heads)",
    "Bell peppers (4)",
    "Onions (2)",
    "Garlic (1 bulb)",
    "Limes (4)",
  ],
  pantry: [
    "Quinoa (1 bag)",
    "Brown rice (1 bag)",
    "Pasta (2 boxes)",
    "Oats (1 container)",
    "Honey",
    "Olive oil",
    "Soy sauce",
    "Coconut milk (2 cans)",
  ],
  dairy: ["Greek yogurt (large container)", "Milk (1/2 gallon)", "Feta cheese", "Parmesan cheese", "Butter"],
  other: ["Bread (1 loaf)", "Tortillas (1 pack)", "Hummus", "Granola", "Protein powder"],
}

const alreadyHave = ["Pasta (from pantry)", "Canned tomatoes", "Frozen shrimp"]

// Update the component to handle the sample meal plan ID and show mock data when needed
export default function ResultsPage({ mealPlanId, formData, onPlanAnother, onModifyPlan }: ResultsPageProps) {
  const [mealModifications, setMealModifications] = useState<MealModifications>({
    breakfasts: {},
    lunches: {},
    dinners: {},
  })

  // Add loading state for real data
  const [isLoading, setIsLoading] = useState(false)
  const [realMealPlan, setRealMealPlan] = useState<any>(null)

  // Use mock data for sample meal plan, real data for others
  const useMockData = mealPlanId === "sample-meal-plan-123"

  // Add useEffect to load real data when needed
  React.useEffect(() => {
    if (!useMockData) {
      setIsLoading(true)
      EnhancedMealService.getMealPlan(mealPlanId)
        .then((data) => {
          setRealMealPlan(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error loading meal plan:", error)
          setIsLoading(false)
        })
    }
  }, [mealPlanId, useMockData])

  // Show loading state for real data
  if (!useMockData && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meal plan...</p>
        </div>
      </div>
    )
  }

  const handleRemoveMeal = (mealType: keyof MealModifications, index: number) => {
    setMealModifications((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [index]: { removed: true, doubled: false },
      },
    }))
  }

  const handleDoubleMeal = (mealType: keyof MealModifications, index: number) => {
    setMealModifications((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [index]: {
          removed: false,
          doubled: !prev[mealType]?.[index]?.doubled,
        },
      },
    }))
  }

  const handleGenerateNew = (mealType: keyof MealModifications, index: number) => {
    const newMealSuggestions = {
      breakfasts: [
        {
          name: "Chia Seed Pudding",
          time: "5 min prep",
          servings: 1,
          ingredients: ["Chia seeds", "Almond milk", "Vanilla", "Berries"],
        },
        {
          name: "Breakfast Burrito",
          time: "15 min",
          servings: 1,
          ingredients: ["Tortilla", "Eggs", "Cheese", "Salsa", "Avocado"],
        },
        { name: "Acai Bowl", time: "10 min", servings: 1, ingredients: ["Acai", "Banana", "Granola", "Coconut"] },
      ],
      lunches: [
        {
          name: "Buddha Bowl",
          time: "25 min",
          servings: 1,
          ingredients: ["Quinoa", "Chickpeas", "Vegetables", "Tahini"],
        },
        {
          name: "Chicken Caesar Salad",
          time: "15 min",
          servings: 1,
          ingredients: ["Romaine", "Chicken", "Parmesan", "Croutons"],
        },
        { name: "Veggie Soup", time: "30 min", servings: 2, ingredients: ["Mixed vegetables", "Broth", "Herbs"] },
      ],
      dinners: [
        { name: "Lemon Herb Cod", time: "25 min", servings: 2, ingredients: ["Cod", "Lemon", "Herbs", "Asparagus"] },
        {
          name: "Mushroom Risotto",
          time: "40 min",
          servings: 2,
          ingredients: ["Arborio rice", "Mushrooms", "Parmesan", "Wine"],
        },
        {
          name: "Thai Green Curry",
          time: "35 min",
          servings: 3,
          ingredients: ["Chicken", "Green curry paste", "Coconut milk", "Vegetables"],
        },
      ],
    }

    const suggestions = newMealSuggestions[mealType]
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

    setMealModifications((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [index]: {
          removed: false,
          doubled: false,
          originalMeal: randomSuggestion,
        },
      },
    }))
  }

  const getMealToDisplay = (mealType: keyof MealModifications, index: number, originalMeal: any) => {
    const modification = mealModifications[mealType]?.[index]
    if (modification?.originalMeal) {
      return modification.originalMeal
    }
    return originalMeal
  }

  const isMealRemoved = (mealType: keyof MealModifications, index: number) => {
    return mealModifications[mealType]?.[index]?.removed || false
  }

  const isMealDoubled = (mealType: keyof MealModifications, index: number) => {
    return mealModifications[mealType]?.[index]?.doubled || false
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Meal Plan</h1>
          <p className="text-gray-600">
            {formData.meals.breakfasts} breakfasts, {formData.meals.lunches} lunches, {formData.meals.dinners} dinners
            for {formData.people} {formData.people === 1 ? "person" : "people"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Meal Plan Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breakfasts */}
            {formData.meals.breakfasts > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-orange-600">Breakfasts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMealPlan.breakfasts.slice(0, formData.meals.breakfasts).map((meal, index) => {
                      if (isMealRemoved("breakfasts", index)) return null
                      const displayMeal = getMealToDisplay("breakfasts", index, meal)
                      const isDoubled = isMealDoubled("breakfasts", index)

                      return (
                        <div
                          key={index}
                          className={`border-l-4 border-orange-200 pl-4 py-2 ${isDoubled ? "bg-orange-50" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{displayMeal.name}</h3>
                                {isDoubled && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                    2x Servings
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-2 text-sm text-gray-500 mr-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {displayMeal.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {isDoubled ? displayMeal.servings * 2 : displayMeal.servings}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDoubleMeal("breakfasts", index)}
                                  className={`h-6 w-6 p-0 ${isDoubled ? "bg-orange-100 text-orange-700" : "hover:bg-orange-100"}`}
                                  title={isDoubled ? "Remove double serving" : "Double this meal"}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleGenerateNew("breakfasts", index)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Generate new suggestion"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMeal("breakfasts", index)}
                                  className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                  title="Remove this meal"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {displayMeal.ingredients.map((ingredient: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lunches */}
            {formData.meals.lunches > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">Lunches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMealPlan.lunches.slice(0, formData.meals.lunches).map((meal, index) => {
                      if (isMealRemoved("lunches", index)) return null
                      const displayMeal = getMealToDisplay("lunches", index, meal)
                      const isDoubled = isMealDoubled("lunches", index)

                      return (
                        <div
                          key={index}
                          className={`border-l-4 border-green-200 pl-4 py-2 ${isDoubled ? "bg-green-50" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{displayMeal.name}</h3>
                                {isDoubled && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    2x Servings
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-2 text-sm text-gray-500 mr-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {displayMeal.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {isDoubled ? displayMeal.servings * 2 : displayMeal.servings}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDoubleMeal("lunches", index)}
                                  className={`h-6 w-6 p-0 ${isDoubled ? "bg-green-100 text-green-700" : "hover:bg-green-100"}`}
                                  title={isDoubled ? "Remove double serving" : "Double this meal"}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleGenerateNew("lunches", index)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Generate new suggestion"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMeal("lunches", index)}
                                  className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                  title="Remove this meal"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {displayMeal.ingredients.map((ingredient: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dinners */}
            {formData.meals.dinners > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-orange-700">Dinners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMealPlan.dinners.slice(0, formData.meals.dinners).map((meal, index) => {
                      if (isMealRemoved("dinners", index)) return null
                      const displayMeal = getMealToDisplay("dinners", index, meal)
                      const isDoubled = isMealDoubled("dinners", index)

                      return (
                        <div
                          key={index}
                          className={`border-l-4 border-orange-300 pl-4 py-2 ${isDoubled ? "bg-orange-50" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{displayMeal.name}</h3>
                                {isDoubled && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                    2x Servings
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-2 text-sm text-gray-500 mr-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {displayMeal.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {isDoubled ? displayMeal.servings * 2 : displayMeal.servings}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDoubleMeal("dinners", index)}
                                  className={`h-6 w-6 p-0 ${isDoubled ? "bg-orange-100 text-orange-700" : "hover:bg-orange-100"}`}
                                  title={isDoubled ? "Remove double serving" : "Double this meal"}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleGenerateNew("dinners", index)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Generate new suggestion"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMeal("dinners", index)}
                                  className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                  title="Remove this meal"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {displayMeal.ingredients.map((ingredient: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Grocery List Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-green-700">Grocery List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(mockGroceryList).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                      {category === "other" ? "Other Items" : category}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox id={`${category}-${index}`} />
                          <label htmlFor={`${category}-${index}`} className="text-sm text-gray-700 cursor-pointer">
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Items You Already Have */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">Items You Already Have</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alreadyHave.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded border border-green-300 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-600 rounded"></div>
                      </div>
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
              <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
                <Share className="h-4 w-4" />
                Share List
              </Button>
              <Button
                variant="outline"
                onClick={onModifyPlan}
                className="w-full flex items-center gap-2 bg-transparent"
              >
                <Edit className="h-4 w-4" />
                Modify Plan
              </Button>
              <Button
                variant="outline"
                onClick={onPlanAnother}
                className="w-full flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Plan Another Week
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
