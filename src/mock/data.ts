import { Staff } from '../components/StaffItem'
import { BranchKey } from '../i18n/translations'

export const LANGUAGES = [
  { code: 'uz' as const, label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
]

export const BRANCH_FILTERS: { key: BranchKey | 'all'; branch?: BranchKey }[] = [
  { key: 'all' },
  { key: 'center', branch: 'center' },
  { key: 'west', branch: 'west' },
  { key: 'east', branch: 'east' },
  { key: 'downtown', branch: 'downtown' },
]
export const visitorsData = [
    { value: 220, label: '09:00' },
    { value: 218, label: '11:00' },
    { value: 230, label: '13:00' },
    { value: 255, label: '15:00' },
    { value: 148, label: '17:00' },
    { value: 148, label: '19:00' },
  ]
  export const buyersData = [
    { value: 130 },
    { value: 118 },
    { value: 128 },
    { value: 150 },
    { value: 104 },
    { value: 104 },
  ]

export const ALL_STAFF: Staff[] = [
  { id: '1', name: 'Elena Petrova', branch: 'center', branchLabel: 'Markaz', filterKey: 'branch-1', sales: 142, imageUrl: null },
  { id: '2', name: 'Alexander Volkov', branch: 'west', branchLabel: 'G‘arb', filterKey: 'branch-2', sales: 138, imageUrl: null },
  { id: '3', name: 'Maria Sidorova', branch: 'east', branchLabel: 'Sharq', filterKey: 'branch-3', sales: 127, imageUrl: null },
  { id: '4', name: 'Dmitry Ivanov', branch: 'downtown', branchLabel: 'Shahar', filterKey: 'branch-4', sales: 115, imageUrl: null },
  { id: '5', name: 'Elena Petrova', branch: 'downtown', branchLabel: 'Shahar', filterKey: 'branch-4', sales: 109, imageUrl: null },
  { id: '6', name: 'Sergey Morozov', branch: 'center', branchLabel: 'Markaz', filterKey: 'branch-1', sales: 98, imageUrl: null },
  { id: '7', name: 'Anna Kozlova', branch: 'west', branchLabel: 'G‘arb', filterKey: 'branch-2', sales: 87, imageUrl: null },
]
