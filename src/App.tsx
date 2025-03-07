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
      <div className="absolute left-0 hidden ml-4 opacity-50 pointer-events-none select-none top-2/4 -translate-y-2/4 blur-xs 2xl:block">
        <img src="./logo.png" alt="logo" className="" />
      </div>
      <div className="absolute right-0 hidden mr-4 opacity-50 pointer-events-none select-none top-2/4 -translate-y-2/4 blur-xs 2xl:block">
        <img src="./logo.png" alt="logo" className="" />
      </div>
    </main>
  )
}

export default App