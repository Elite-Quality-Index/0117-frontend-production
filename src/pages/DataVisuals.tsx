import { useState, useEffect, useMemo } from "react"
import { X } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDataVisuals } from "@/hooks/use-data-visuals"

interface CountryIndex {
  id: string
  name: string
  rank2025: number
}

interface CountryMember {
  country: string
  country_name: string
  rankings: { year: string; rank: number }[]
}

const CHART_COLORS = [
  "hsl(217 91% 60%)",  // blue
  "hsl(25 95% 53%)",   // orange
  "hsl(142 71% 45%)",  // green
  "hsl(0 84% 60%)",    // red
  "hsl(262 83% 58%)",  // purple
  "hsl(45 93% 47%)",   // yellow (golden)
]

export function DataVisuals() {
  const [index, setIndex] = useState<CountryIndex[]>([])
  const [members, setMembers] = useState<Record<string, CountryMember>>({})
  const { selectedCountries, setSelectedCountries } = useDataVisuals()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    fetch("/data/index.json")
      .then((r) => r.json())
      .then(setIndex)
    fetch("/data/members.json")
      .then((r) => r.json())
      .then(setMembers)
  }, [])

  // Filter countries based on search query (show all unselected, scrollable)
  const filteredCountries = useMemo(() => {
    const unselected = index.filter((c) => !selectedCountries.includes(c.id))
    if (!searchQuery.trim()) return unselected
    const query = searchQuery.toLowerCase()
    return unselected.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
    )
  }, [index, searchQuery, selectedCountries])

  // Build chart data from selected countries
  const chartData = useMemo(() => {
    if (selectedCountries.length === 0) return []
    const years = ["2021", "2022", "2023", "2024", "2025"]
    return years.map((year) => {
      const entry: Record<string, string | number> = { year }
      selectedCountries.forEach((countryId) => {
        const member = members[countryId]
        if (member) {
          const ranking = member.rankings.find((r) => r.year === year)
          if (ranking) {
            entry[countryId] = ranking.rank
          }
        }
      })
      return entry
    })
  }, [selectedCountries, members])

  // Build chart config for colors and labels (use 3-letter country code)
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    selectedCountries.forEach((countryId, idx) => {
      config[countryId] = {
        label: countryId,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }
    })
    return config
  }, [selectedCountries])

  const handleSelectCountry = (countryId: string) => {
    if (selectedCountries.length < 6 && !selectedCountries.includes(countryId)) {
      setSelectedCountries([...selectedCountries, countryId])
      setSearchQuery("")
      setIsDropdownOpen(false)
    }
  }

  const handleRemoveCountry = (countryId: string) => {
    setSelectedCountries(selectedCountries.filter((id) => id !== countryId))
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 mx-auto max-w-4xl w-full">
      <div>
        <h1 className="font-title text-3xl">Data Visuals</h1>
        <p className="text-muted-foreground">
          Compare country rankings from 2021-2025. Select up to 6 countries.
        </p>
      </div>

      {/* Search and selection area */}
      <div className="space-y-4">
        {/* Search input with dropdown */}
        <div className="relative max-w-md">
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsDropdownOpen(true)
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => {
              // Delay to allow click on dropdown item
              setTimeout(() => setIsDropdownOpen(false), 150)
            }}
            disabled={selectedCountries.length >= 6}
          />
          {isDropdownOpen && filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
              {filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onMouseDown={() => handleSelectCountry(country.id)}
                  >
                    <span>{country.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {country.id} · Rank #{country.rank2025}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Selected country cards */}
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((countryId, idx) => {
              const member = members[countryId]
              return (
                <div
                  key={countryId}
                  className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {member?.country_name || countryId}
                    </span>
                    <span className="text-xs text-muted-foreground">{countryId}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCountry(countryId)}
                    className="ml-2 rounded p-0.5 hover:bg-muted"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chart */}
      <Card className={cn(selectedCountries.length === 0 && "opacity-50")}>
        <CardHeader>
          <CardTitle>EQx Rankings Over Time</CardTitle>
          <CardDescription>
            {selectedCountries.length === 0
              ? "Select countries to view their ranking trends"
              : `Comparing ${selectedCountries.length} ${selectedCountries.length === 1 ? "country" : "countries"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCountries.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  reversed
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[1, "dataMax + 5"]}
                  label={{ value: "Rank", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <ChartLegend
                  content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-2" />}
                />
                {selectedCountries.map((countryId, idx) => (
                  <Line
                    key={countryId}
                    type="linear"
                    dataKey={countryId}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              Select countries above to view the chart
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
