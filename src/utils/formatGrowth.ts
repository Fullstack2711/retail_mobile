/** "+100%", "-2.8%", "100%" */
export function parseGrowthPercent(growth: string): {
  display: string
  isPositive: boolean
} {
  const trimmed = growth?.trim() || '0%'
  const isPositive = !trimmed.startsWith('-')
  const display = trimmed.startsWith('+') || trimmed.startsWith('-')
    ? trimmed
    : `+${trimmed}`
  return { display, isPositive }
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}mln`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(value)
}
