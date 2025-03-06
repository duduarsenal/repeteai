import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { ClipboardCopy, RefreshCw, Plus } from "lucide-react"
import { toast } from "./ui/use-toast"
import { ToastAction } from "./ui/toast"

export default function TemplateGenerator() {
  const [template, setTemplate] = useState("")
  const [variables, setVariables] = useState<Array<{ name: string; values: string }>>([])
  const [output, setOutput] = useState<string[]>([])
  const [valueDelimiter, setValueDelimiter] = useState(",")

  // Extract variables from template when it changes
  useEffect(() => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = Array.from(template.matchAll(regex))

    // Get unique variable names
    const uniqueVars = Array.from(new Set(matches.map((match) => match[1])))

    // Update variables state, preserving existing values
    setVariables((prevVars) => {
      const newVars = uniqueVars.map((name) => {
        const existingVar = prevVars.find((v) => v.name === name)
        return {
          name,
          values: existingVar ? existingVar.values : "",
        }
      })
      return newVars
    })
  }, [template])

  // Generate output based on template and variables
  const generateOutput = () => {
    if (!template) {
      toast({
        title: "Texto vazio",
        description: "Por favor digite um texto com o formato {{variavel}}.",
        variant: "destructive",
      })
      return
    }

    if (variables.length === 0) {
      toast({
        title: "Nenhuma variavel encontrada",
        description: "Por favor insira ao menos 1 variavel no seu texto usando o formato {{variavel}}",
        variant: "destructive",
      })
      return
    }

    // Check if any variable has no values
    const emptyVars = variables.filter((v) => !v.values.trim())
    if (emptyVars.length > 0) {
      toast({
        title: "Variaveis sem valores",
        description: `Please provide values for: ${emptyVars.map((v) => v.name).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Parse values for each variable
    const parsedValues = variables.map((v) => ({
      name: v.name,
      valueList: v.values.split(valueDelimiter).map((val) => val.trim()),
    }))

    // Check if all variables have the same number of values
    const valueCounts = parsedValues.map((v) => v.valueList.length)
    const allSameCount = valueCounts.every((count) => count === valueCounts[0])

    if (!allSameCount) {
      toast({
        title: "Inconsistent value counts",
        description: "All variables should have the same number of values.",
        variant: "destructive",
        action: (
          <ToastAction altText="Continuar mesmo assim" onClick={() => generateWithParsedValues(parsedValues)}>
            Continuar mesmo assim
          </ToastAction>
        ),
      })
      return
    }

    generateWithParsedValues(parsedValues)
  }

  const generateWithParsedValues = (parsedValues: Array<{ name: string; valueList: string[] }>) => {
    // Find the maximum number of values across all variables
    const maxCount = Math.max(...parsedValues.map((v) => v.valueList.length))

    // Generate output for each set of values
    const results: string[] = []

    for (let i = 0; i < maxCount; i++) {
      let result = template

      // Replace each variable with its corresponding value
      parsedValues.forEach((variable) => {
        const value =
          i < variable.valueList.length ? variable.valueList[i] : variable.valueList[variable.valueList.length - 1]
        const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g")
        result = result.replace(regex, value)
      })

      results.push(result)
    }

    setOutput(results)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.join("\n"))
    toast({
      title: "Copied to clipboard",
      description: "The generated output has been copied to your clipboard.",
    })
  }

  const handleVariableValueChange = (index: number, values: string) => {
    const updatedVariables = [...variables]
    updatedVariables[index].values = values
    setVariables(updatedVariables)
  }

  const clearAll = () => {
    setTemplate("")
    setVariables([])
    setOutput([])
  }

  const addCustomVariable = () => {
    const newVarName = `var${variables.length + 1}`
    setTemplate((prev) => `${prev}{{${newVarName}}}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col w-full gap-2 mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-md">
            Template (use {`{{variavel}}`} para valores dinamicos)
          </label>
          <Textarea
            placeholder="UPDATE table SET column = 'value' WHERE id = {{id}}"
            value={template}
            className="resize-none"
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>

        <div className="flex justify-end mb-4 space-x-2">
          <Button onClick={addCustomVariable}>
            <Plus className="w-4 h-4 mr-1" /> 
            <span>Adicionar variavel</span>
          </Button>
        </div>
      </Card>

      {variables.length > 0 && (
        <Card>
          <h2 className="mb-4 text-xl font-medium">Variaveis</h2>
          <div className="mb-4">
            <label htmlFor="delimiter" className="flex gap-2 mb-1 text-sm font-medium text-gray-700">
              <span>Delimitador</span>
              <span className="flex items-center text-sm text-gray-500">(separa multiplos valores)</span>
            </label>
            <div className="flex space-x-2">
              <Input
                id="delimiter"
                value={valueDelimiter}
                onChange={(e) => setValueDelimiter(e.target.value.trim())}
                className="w-20"
                required={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            {variables.map((varItem, index) => (
              <div key={index} className="space-y-1">
                <label htmlFor={`var-${varItem.name}`} className="block text-sm font-medium text-gray-700">
                  Variavel: {varItem.name}
                </label>
                <Textarea
                  id={`var-${varItem.name}`}
                  placeholder={`Variavel1${valueDelimiter} Variavel2${valueDelimiter} Variavel3`}
                  value={varItem.values}
                  onChange={(e) => handleVariableValueChange(index, e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            ))}
          </div>

          <div className="flex mt-6 space-x-2">
            <Button onClick={generateOutput}>Gerar Template</Button>
            <Button onClick={clearAll}>
              <RefreshCw className="w-4 h-4 mr-1" /> Limpar
            </Button>
          </div>
        </Card>
      )}

      {output.length > 0 && (
        <Card>
          <div className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Generated Output ({output.length} items)</h2>
              <Button onClick={copyToClipboard}>
                <ClipboardCopy className="w-4 h-4 mr-1" /> Copy All
              </Button>
            </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{output.join("\n")}</pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

