import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { AttachmentInfo } from "@/constants/utils"
import React from "react"
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface AttachmentsListProps {
	attachments: AttachmentInfo[]
	onPreview: (attachment: AttachmentInfo) => void
}

export function AttachmentsList({ attachments, onPreview }: AttachmentsListProps) {
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
			onPreview(attachment)
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

	if (!attachments || attachments.length === 0) {
		return null
	}

	return (
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
	)
}

const styles = StyleSheet.create({
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: 20
	},
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
	}
})