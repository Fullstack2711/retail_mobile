import { ApiError, parseApiError } from '../src/services/api/errors'

describe('ApiError', () => {
  it('stores status code', () => {
    const err = new ApiError('Test', 401)
    expect(err.status).toBe(401)
    expect(err.message).toBe('Test')
  })
})

describe('parseApiError', () => {
  it('reads detail string from JSON body', async () => {
    const response = {
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Invalid token' }),
    } as Response

    await expect(parseApiError(response)).resolves.toBe('Invalid token')
  })

  it('returns login message for 401 in login context', async () => {
    const response = {
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response

    await expect(parseApiError(response, 'login')).resolves.toBe(
      'Login yoki parol noto‘g‘ri',
    )
  })

  it('falls back to status when body is not JSON', async () => {
    const response = {
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json')
      },
    } as unknown as Response

    await expect(parseApiError(response)).resolves.toBe('Server xatosi (500)')
  })
})
