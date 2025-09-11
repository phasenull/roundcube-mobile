import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { MessageRow } from "@/constants/utils"
import { useGetMessagePreview } from "@/hooks/core/email-hooks"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import React from "react"
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native"

export default function EmailDetailScreen() {
	const router = useRouter()
	const { id, email_json, type } = useLocalSearchParams<{
		id: string
		type: "inbox" | "sent" | "drafts"
		email_json: string
	}>()
	const email = JSON.parse(decodeURIComponent(email_json)) as MessageRow
	const { user } = useAuthStore()

	// Get message preview using the hook
	const {
		data: messageBody,
		isLoading,
		isError,
		error
	} = useGetMessagePreview(id ? parseInt(id) : 0, type as any)
	const { attachments, content } = messageBody || {}
	// Get inbox data to find email details

	// Find the email in the inbox data

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString([], {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			})
		} catch {
			return dateString
		}
	}

	if (isLoading) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<ThemedView style={styles.centered}>
					<ActivityIndicator size="large" color={Colors.tint} />
					<ThemedText style={styles.loadingText}>Loading email...</ThemedText>
				</ThemedView>
			</>
		)
	}

	if (isError) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<ThemedView style={styles.centered}>
					<IconSymbol
						name="exclamationmark.triangle"
						size={60}
						color={Colors.tabIconDefault}
					/>
					<ThemedText style={styles.errorText}>
						{error?.message || "Failed to load email"}
					</ThemedText>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<ThemedText style={styles.backButtonText}>Go Back</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</>
		)
	}

	if (!email) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<ThemedView style={styles.centered}>
					<IconSymbol
						name="exclamationmark.triangle"
						size={60}
						color={Colors.tabIconDefault}
					/>
					<ThemedText style={styles.errorText}>Email not found</ThemedText>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<ThemedText style={styles.backButtonText}>Go Back</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</>
		)
	}

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />
			<ScrollView
				style={styles.content}
				contentContainerStyle={{ paddingBottom: 4 * 10 }}
				showsVerticalScrollIndicator={false}
			>
				<Text
					style={[styles.subject, { color: Colors.text, userSelect: "text" }]}
				>
					{type} {">"} {email.subject || "No Subject"}
				</Text>

				{/* Email Meta Info */}
				<View style={[styles.metaContainer, { userSelect: "text" }]}>
					<View style={styles.metaRow}>
						<Text
							style={[
								styles.metaLabel,
								{ color: Colors.tabIconDefault, userSelect: "text" }
							]}
						>
							From:
						</Text>
						<Text
							style={[
								styles.metaValue,
								{ color: Colors.text, userSelect: "text" }
							]}
						>
							{type === "inbox"
								? email.fromto || "Unknown Sender"
								: user?.username}
						</Text>
					</View>

					<View style={styles.metaRow}>
						<Text
							style={[
								styles.metaLabel,
								{ color: Colors.tabIconDefault, userSelect: "text" }
							]}
						>
							To:
						</Text>
						<Text
							style={[
								styles.metaValue,
								{ color: Colors.text, userSelect: "text" }
							]}
						>
							{type === "inbox"
								? user?.username || "Unknown Sender"
								: email.fromto}
						</Text>
					</View>

					<View style={styles.metaRow}>
						<Text style={[styles.metaLabel, { color: Colors.tabIconDefault }]}>
							Date:
						</Text>
						<Text style={[styles.metaValue, { color: Colors.text }]}>
							{email.date}
						</Text>
					</View>

					{email.size && (
						<View style={styles.metaRow}>
							<Text
								style={[styles.metaLabel, { color: Colors.tabIconDefault }]}
							>
								Size:
							</Text>
							<Text style={[styles.metaValue, { color: Colors.text }]}>
								{email.size}
							</Text>
						</View>
					)}
				</View>

				{/* Divider */}
				<View
					style={[styles.divider, { backgroundColor: Colors.tabIconDefault }]}
				/>

				{/* Email Body */}
				<View style={styles.bodyContainer}>
					{content ? (
						<Text style={[styles.body, { userSelect: "text" }]}>
							{content}
						</Text>
					) : (
						<View style={styles.noContentContainer}>
							<IconSymbol
								name="doc.text"
								size={40}
								color={Colors.tabIconDefault}
							/>
							<ThemedText style={styles.noContentText}>
								No content available
							</ThemedText>
						</View>
					)}
				</View>
			</ScrollView>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 50
	},
	floatingBackBtn: {
		position: "absolute",
		top: 10,
		left: 20,
		zIndex: 1,
		backgroundColor: Colors.background,
		borderRadius: 20,
		padding: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3
	},
	subject: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		lineHeight: 32
	},
	metaContainer: {
		marginBottom: 20
	},
	metaRow: {
		flexDirection: "row",
		marginBottom: 8,
		alignItems: "flex-start"
	},
	metaLabel: {
		fontSize: 14,
		fontWeight: "600",
		minWidth: 60,
		marginRight: 12
	},
	metaValue: {
		fontSize: 14,
		flex: 1
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: 20
	},
	bodyContainer: {
		paddingBottom: 40
	},
	body: {
		fontSize: 16,
		lineHeight: 24
	},
	noContentContainer: {
		alignItems: "center",
		paddingVertical: 40
	},
	noContentText: {
		marginTop: 12,
		fontSize: 16,
		opacity: 0.7
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16
	},
	errorText: {
		marginTop: 16,
		fontSize: 16,
		textAlign: "center"
	},
	backButton: {
		marginTop: 20,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		backgroundColor: "#007AFF"
	},
	backButtonText: {
		color: "white",
		fontWeight: "600"
	}
})
