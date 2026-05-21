export interface UserRole {
  name: string
  description: string
  hierarchy_level: number
  full_permission: boolean
}

export interface UserCompany {
  id: number
  name: string
  description: string | null
  type: string | null
  phone: string | null
  email: string | null
  logo: string | null
  owner_id: number | null
  is_active: boolean
}

export interface UserInfo {
  id: number
  username: string
  email: string
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  phone: string | null
  gender: string | null
  position: string | null
  image: string | null
  company_id: number | null
  role_id: number | null
  branch_id: number | null
  building_id: number | null
  is_active: boolean
  is_superuser: boolean
  role: UserRole | null
  company: UserCompany | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: number
  username: string
  user_info: UserInfo
}

export interface AuthSession {
  accessToken: string
  tokenType: string
  userId: number
  username: string
  roleName: string
  companyId: number | null
  branchId: number | null
  user: {
    id: number
    name: string
    phone: string
    email: string
    username: string
    image: string | null
    companyName: string | null
    roleName: string
  }
}
