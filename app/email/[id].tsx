import {
	AttachmentPreviewModal,
	AttachmentsList,
	EmailBody,
	EmailHeader
} from "@/components/email-detail"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { AttachmentInfo, MessageRow } from "@/constants/utils"
import { useGetMessagePreview } from "@/hooks/core/email-hooks"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import React, { useState } from "react"
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	TouchableOpacity
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
	const [previewAttachment, setPreviewAttachment] = useState<AttachmentInfo | null>(null)

	// Get message preview using the hook
	const {
		data: messageBody,
		isLoading,
		isError,
		error
	} = useGetMessagePreview(id ? parseInt(id) : 0, type as any)
	const { attachments, content } = messageBody || {}

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
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				<EmailHeader 
					email={email} 
					type={type as any} 
					userEmail={user?.username} 
				/>
				
				<EmailBody content={content!} />
				
				<AttachmentsList 
					attachments={attachments || []} 
					onPreview={setPreviewAttachment} 
				/>
			</ScrollView>

			<AttachmentPreviewModal
				attachment={previewAttachment}
				visible={previewAttachment !== null}
				onClose={() => setPreviewAttachment(null)}
			/>
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