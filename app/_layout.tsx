import { tryToFixSSLErrors } from "@/hooks/core/dev-utils"
import {
	DefaultTheme,
	ThemeProvider
} from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as Updates from "expo-updates"
import { useEffect } from "react"
import { Button, Text, View } from "react-native"
import "react-native-reanimated"
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: 1 } }
})
export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
	})

	const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
		Updates.useUpdates()

	useEffect(() => {
		if (isUpdatePending) {
			// Update has successfully downloaded; apply it now
			Updates.reloadAsync()
		}
	}, [isUpdatePending])
	const showDownloadButton = isUpdateAvailable
	const runTypeMessage = currentlyRunning.isEmbeddedLaunch
		? "This app is running from built-in code"
		: "This app is running an update"
	useEffect(() => {
		tryToFixSSLErrors()
	}, [])
	if (!loaded) {
		// Async font loading only occurs in development.
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		)
	}
	if (showDownloadButton) {
		return (
			<View>
				<Text>Updates Demo</Text>
				<Text>{runTypeMessage}</Text>
				<Button
					onPress={() => Updates.checkForUpdateAsync()}
					title="Check manually for updates"
				/>
				{showDownloadButton ? (
					<Button
						onPress={() => Updates.fetchUpdateAsync()}
						title="Download and run update"
					/>
				) : null}
				<StatusBar style="auto" />
			</View>
		)
	}
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={DefaultTheme}>
				<Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
					<Stack.Screen
						name="tabs"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="+not-found"
						options={{ headerShown: false }}
					/>

				</Stack>
				{/* <Stack>
				<Stack.Screen name="(auth)/" options={{ headerShown: false }} />
        </Stack> */}
				<StatusBar style="auto" />
			</ThemeProvider>
		</QueryClientProvider>
	)
}
