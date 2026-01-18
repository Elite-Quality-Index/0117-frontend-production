import XLSX from "xlsx"
import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

const INPUT_FILE = "data/EQx_2021_2025.xlsx"
const OUTPUT_DIR = "public/data"

// Read xlsx
const workbook = XLSX.readFile(INPUT_FILE)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json<{
  "2021": number
  "2022": number
  "2023": number
  "2024": number
  "2025": number
  country: string
  country_name: string
  index_level: string
  index_element_name: string
}>(sheet)

// Filter for index_level = EQx only
const eqxRows = rows.filter((row) => row.index_level === "EQx")

console.log(`Total rows: ${rows.length}`)
console.log(`EQx rows: ${eqxRows.length}`)

// Full data keyed by country code for O(1) lookup
const members: Record<
  string,
  {
    country: string
    country_name: string
    rankings: { year: string; rank: number }[]
  }
> = {}

eqxRows.forEach((row) => {
  members[row.country] = {
    country: row.country,
    country_name: row.country_name,
    rankings: [
      { year: "2021", rank: row["2021"] },
      { year: "2022", rank: row["2022"] },
      { year: "2023", rank: row["2023"] },
      { year: "2024", rank: row["2024"] },
      { year: "2025", rank: row["2025"] },
    ],
  }
})

// Slim index for search/combobox UI
const index = eqxRows.map((row) => ({
  id: row.country,
  name: row.country_name,
  rank2025: row["2025"],
})).sort((a, b) => a.rank2025 - b.rank2025)

// Chart-ready format: array of { year, [country]: rank }
// This is easier for Recharts line charts
const years = ["2021", "2022", "2023", "2024", "2025"]
const chartData = years.map((year) => {
  const entry: Record<string, string | number> = { year }
  eqxRows.forEach((row) => {
    entry[row.country] = row[year as keyof typeof row] as number
  })
  return entry
})

// Write output files
mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(join(OUTPUT_DIR, "members.json"), JSON.stringify(members, null, 2))
writeFileSync(join(OUTPUT_DIR, "index.json"), JSON.stringify(index, null, 2))
writeFileSync(join(OUTPUT_DIR, "chart-data.json"), JSON.stringify(chartData, null, 2))

console.log(`\nGenerated:`)
console.log(`  - ${OUTPUT_DIR}/members.json (${Object.keys(members).length} countries)`)
console.log(`  - ${OUTPUT_DIR}/index.json (for search UI)`)
console.log(`  - ${OUTPUT_DIR}/chart-data.json (Recharts ready)`)
