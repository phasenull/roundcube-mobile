import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { AttachmentInfo } from "@/constants/utils"
import React from "react"
import {
	Alert,
	Dimensions,
	Image,
	Linking,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native"

interface AttachmentPreviewModalProps {
	attachment: AttachmentInfo | null
	visible: boolean
	onClose: () => void
}

export function AttachmentPreviewModal({ attachment, visible, onClose }: AttachmentPreviewModalProps) {
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

	if (!attachment) return null

	return (
		<Modal
			visible={visible}
			animationType="fade"
			presentationStyle="overFullScreen"
			onRequestClose={onClose}
		>
			<View style={styles.previewModalOverlay}>
				<View style={styles.previewModalContainer}>
					{/* Modal Header */}
					<View style={[styles.previewHeader, { backgroundColor: Colors.background }]}>
						<Text style={[styles.previewTitle, { color: Colors.text }]} numberOfLines={1}>
							{attachment.name}
						</Text>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={onClose}
						>
							<IconSymbol name="xmark" size={24} color={Colors.text} />
						</TouchableOpacity>
					</View>

					{/* Preview Content */}
					<View style={styles.previewContent}>
						{canPreviewFile(attachment.name, attachment.type) && 
						 attachment.type.includes('image') ? (
							<Image
								source={{ uri: `https://${useAuthStore.getState().server}${attachment.url}` }}
								style={styles.previewImage}
								resizeMode="contain"
							/>
						) : (
							<View style={styles.noPreviewContainer}>
								<IconSymbol
									name={getFileIcon(attachment.name, attachment.type)}
									size={80}
									color={Colors.tabIconDefault}
								/>
								<Text style={[styles.noPreviewText, { color: Colors.text }]}>
									{attachment.name}
								</Text>
								<Text style={[styles.noPreviewSubtext, { color: Colors.tabIconDefault }]}>
									{attachment.size}
								</Text>
								<TouchableOpacity
									style={[styles.downloadButton, { backgroundColor: Colors.tint, marginTop: 20 }]}
									onPress={() => {
										handleAttachmentDownload(attachment)
										onClose()
									}}
								>
									<IconSymbol
										name="tray.and.arrow.down"
										size={20}
										color="white"
										style={{ marginRight: 8 }}
									/>
									<Text style={styles.downloadButtonText}>Download</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
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
	},
	downloadButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8
	},
	downloadButtonText: {
		color: "white",
		fontWeight: "500",
		fontSize: 16
	}
})