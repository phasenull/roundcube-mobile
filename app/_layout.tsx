import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
const queryClient = new QueryClient({defaultOptions:{queries:{retry:1}}})
export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
	})
	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				{/* <Stack>
				<Stack.Screen name="(auth)/" options={{ headerShown: false }} />
        </Stack> */}
				<StatusBar style="auto" />
			</ThemeProvider>
		</QueryClientProvider>
	)
}
