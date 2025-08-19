"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FormData } from "@/app/page"

interface QuestionnaireProps {
  initialData: FormData
  onComplete: (data: FormData) => void
  error?: string
}

export default function Questionnaire({ initialData, onComplete, error }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialData)
  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    const updated = checked
      ? [...formData.dietaryRestrictions, restriction]
      : formData.dietaryRestrictions.filter((r) => r !== restriction)
    updateFormData({ dietaryRestrictions: updated })
  }

  const handleProteinChange = (protein: string, checked: boolean) => {
    const updated = checked ? [...formData.proteins, protein] : formData.proteins.filter((p) => p !== protein)
    updateFormData({ proteins: updated })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error generating meal plan</div>
            </div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
            <div className="text-red-600 text-sm mt-2">Please try again or contact support if the issue persists.</div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center text-gray-900">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Location & Preferences"}
              {currentStep === 3 && "Cooking Style"}
              {currentStep === 4 && "Current Inventory"}
              {currentStep === 5 && "Protein Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="people" className="text-base font-medium">
                    How many people are you cooking for?
                  </Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    value={formData.people}
                    onChange={(e) => updateFormData({ people: Number.parseInt(e.target.value) || 1 })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-4 block">How many meals do you want to plan?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="breakfasts" className="text-sm">
                        Breakfasts
                      </Label>
                      <Input
                        id="breakfasts"
                        type="number"
                        min="0"
                        value={formData.meals.breakfasts}
                        onChange={(e) =>
                          updateFormData({
                            meals: { ...formData.meals, breakfasts: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lunches" className="text-sm">
                        Lunches
                      </Label>
                      <Input
                        id="lunches"
                        type="number"
                        min="0"
                        value={formData.meals.lunches}
                        onChange={(e) =>
                          updateFormData({
                            meals: { ...formData.meals, lunches: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dinners" className="text-sm">
                        Dinners
                      </Label>
                      <Input
                        id="dinners"
                        type="number"
                        min="0"
                        value={formData.meals.dinners}
                        onChange={(e) =>
                          updateFormData({
                            meals: { ...formData.meals, dinners: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="days" className="text-sm">
                        Over how many days?
                      </Label>
                      <Input
                        id="days"
                        type="number"
                        min="1"
                        value={formData.meals.days}
                        onChange={(e) =>
                          updateFormData({
                            meals: { ...formData.meals, days: Number.parseInt(e.target.value) || 7 },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="location" className="text-base font-medium">
                    What city/region are you in?
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">This helps us suggest seasonal produce</p>
                </div>
                <div>
                  <Label className="text-base font-medium mb-4 block">Any dietary restrictions?</Label>
                  <div className="space-y-3">
                    {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free"].map((restriction) => (
                      <div key={restriction} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction}
                          checked={formData.dietaryRestrictions.includes(restriction)}
                          onCheckedChange={(checked) => handleDietaryRestrictionChange(restriction, checked as boolean)}
                        />
                        <Label htmlFor={restriction}>{restriction}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="other-restriction"
                        checked={formData.otherRestriction !== ""}
                        onCheckedChange={(checked) => updateFormData({ otherRestriction: checked ? "Other" : "" })}
                      />
                      <Label htmlFor="other-restriction">Other:</Label>
                      <Input
                        placeholder="Specify..."
                        value={formData.otherRestriction}
                        onChange={(e) => updateFormData({ otherRestriction: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sensitivities" className="text-base font-medium">
                    Food sensitivities?
                  </Label>
                  <Textarea
                    id="sensitivities"
                    placeholder="e.g., nuts, shellfish, spicy foods..."
                    value={formData.sensitivities}
                    onChange={(e) => updateFormData({ sensitivities: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Cooking Style */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">How much time do you have for cooking?</Label>
                  <RadioGroup
                    value={formData.cookingTime}
                    onValueChange={(value) => updateFormData({ cookingTime: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quick" id="quick" />
                      <Label htmlFor="quick">Quick meals only (under 30 min)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mix of quick and longer meals</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="longer" id="longer" />
                      <Label htmlFor="longer">I enjoy longer cooking sessions</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-base font-medium mb-4 block">How do you feel about leftovers?</Label>
                  <RadioGroup
                    value={formData.leftovers}
                    onValueChange={(value) => updateFormData({ leftovers: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="love" id="love" />
                      <Label htmlFor="love">Love them</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="some" id="some" />
                      <Label htmlFor="some">Some are fine</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fresh" id="fresh" />
                      <Label htmlFor="fresh">Prefer fresh meals each time</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Current Inventory */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="pantry" className="text-base font-medium">
                    What's in your pantry that you want to use up?
                  </Label>
                  <Textarea
                    id="pantry"
                    placeholder="e.g., 1 lb pasta, canned tomatoes, frozen shrimp..."
                    value={formData.pantryItems}
                    onChange={(e) => updateFormData({ pantryItems: e.target.value })}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="cuisines" className="text-base font-medium">
                    Any specific cuisines you're craving?
                  </Label>
                  <Input
                    id="cuisines"
                    placeholder="e.g., Italian, Thai, Mexican..."
                    value={formData.cuisines}
                    onChange={(e) => updateFormData({ cuisines: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Protein Preferences */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">What proteins do you enjoy?</Label>
                  <div className="space-y-3">
                    {["Seafood", "Poultry", "Beef", "Pork", "Vegetarian proteins", "Other"].map((protein) => (
                      <div key={protein} className="flex items-center space-x-2">
                        <Checkbox
                          id={protein}
                          checked={formData.proteins.includes(protein)}
                          onCheckedChange={(checked) => handleProteinChange(protein, checked as boolean)}
                        />
                        <Label htmlFor={protein}>{protein}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                {currentStep === totalSteps ? "Generate Plan" : "Next"}
                {currentStep < totalSteps && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
