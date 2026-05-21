import { Platform } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '../components/icons'

let loaded = false

export async function loadIconFonts(): Promise<void> {
  if (loaded) return
  if (Platform.OS === 'ios') {
    await Promise.allSettled([
      Ionicons.loadFont(),
      MaterialCommunityIcons.loadFont(),
    ])
  }
  loaded = true
}
