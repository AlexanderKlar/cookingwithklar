import { ChefHat, Sparkles, Brain } from "lucide-react"

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
          <ChefHat className="h-12 w-12 text-orange-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-orange-600" />
            Creating your personalized meal plan...
            <Sparkles className="h-6 w-6 text-orange-600" />
          </h2>
          <div className="space-y-2 text-gray-600">
            <p className="animate-pulse">🧠 Analyzing your preferences and dietary needs...</p>
            <p className="animate-pulse delay-500">🍳 Generating custom recipes tailored to your taste...</p>
            <p className="animate-pulse delay-1000">🛒 Creating your optimized grocery list...</p>
            <p className="animate-pulse delay-1500">✨ Adding finishing touches...</p>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>This may take a moment • Powered by AI</p>
          </div>
        </div>
      </div>
    </div>
  )
}
