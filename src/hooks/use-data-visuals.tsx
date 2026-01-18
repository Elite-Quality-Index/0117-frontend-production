import { createContext, useContext, useState, type ReactNode } from "react"

interface DataVisualsContextType {
  selectedCountries: string[]
  setSelectedCountries: (countries: string[]) => void
}

const DataVisualsContext = createContext<DataVisualsContextType | null>(null)

export function DataVisualsProvider({ children }: { children: ReactNode }) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  return (
    <DataVisualsContext.Provider value={{ selectedCountries, setSelectedCountries }}>
      {children}
    </DataVisualsContext.Provider>
  )
}

export function useDataVisuals() {
  const context = useContext(DataVisualsContext)
  if (!context) {
    throw new Error("useDataVisuals must be used within a DataVisualsProvider")
  }
  return context
}
