import TemplateGenerator from "./components/TemplateGenerator"
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <main className="min-h-screen p-4 bg-gray-200 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Template Generator - Repeteai</h1>
        <TemplateGenerator />
        <Toaster />
      </div>
    </main>
  )
}

export default App