"use client"
import { useState } from "react"
import { ChefHat, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuestionnaireAnswers {
  familySize: string;
  dietaryRestrictions: string[];
  cookingTime: string;
  cookingSkill: string;
  budget: string;
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    familySize: "",
    dietaryRestrictions: [],
    cookingTime: "",
    cookingSkill: "",
    budget: ""
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // Navigate to results later
      console.log("Generate meal plan with:", answers)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">Weekly Eats</span>
          </div>
          <div className="text-sm text-gray-500">Step {currentStep} of 5</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="bg-orange-600 h-2 transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto w-full">
          
          {/* Step 1: Family Size */}
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How many people are you cooking for?</h2>
              <p className="text-gray-600 mb-8">This helps us plan the right portion sizes</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {['1 person', '2 people', '3-4 people', '5+ people'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setAnswers({...answers, familySize: size})}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      answers.familySize === size 
                        ? 'border-orange-600 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dietary Restrictions */}
          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Any dietary preferences?</h2>
              <p className="text-gray-600 mb-8">Select all that apply (or none)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'None'].map((diet) => (
                  <button
                    key={diet}
                    onClick={() => {
                      const current = answers.dietaryRestrictions as string[]
                      const isSelected = current.includes(diet)
                      setAnswers({
                        ...answers, 
                        dietaryRestrictions: isSelected 
                          ? current.filter(d => d !== diet)
                          : [...current, diet]
                      })
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      (answers.dietaryRestrictions as string[]).includes(diet)
                        ? 'border-orange-600 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Cooking Time */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How much time do you have for cooking?</h2>
              <p className="text-gray-600 mb-8">On average, per meal</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {['15-30 minutes', '30-60 minutes', '60+ minutes'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setAnswers({...answers, cookingTime: time})}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      answers.cookingTime === time 
                        ? 'border-orange-600 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-semibold">{time}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Cooking Skill */}
          {currentStep === 4 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your cooking skill level?</h2>
              <p className="text-gray-600 mb-8">Be honest - we'll match recipes to your comfort level</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { level: 'Beginner', desc: 'Simple recipes, basic techniques' },
                  { level: 'Intermediate', desc: 'Comfortable with most cooking methods' },
                  { level: 'Advanced', desc: 'Love complex recipes and challenges' }
                ].map((skill) => (
                  <button
                    key={skill.level}
                    onClick={() => setAnswers({...answers, cookingSkill: skill.level})}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      answers.cookingSkill === skill.level 
                        ? 'border-orange-600 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-2">{skill.level}</div>
                    <div className="text-sm text-gray-600">{skill.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Budget */}
          {currentStep === 5 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your weekly grocery budget?</h2>
              <p className="text-gray-600 mb-8">This helps us suggest cost-effective meals</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {['Under $50', '$50-100', '$100-150', '$150+'].map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setAnswers({...answers, budget})}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      answers.budget === budget 
                        ? 'border-orange-600 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-lg font-semibold">{budget}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !answers.familySize) ||
                (currentStep === 2 && answers.dietaryRestrictions.length === 0) ||
                (currentStep === 3 && !answers.cookingTime) ||
                (currentStep === 4 && !answers.cookingSkill) ||
                (currentStep === 5 && !answers.budget)
              }
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              {currentStep === 5 ? 'Generate My Meal Plan' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}