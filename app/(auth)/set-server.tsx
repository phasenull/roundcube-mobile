import { useAuthStore } from "@/constants/auth-store"
import { useRouter } from "expo-router"
import React, { useCallback, useState } from "react"
import {
   Alert,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SetServerScreen() {
	const [serverUrl, setServerUrl] = useState("")
	const setServer = useAuthStore((state) => state.setServer)
	const server = useAuthStore((state) => state.server)
	const router = useRouter()

	const handleSetServer = useCallback(() => {
		if (!serverUrl.trim()) {
			Alert.alert("Error", "Please enter a server URL")
			return
		}

		// Add protocol if missing
		let formattedUrl = serverUrl.trim()
		if (
			!formattedUrl.startsWith("http://") &&
			!formattedUrl.startsWith("https://")
		) {
			formattedUrl = `https://${formattedUrl}`
		}

		try {
			new URL(formattedUrl) // Validate URL format
			setServer(formattedUrl)
			router.navigate("/login")
		} catch {
			Alert.alert("Error", "Please enter a valid URL")
		}
	}, [serverUrl, setServer, router])

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Set Server</Text>

				{server && (
					<View style={styles.currentServer}>
						<Text>Current: {server}</Text>
					</View>
				)}

				<TextInput
					style={styles.input}
					value={serverUrl}
					onChangeText={setServerUrl}
					placeholder="mail.example.com"
					autoCapitalize="none"
					autoCorrect={false}
					keyboardType="url"
					returnKeyType="done"
					onSubmitEditing={handleSetServer}
				/>

				<TouchableOpacity style={styles.button} onPress={handleSetServer}>
					<Text style={styles.buttonText}>Set Server</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	content: {
		flex: 1,
		padding: 20,
		justifyContent: "center"
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 30
	},
	currentServer: {
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		marginBottom: 20
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 15,
		fontSize: 16,
		backgroundColor: "#fff",
		marginBottom: 20
	},
	button: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		padding: 15,
		alignItems: "center"
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	}
})
