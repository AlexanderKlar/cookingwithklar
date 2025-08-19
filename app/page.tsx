"use client"
import { ChefHat, Clock, ShoppingCart, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleStartPlanning = () => {
    router.push('/questionnaire')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <ChefHat className="h-12 w-12 text-orange-600" />
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Weekly Eats</h1>
            </div>
            <p className="text-xl md:text-2xl text-orange-600 font-medium mb-6">Personalized meal plans made simple</p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Get a customized weekly meal plan with grocery list based on your preferences, dietary needs, and cooking
              style. Save time, reduce food waste, and enjoy delicious meals.
            </p>
          </div>
          <button
            onClick={handleStartPlanning}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Planning
          </button>
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600 text-sm">Tailored to your family size, dietary needs, and preferences</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time-Saving</h3>
              <p className="text-gray-600 text-sm">Quick meal options that fit your schedule and cooking style</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Shopping</h3>
              <p className="text-gray-600 text-sm">Organized grocery lists that use what you already have</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}