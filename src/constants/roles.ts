export const ROLES = {
  STORE_OWNER: 'store_owner',
  SELLER: 'seller',
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const ALLOWED_ROLES: AppRole[] = [ROLES.STORE_OWNER, ROLES.SELLER]

export function isAllowedRole(roleName: string | undefined | null): roleName is AppRole {
  return !!roleName && (ALLOWED_ROLES as string[]).includes(roleName)
}

export function isStoreOwner(roleName: string | undefined | null): boolean {
  return roleName === ROLES.STORE_OWNER
}

export function isSeller(roleName: string | undefined | null): boolean {
  return roleName === ROLES.SELLER
}
