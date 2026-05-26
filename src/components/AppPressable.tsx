import React from 'react'
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

type AppPressableProps = PressableProps & {
  /** Android ripple rangi */
  rippleColor?: string
  /** iOS: bosilganda opacity (1 = effekt yo‘q) */
  pressedOpacity?: number
}

function resolveStyle(
  style: PressableProps['style'],
  pressed: boolean,
  pressedOpacity: number,
  disabled: boolean | null | undefined,
): StyleProp<ViewStyle> {
  const base = typeof style === 'function' ? style({ pressed }) : style
  const list = Array.isArray(base) ? [...base] : base ? [base] : []
  if (pressed && !disabled && Platform.OS === 'ios') {
    list.push({ opacity: pressedOpacity })
  }
  return list
}

export default function AppPressable({
  style,
  rippleColor = 'rgba(0, 0, 0, 0.06)',
  pressedOpacity = 0.96,
  disabled,
  children,
  ...rest
}: AppPressableProps) {
  return (
    <Pressable
      disabled={disabled}
      android_ripple={
        disabled
          ? undefined
          : { color: rippleColor, foreground: true }
      }
      style={(state) =>
        resolveStyle(style, state.pressed, pressedOpacity, disabled)
      }
      {...rest}
    >
      {children}
    </Pressable>
  )
}
