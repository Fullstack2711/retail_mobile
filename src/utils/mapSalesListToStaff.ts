import { Staff } from '../components/StaffItem'
import { BranchKey } from '../i18n/translations'
import { SalesListRaw } from '../types/storeOwner'

function resolveBranchKey(row: SalesListRaw): BranchKey {
  const name = String(row.branch_name ?? '').toLowerCase()
  if (name.includes('west') || name.includes('g‘arb') || name.includes('гарб')) return 'west'
  if (name.includes('east') || name.includes('sharq') || name.includes('вост')) return 'east'
  if (name.includes('downtown') || name.includes('shahar')) return 'downtown'
  if (name.includes('center') || name.includes('markaz') || name.includes('центр')) return 'center'
  return 'center'
}

export function staffFilterKey(row: SalesListRaw): string {
  if (row.branch_id != null) return `branch-${row.branch_id}`
  if (row.building_id != null) return `building-${row.building_id}`
  return 'unknown'
}

export function staffBranchLabel(row: SalesListRaw): string {
  if (row.branch_name?.trim()) return row.branch_name.trim()
  if (row.branch_id != null) return `Filial #${row.branch_id}`
  if (row.building_id != null) return `Bino #${row.building_id}`
  return '—'
}

export function mapSalesListToStaff(items: SalesListRaw[]): Staff[] {
  return items
    .map((row, index) => {
      const name = String(
        row.full_name ??
          row.seller_name ??
          row.employee_name ??
          row.name ??
          row.username ??
          `#${index + 1}`,
      )
      const purchased =
        (typeof row.purchased_surveys === 'number' ? row.purchased_surveys : 0) ||
        (typeof row.sales_count === 'number' ? row.sales_count : 0) ||
        (typeof row.sales === 'number' ? row.sales : 0)
      const totalSurveys =
        typeof row.total_surveys === 'number' ? row.total_surveys : undefined
      const id = String(row.user_id ?? row.seller_id ?? row.id ?? index)
      const imageUrl =
        typeof row.image === 'string' && row.image.length > 0 ? row.image : null

      return {
        id,
        name,
        branch: resolveBranchKey(row),
        branchLabel: staffBranchLabel(row),
        filterKey: staffFilterKey(row),
        sales: purchased,
        totalSurveys,
        imageUrl,
      }
    })
    .sort((a, b) => b.sales - a.sales)
}
