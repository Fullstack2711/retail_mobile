import { apiRequest } from '../api/client'
import { UserInfo } from '../../types/auth'

export interface PatchSellerProfileBody {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
}

export function splitDisplayName(fullName: string): {
  first_name: string
  last_name: string | null
} {
  const trimmed = fullName.trim()
  const space = trimmed.indexOf(' ')
  if (space === -1) {
    return { first_name: trimmed, last_name: null }
  }
  return {
    first_name: trimmed.slice(0, space),
    last_name: trimmed.slice(space + 1).trim() || null,
  }
}

export function buildDisplayNameFromInfo(info: Pick<UserInfo, 'first_name' | 'last_name' | 'username'>): string {
  const parts = [info.first_name, info.last_name].filter(Boolean) as string[]
  if (parts.length > 0) return parts.join(' ')
  return info.username
}

export async function patchSellerProfile(
  userId: number,
  companyId: number,
  body: PatchSellerProfileBody,
): Promise<UserInfo> {
  const query = new URLSearchParams({ company_id: String(companyId) })
  return apiRequest<UserInfo>(`/mobile/user/sellers/${userId}?${query.toString()}`, {
    method: 'PATCH',
    body,
  })
}
