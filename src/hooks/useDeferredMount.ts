import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

/** Tab o‘tish animatsiyasi tugagach og‘ir UI (chart va h.k.) mount qiladi. */
export function useDeferredMount(active = true) {
  const isFocused = useIsFocused()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isFocused || !active) {
      setReady(false)
      return
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true)
    })

    return () => task.cancel()
  }, [isFocused, active])

  return isFocused && ready
}
