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
	Alert,
	Dimensions,
	Image,
	Linking,
	Modal,
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
	const [previewAttachment, setPreviewAttachment] = useState<AttachmentInfo | null>(null)

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

	const getFileIcon = (fileName: string, type: string) => {
		const extension = fileName.split('.').pop()?.toLowerCase() || ''
		const mimeType = type.toLowerCase()

		if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
			return 'photo'
		} else if (mimeType.includes('pdf') || extension === 'pdf') {
			return 'doc.text'
		} else if (mimeType.includes('text') || ['txt', 'rtf'].includes(extension)) {
			return 'doc.plaintext'
		} else if (['doc', 'docx'].includes(extension)) {
			return 'doc.richtext'
		} else if (['xls', 'xlsx'].includes(extension)) {
			return 'tablecells'
		} else if (['ppt', 'pptx'].includes(extension)) {
			return 'play.rectangle'
		} else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
			return 'archivebox'
		} else if (mimeType.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
			return 'video'
		} else if (mimeType.includes('audio') || ['mp3', 'wav', 'flac', 'aac'].includes(extension)) {
			return 'music.note'
		} else {
			return 'doc'
		}
	}

	const canPreviewFile = (fileName: string, type: string) => {
		const extension = fileName.split('.').pop()?.toLowerCase() || ''
		const mimeType = type.toLowerCase()
		
		return mimeType.includes('image') || 
			   ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) ||
			   mimeType.includes('pdf') || 
			   extension === 'pdf'
	}

	const handleAttachmentPreview = (attachment: AttachmentInfo) => {
		if (canPreviewFile(attachment.name, attachment.type)) {
			setPreviewAttachment(attachment)
		} else {
			Alert.alert(
				"Preview Not Available", 
				"This file type cannot be previewed. Would you like to download it instead?",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Download", onPress: () => handleAttachmentDownload(attachment) }
				]
			)
		}
	}

	const handleAttachmentDownload = async (attachment: AttachmentInfo) => {
		try {
			const { user } = useAuthStore.getState()
			const server = useAuthStore.getState().server
			if (!server) throw new Error("Server not configured")
			
			const downloadUrl = `https://${server}${attachment.url}`
			
			// On mobile, we'll open the URL in browser for download
			const canOpen = await Linking.canOpenURL(downloadUrl)
			if (canOpen) {
				await Linking.openURL(downloadUrl)
			} else {
				Alert.alert("Error", "Cannot open download link")
			}
		} catch (error) {
			console.error("Download error:", error)
			Alert.alert("Download Error", "Failed to download attachment")
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

				{/* Attachments Section */}
				{attachments && attachments.length > 0 && (
					<>
						{/* Divider */}
						<View
							style={[styles.divider, { backgroundColor: Colors.tabIconDefault }]}
						/>
						
						<View style={styles.attachmentsContainer}>
							<Text style={[styles.attachmentsTitle, { color: Colors.text }]}>
								Attachments ({attachments.length})
							</Text>
							
							{attachments.map((attachment, index) => (
								<View key={`${attachment.id}-${index}`} style={[styles.attachmentItem, { borderColor: Colors.tabIconDefault + '30' }]}>
									<View style={styles.attachmentInfo}>
										<IconSymbol
											name={getFileIcon(attachment.name, attachment.type)}
											size={24}
											color={Colors.tint}
											style={styles.attachmentIcon}
										/>
										<View style={styles.attachmentDetails}>
											<Text style={[styles.attachmentName, { color: Colors.text }]} numberOfLines={1}>
												{attachment.name}
											</Text>
											<Text style={[styles.attachmentSize, { color: Colors.tabIconDefault }]}>
												{attachment.size}
											</Text>
										</View>
									</View>
									
									<View style={styles.attachmentActions}>
										{canPreviewFile(attachment.name, attachment.type) && (
											<TouchableOpacity
												style={[styles.previewButton, { backgroundColor: Colors.tint + '20' }]}
												onPress={() => handleAttachmentPreview(attachment)}
											>
												<IconSymbol
													name="eye"
													size={16}
													color={Colors.tint}
												/>
											</TouchableOpacity>
										)}
										
										<TouchableOpacity
											style={[styles.downloadButton, { backgroundColor: Colors.tint }]}
											onPress={() => handleAttachmentDownload(attachment)}
										>
											<IconSymbol
												name="tray.and.arrow.down"
												size={16}
												color="white"
											/>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>
					</>
				)}
			</ScrollView>

			{/* Preview Modal */}
			<Modal
				visible={previewAttachment !== null}
				animationType="fade"
				presentationStyle="overFullScreen"
				onRequestClose={() => setPreviewAttachment(null)}
			>
				<View style={styles.previewModalOverlay}>
					<View style={styles.previewModalContainer}>
						{/* Modal Header */}
						<View style={[styles.previewHeader, { backgroundColor: Colors.background }]}>
							<Text style={[styles.previewTitle, { color: Colors.text }]} numberOfLines={1}>
								{previewAttachment?.name}
							</Text>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => setPreviewAttachment(null)}
							>
								<IconSymbol name="xmark" size={24} color={Colors.text} />
							</TouchableOpacity>
						</View>

						{/* Preview Content */}
						<View style={styles.previewContent}>
							{previewAttachment && (
								<>
									{canPreviewFile(previewAttachment.name, previewAttachment.type) && 
									 previewAttachment.type.includes('image') ? (
										<Image
											source={{ uri: `https://${useAuthStore.getState().server}${previewAttachment.url}` }}
											style={styles.previewImage}
											resizeMode="contain"
										/>
									) : (
										<View style={styles.noPreviewContainer}>
											<IconSymbol
												name={getFileIcon(previewAttachment.name, previewAttachment.type)}
												size={80}
												color={Colors.tabIconDefault}
											/>
											<Text style={[styles.noPreviewText, { color: Colors.text }]}>
												{previewAttachment.name}
											</Text>
											<Text style={[styles.noPreviewSubtext, { color: Colors.tabIconDefault }]}>
												{previewAttachment.size}
											</Text>
											<TouchableOpacity
												style={[styles.downloadButton, { backgroundColor: Colors.tint, marginTop: 20 }]}
												onPress={() => {
													handleAttachmentDownload(previewAttachment)
													setPreviewAttachment(null)
												}}
											>
												<IconSymbol
													name="arrow.down.circle"
													size={20}
													color="white"
													style={{ marginRight: 8 }}
												/>
												<Text style={styles.downloadButtonText}>Download</Text>
											</TouchableOpacity>
										</View>
									)}
								</>
							)}
						</View>
					</View>
				</View>
			</Modal>
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
	},
	// Attachments styles
	attachmentsContainer: {
		paddingBottom: 20
	},
	attachmentsTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16
	},
	attachmentItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		borderWidth: 1,
		borderRadius: 8,
		marginBottom: 8
	},
	attachmentInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1
	},
	attachmentIcon: {
		marginRight: 12
	},
	attachmentDetails: {
		flex: 1
	},
	attachmentName: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 2
	},
	attachmentSize: {
		fontSize: 14,
		opacity: 0.8
	},
	attachmentActions: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 12
	},
	previewButton: {
		padding: 8,
		borderRadius: 6,
		marginRight: 8
	},
	downloadButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		borderRadius: 6
	},
	downloadButtonText: {
		color: "white",
		fontWeight: "500",
		marginLeft: 4
	},
	// Preview modal styles
	previewModalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.9)",
		justifyContent: "center",
		alignItems: "center"
	},
	previewModalContainer: {
		width: Dimensions.get("window").width * 0.95,
		height: Dimensions.get("window").height * 0.85,
		backgroundColor: Colors.background,
		borderRadius: 12,
		overflow: "hidden"
	},
	previewHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.tabIconDefault + '30'
	},
	previewTitle: {
		fontSize: 18,
		fontWeight: "600",
		flex: 1,
		marginRight: 16
	},
	closeButton: {
		padding: 8
	},
	previewContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	previewImage: {
		width: "100%",
		height: "100%"
	},
	noPreviewContainer: {
		alignItems: "center",
		padding: 40
	},
	noPreviewText: {
		fontSize: 18,
		fontWeight: "500",
		marginTop: 16,
		textAlign: "center"
	},
	noPreviewSubtext: {
		fontSize: 16,
		marginTop: 8,
		textAlign: "center"
	}
})
