import { cn } from "../lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Card({className, ...props}: any) {
  return (
    <div {...props} className={cn("rounded-lg border border-gray-300 shadow-sm p-2 px-3", className)} /> 
  )
}

export { Card }

