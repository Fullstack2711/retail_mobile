import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react'
import { DARK_COLORS, LIGHT_COLORS } from '../constants/colors'

export type Theme = 'light' | 'dark'
export type AppColors = typeof LIGHT_COLORS

interface ThemeContextValue {
  theme: Theme
  colors: AppColors
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: LIGHT_COLORS,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const colors = useMemo(
    () => (theme === 'light' ? LIGHT_COLORS : DARK_COLORS),
    [theme],
  )
  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const value = useMemo(
    () => ({ theme, colors, setTheme }),
    [theme, colors, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
