declare module 'react-native-vector-icons/Ionicons' {
  import type { JSX } from 'react'
  import type { TextProps } from 'react-native'

  export interface IconProps extends TextProps {
    name: string
    size?: number
    color?: string
  }

  /** Callable component — React 19 JSX bilan mos */
  const Ionicons: {
    (props: IconProps): JSX.Element
    loadFont(): Promise<void>
  }

  export default Ionicons
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import type { JSX } from 'react'
  import type { TextProps } from 'react-native'

  export interface IconProps extends TextProps {
    name: string
    size?: number
    color?: string
  }

  const MaterialCommunityIcons: {
    (props: IconProps): JSX.Element
    loadFont(): Promise<void>
  }

  export default MaterialCommunityIcons
}
