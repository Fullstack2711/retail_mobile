import React, { useEffect, useMemo, useState } from 'react'
import { View, Image, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from './icons'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

interface ProfileAvatarProps {
  imageUrl: string | null | undefined
  size?: number
  iconColor: string
  backgroundColor: string
  borderColor: string
  style?: ViewStyle
}

export default function ProfileAvatar({
  imageUrl,
  size = 96,
  iconColor,
  backgroundColor,
  borderColor,
  style,
}: ProfileAvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false)
  const uri = useMemo(() => resolveMediaUrl(imageUrl), [imageUrl])
  const radius = size / 2
  const showImage = Boolean(uri) && !loadFailed

  useEffect(() => {
    setLoadFailed(false)
  }, [uri])

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri! }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          resizeMode="cover"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <Ionicons name="person" size={size * 0.42} color={iconColor} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {},
})
