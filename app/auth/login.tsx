import { useAuthStore } from "@/constants/auth-store"
import { getLoginFields, mutateLogin } from "@/hooks/core/auth-hooks"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
	ActivityIndicator,
	Image,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
export default function LoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoggingIn, setIsLoggingIn] = useState(false)
   const {mutate} = mutateLogin()
	const  server  = useAuthStore((state) => state.server)
	const { data: fields, isLoading, isError, error,refetch } = getLoginFields()
	const router = useRouter()
   console.log("LoginPage render, server:", server, "fields:", fields)
	const handleLogin = async () => {
		setIsLoggingIn(true)

		try {
         if (!fields) throw new Error("Login fields not loaded")
         mutate({email, password, fields}, {
            onSuccess: (cookie) => {
               console.log("Login successful, cookie:", cookie)
            }
         })
		} catch (error) {
			console.error("Login error:", error)
		} finally {
			setIsLoggingIn(false)
		}
	}

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>Loading login form...</Text>
				</View>
			</SafeAreaView>
		)
	}

	if (isError) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorTitle}>Connection Error</Text>
					<Text style={styles.errorText}>
						{error?.message || "Unable to connect to server"}
					</Text>
					<Text style={styles.serverText}>Server: {server}</Text>
					
					<View style={styles.errorButtonContainer}>
						<TouchableOpacity 
							style={styles.reloadButton}
							onPress={() => refetch()}
						>
							<Text style={styles.reloadIcon}>🔄</Text>
							<Text style={styles.reloadButtonText}>Retry Connection</Text>
						</TouchableOpacity>
						
						<TouchableOpacity 
							style={styles.changeServerButton}
							onPress={() => router.push('/auth/set-server')}
						>
							<Text style={styles.changeServerButtonText}>Change Server</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardView}
			>
				<ScrollView
               refreshControl={
                  // Pull to refresh to reload login fields
                  <RefreshControl
                     refreshing={isLoading}
                     onRefresh={() => refetch()}
                  />
               }
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.content}>
						{/* Logo Section */}
						<View style={styles.logoContainer}>
							{fields?.logoUrl ? (
								<Image
									src={fields.logoUrl.startsWith("http") ? fields.logoUrl.replace("http", "https") : `https://${server}/${fields.logoUrl}`}
									style={styles.logo}
                           className="bg-red-400 h-50"
									resizeMode="contain"
								/>
							) : (
								<View style={styles.logoPlaceholder}>
									<Text style={styles.logoText}>📧</Text>
									<Text style={styles.logoTitle}>Roundcube</Text>
								</View>
							)}
						</View>

						{/* Server Info */}
						<View style={styles.serverContainer}>
							<View style={styles.serverInfo}>
								<View>
									<Text style={styles.serverLabel}>Connected to:</Text>
									<Text style={styles.serverValue}>{server}</Text>
								</View>
								<TouchableOpacity 
									style={styles.editButton}
									onPress={() => router.push('/auth/set-server')}
								>
									<Text style={styles.editIcon}>✏️</Text>
								</TouchableOpacity>
							</View>
						</View>

						{/* Login Form */}
						<View style={styles.formContainer}>
							<Text style={styles.formTitle}>Sign In</Text>

							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>Email</Text>
								<TextInput
									style={styles.input}
									value={email}
									onChangeText={setEmail}
									placeholder="Enter your email"
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									autoComplete="email"
									returnKeyType="next"
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.inputLabel}>Password</Text>
								<TextInput
									style={styles.input}
									value={password}
									onChangeText={setPassword}
									placeholder="Enter your password"
									secureTextEntry
									autoComplete="password"
									returnKeyType="done"
									onSubmitEditing={handleLogin}
								/>
							</View>

							<TouchableOpacity
								style={[
									styles.loginButton,
									(!email || !password || isLoggingIn) &&
										styles.loginButtonDisabled
								]}
								onPress={handleLogin}
								disabled={!email || !password || isLoggingIn}
							>
								{isLoggingIn ? (
									<ActivityIndicator color="#fff" size="small" />
								) : (
									<Text style={styles.loginButtonText}>Sign In</Text>
								)}
							</TouchableOpacity>
						</View>

						{/* Debug Info (Development only) */}
						{__DEV__ && fields && (
							<View style={styles.debugContainer}>
								<Text style={styles.debugTitle}>Debug Info:</Text>
								<Text style={styles.debugText}>
									{JSON.stringify(fields, null, 2)}
								</Text>
							</View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa"
	},
	keyboardView: {
		flex: 1
	},
	scrollContent: {
		flexGrow: 1
	},
	content: {
		flex: 1,
		padding: 20
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666"
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	errorTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#d32f2f",
		marginBottom: 8
	},
	errorText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 16
	},
	serverText: {
		fontSize: 14,
		color: "#999",
		fontFamily: "monospace",
		marginBottom: 24
	},
	errorButtonContainer: {
		width: "100%",
		gap: 12
	},
	reloadButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 8
	},
	reloadIcon: {
		fontSize: 18
	},
	reloadButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600"
	},
	changeServerButton: {
		backgroundColor: "transparent",
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#007AFF"
	},
	changeServerButtonText: {
		color: "#007AFF",
		fontSize: 16,
		fontWeight: "600"
	},
	logoContainer: {
		alignItems: "center",
		marginTop: 40,
		marginBottom: 30
	},
	logo: {
		width: 120,
		height: 120
	},
	logoPlaceholder: {
		alignItems: "center"
	},
	logoText: {
		fontSize: 64,
		marginBottom: 8
	},
	logoTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333"
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
	},
	editButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: "rgba(25, 118, 210, 0.1)"
	},
	editIcon: {
		fontSize: 16
	},
	formContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4
	},
	formTitle: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 24,
		color: "#333"
	},
	inputContainer: {
		marginBottom: 20
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		color: "#333"
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#fafafa"
	},
	loginButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		marginTop: 8
	},
	loginButtonDisabled: {
		backgroundColor: "#ccc"
	},
	loginButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600"
	},
	debugContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: "#f5f5f5",
		borderRadius: 8
	},
	debugTitle: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 8
	},
	debugText: {
		fontSize: 12,
		fontFamily: "monospace",
		color: "#666"
	}
})
