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
  const [valueDelimiter, setValueDelimiter] = useState("\\n")

  // Extrai variaveis do texto template ao mudar caso tenha alguma
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

  // Gera o texto baseado no template e nas variaveis
  const generateOutput = () => {
    if (!template) {
      toast({
        title: "Texto vazio",
        description: "Por favor digite um texto com o formato {{variavel}}.",
        variant: "danger",
      })
      return
    }

    if (variables.length === 0) {
      toast({
        title: "Nenhuma variavel encontrada",
        description: "Por favor insira ao menos 1 variavel no seu texto usando o formato {{variavel}}",
        variant: "warning",
      })
      return
    }

    // Checka se alguma variavel nao tem nenhum valor inserido
    const emptyVars = variables.filter((v) => !v.values.trim())
    if (emptyVars.length > 0) {
      toast({
        title: "Variaveis sem valores",
        description: `Por favor preencha os campos das variaveis: ${emptyVars.map((v) => v.name).join(", ")}`,
        variant: "warning",
      })
      return
    }

    const delimiter = valueDelimiter == "\\n" ? "\n" : valueDelimiter;
    
    // Separa os valores de cada variavel
    const parsedValues = variables.map((v) => ({
      name: v.name,
      valueList: v.values.split(delimiter).map((val) => val.trim()),
    }))

    // Checka se todas as variaveis tem a mesma quantidade de items
    const valueCounts = parsedValues.map((v) => v.valueList.length)
    const allSameCount = valueCounts.every((count) => count === valueCounts[0])

    if (!allSameCount) {
      toast({
        title: "Inconsistencia na quantidade de valores",
        description: "Todas as variaveis devem conter o mesmo tamanho.",
        variant: "danger",
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
    // Acha o maior numero de variaveis dentre a lista de variaveis
    const maxCount = Math.max(...parsedValues.map((v) => v.valueList.length))

    // Gera o texto de saida para cada quantidade de variavel
    const results: string[] = []

    for (let i = 0; i < maxCount; i++) {
      let result = template

      // Substitui cada valor no texto por sua variavel correspondente
      parsedValues.forEach((variable) => {
        const value =
          i < variable.valueList.length ? variable.valueList[i] : " "
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
      title: "Texto copiado",
      description: "O texto gerado foi copiado para a area de transferencia",
      variant: "sucess"
    })
  }

  const handleVariableValueChange = (index: number, values: string) => {
    const updatedVariables = [...variables]
    updatedVariables[index].values = values
    setVariables(updatedVariables)
  }

  const clearVariablesList = (index: number) => {
    const updatedVariables = [...variables]
    updatedVariables[index].values = ""
    setVariables(updatedVariables)
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
                <div className="flex items-end justify-between h-full mb-2">
                  <label htmlFor={`var-${varItem.name}`} className="block text-sm font-bold text-gray-700">
                    Variavel: <span className="font-normal">{varItem.name}</span>
                  </label>
                  <div className="flex justify-end -mt-4 space-x-2">
                    <Button onClick={() => clearVariablesList(index)}>
                      <RefreshCw className="w-4 h-4 mr-1" /> Limpar
                    </Button>
                  </div>
                </div>
                <Textarea
                  id={`var-${varItem.name}`}
                  placeholder={`Variavel1${valueDelimiter} Variavel2${valueDelimiter} Variavel3`}
                  value={varItem.values}
                  onChange={(e) => handleVariableValueChange(index, e.target.value)}
                  className="min-h-[80px] mb-8"
                />
              </div>
            ))}
          </div>

        </Card>
        
      )}
      
      <div className="flex justify-start mb-4 space-x-2">
        <Button onClick={generateOutput}>Gerar Template</Button>
      </div>

      {output.length > 0 && (
        <Card>
          <div className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Texto Gerado ({output.length} linhas)</h2>
              <Button onClick={copyToClipboard}>
                <ClipboardCopy className="w-4 h-4 mr-1" /> Copiar
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

