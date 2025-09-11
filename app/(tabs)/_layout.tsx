import { Redirect, Tabs } from "expo-router"
import React from "react"
import { Platform } from "react-native"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"

export default function TabLayout() {
	const server = useAuthStore((state) => state.server)
	const user = useAuthStore((state) => state.user)
	const config = useAuthStore((state) => state.config)
	if (!server) return <Redirect href={"/auth/set-server"} />
	if (!user) return <Redirect href={"/auth/login"} />
	return (
		<Tabs
			
			screenOptions={{
				tabBarActiveTintColor: Colors.tint,
				headerShown: true,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute"
					},
					default: {}
				})
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerTitle: config?.title || "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					)
				}}
			/>
			<Tabs.Screen
				name="emails"
				options={{
					title: "E-Mails",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="paperplane.fill" color={color} />
					)
				}}
			/>
		</Tabs>
	)
}
