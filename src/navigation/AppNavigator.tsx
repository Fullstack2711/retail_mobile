import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { isSeller } from '../constants/roles'
import AuthNavigator from './AuthNavigator'
import TabNavigator from './TabNavigator'
import SellerNavigator from './SellerNavigator'

export default function AppNavigator() {
  const { isLoggedIn, roleName } = useAuth()

  const MainNavigator = isSeller(roleName) ? SellerNavigator : TabNavigator

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}