import { Image } from "expo-image"
import {
	RefreshControl,
	StyleSheet,
	Text,
	TouchableHighlight,
	TouchableOpacity,
	View
} from "react-native"

import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useAuthStore } from "@/constants/auth-store"
import { parseLogoUrl } from "@/constants/utils"
import { useGetInbox } from "@/hooks/core/email-hooks"
import { router } from "expo-router"

export default function HomeScreen() {
	const server = useAuthStore((state) => state.server)
	const user = useAuthStore((state) => state.user)
	const config = useAuthStore((state) => state.config)
	const { data, isLoading, isError, error, refetch } = useGetInbox()
	return (
		<ParallaxScrollView
			refreshControl={
				<RefreshControl refreshing={isLoading} onRefresh={refetch} />
			}
			// backgroundColor="#1D3D47"

			// headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={
						parseLogoUrl(config?.logo_url) ||
						require("@/assets/images/partial-react-logo.png")
					}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.stepContainer}>
				{/* Server Info */}
				<View style={styles.serverContainer}>
					<View style={styles.serverInfo}>
						<View>
							<Text style={styles.serverLabel}>Connected to:</Text>
							<Text style={styles.serverValue}>{server}</Text>
						</View>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => router.push("/auth/set-server")}
						>
							<Text style={styles.editIcon}>✏️</Text>
						</TouchableOpacity>
					</View>
				</View>
				<ThemedText type="subtitle">logged in as</ThemedText>
				<ThemedText>{user?.username}</ThemedText>
				<ThemedText type="default">
					{data?.quota?.title}
					{/* {JSON.stringify(data)} of {data?.quota?.total} used */}
				</ThemedText>
			</ThemedView>

			{/* logout button */}
			<TouchableHighlight
				style={styles.logoutButton}
				onPress={() => {
					useAuthStore.getState().setUser(null)
					useAuthStore.getState().clearAuth()
					useAuthStore.getState().setConfig(null)
				}}
			>
				<ThemedText style={{ fontWeight: "600" }}>Logout</ThemedText>
			</TouchableHighlight>
			{/* debug info of inbox data */}
			{__DEV__ && (
				<ThemedView style={{ marginTop: 20 }}>
					<ThemedText type="subtitle">Inbox Data (for debugging)</ThemedText>
					{isLoading && <ThemedText>Loading...</ThemedText>}
					{isError && <ThemedText>Error: {error?.message}</ThemedText>}
					{data && <ThemedText>{JSON.stringify(data, null, 2)}</ThemedText>}
				</ThemedView>
			)}
		</ParallaxScrollView>
	)
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8
	},
	logoutButton: {
		backgroundColor: "#ff3b30",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20
	},
	editButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: "rgba(25, 118, 210, 0.1)"
	},
	editIcon: {
		fontSize: 16
	},
	reactLogo: {
		width: 240,
		height: 240,
		resizeMode: "contain",
		// backgroundColor: "#fff000",
		alignSelf: "center",
		position: "absolute"
	},
	serverContainer: {
		backgroundColor: "#e3f2fd",
		padding: 12,
		borderRadius: 8,
		marginBottom: 30
	},
	serverInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	serverLabel: {
		fontSize: 12,
		color: "#666",
		marginBottom: 2
	},
	serverValue: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1976d2",
		fontFamily: "monospace"
	}
})
