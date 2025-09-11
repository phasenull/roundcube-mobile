import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { MessageRow } from "@/constants/utils"
import { useGetDrafts, useGetInbox, useGetSent } from "@/hooks/core/email-hooks"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
	Alert,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native"

type EmailSection = "inbox" | "sent" | "drafts"

export default function EmailsScreen() {
	const router = useRouter()
	const colorScheme = useColorScheme()
	const { user } = useAuthStore()
	const [activeSection, setActiveSection] = useState<EmailSection>("inbox")

	// Fetch data for all sections
	const inboxQuery = useGetInbox()
	const sentQuery = useGetSent()
	const draftsQuery = useGetDrafts()

	// Get current section data
	const getCurrentQuery = () => {
		switch (activeSection) {
			case "inbox":
				return inboxQuery
			case "sent":
				return sentQuery
			case "drafts":
				return draftsQuery
			default:
				return inboxQuery
		}
	}

	const currentQuery = getCurrentQuery()
	const emails = currentQuery.data?.messages || []

	const getSectionIcon = (section: EmailSection) => {
		switch (section) {
			case "inbox":
				return "tray"
			case "sent":
				return "paperplane"
			case "drafts":
				return "doc.text"
			default:
				return "tray"
		}
	}

	const getSectionTitle = (section: EmailSection) => {
		switch (section) {
			case "inbox":
				return "Inbox"
			case "sent":
				return "Sent"
			case "drafts":
				return "Drafts"
			default:
				return "Inbox"
		}
	}

	const getMessageCountText = () => {
		if (emails.length === 0) return ""
		const total = emails.length
		return `Messages 1 to ${total} of ${total}`
	}

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString)
			const now = new Date()
			const diffTime = Math.abs(now.getTime() - date.getTime())
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

			if (diffDays <= 1) {
				return date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit"
				})
			} else if (diffDays <= 7) {
				return date.toLocaleDateString([], { weekday: "short" })
			} else {
				return date.toLocaleDateString([], { month: "short", day: "numeric" })
			}
		} catch {
			return dateString
		}
	}

	const handleRefresh = async () => {
		try {
			await currentQuery.refetch()
		} catch (error) {
			console.error("Error refreshing emails:", error)
			Alert.alert("Error", "Failed to refresh emails")
		}
	}

	const renderEmailItem = ({ item }: { item: MessageRow }) => {
		const isUnread = item.seen === 0

		return (
			<TouchableOpacity
				style={[
					styles.emailItem,
					{
						backgroundColor: Colors.background,
						borderBottomColor: Colors.tabIconDefault
					}
				]}
				onPress={() =>
					router.push({
						pathname: `/email/[id]`,
						params: {
							id: item.id,
							email_json: JSON.stringify(item),
							type: activeSection
						}
					})
				}
			>
				<Text
					style={[
						styles.subject,
						{
							color: Colors.text,
							fontSize: 18,
							fontWeight: isUnread ? "bold" : "normal"
						}
					]}
					numberOfLines={1}
				>
					{item.subject || "No Subject"}
				</Text>
				<View style={styles.emailHeader}>
					<View style={[styles.senderContainer, { opacity: 0.3 }]}>
						<Text
							style={[
								styles.sender,
								{
									color: Colors.text,
									fontWeight: isUnread ? "bold" : "normal"
								}
							]}
							numberOfLines={1}
						>
							{item.fromto || "Unknown Sender"}
						</Text>
						{isUnread && (
							<View
								style={[styles.unreadDot, { backgroundColor: Colors.tint }]}
							/>
						)}
					</View>
					<Text style={[styles.date, { color: Colors.tabIconDefault }]}>
						{item.date}
					</Text>
				</View>

				<View style={styles.emailMeta}>
					<Text style={[styles.size, { color: Colors.tabIconDefault }]}>
						{item.size}
					</Text>
					{item.ctype && (
						<IconSymbol
							name="paperclip"
							size={14}
							color={Colors.tabIconDefault}
						/>
					)}
				</View>
			</TouchableOpacity>
		)
	}

	if (!user) {
		return (
			<ThemedView style={styles.centered}>
				<IconSymbol name="envelope" size={60} color={Colors.tabIconDefault} />
				<ThemedText style={styles.emptyText}>
					Please login to view emails
				</ThemedText>
			</ThemedView>
		)
	}

	if (currentQuery.isError) {
		return (
			<ThemedView style={styles.centered}>
				<IconSymbol
					name="exclamationmark.triangle"
					size={60}
					color={Colors.tabIconDefault}
				/>
				<ThemedText style={styles.emptyText}>
					{currentQuery.error?.message || "Failed to load emails"}
				</ThemedText>
				<TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
					<ThemedText style={styles.retryText}>Retry</ThemedText>
				</TouchableOpacity>
			</ThemedView>
		)
	}

	return (
		<ThemedView style={styles.container}>
			{/* Section Tabs */}
			<View style={styles.sectionTabs}>
				{(["inbox", "sent", "drafts"] as EmailSection[]).map((section) => (
					<TouchableOpacity
						key={section}
						style={[
							styles.sectionTab,
							activeSection === section && styles.activeSectionTab
						]}
						onPress={() => setActiveSection(section)}
					>
						<IconSymbol
							name={getSectionIcon(section)}
							size={20}
							color={
								activeSection === section ? Colors.tint : Colors.tabIconDefault
							}
						/>
						<Text
							style={[
								styles.sectionTabText,
								{
									color:
										activeSection === section
											? Colors.tint
											: Colors.tabIconDefault,
									fontWeight: activeSection === section ? "600" : "normal"
								}
							]}
						>
							{getSectionTitle(section)}
						</Text>
						{/* Badge for email count */}
						{currentQuery.data?.messages &&
							currentQuery.data.messages.length > 0 &&
							activeSection === section && (
								<View
									style={[
										styles.sectionBadge,
										{ backgroundColor: Colors.tint }
									]}
								>
									<Text style={styles.sectionBadgeText}>
										{currentQuery.data.messages.length}
									</Text>
								</View>
							)}
					</TouchableOpacity>
				))}
			</View>

			<View style={[styles.emailListContainer, { flex: 1, display: "flex" }]}>
				{emails.length === 0 && !currentQuery.isLoading ? (
					<View style={styles.centered}>
						<IconSymbol
							name="envelope"
							size={60}
							color={Colors.tabIconDefault}
						/>
						<ThemedText style={styles.emptyText}>
							No {getSectionTitle(activeSection).toLowerCase()} found
						</ThemedText>
						<TouchableOpacity
							style={styles.retryButton}
							onPress={handleRefresh}
						>
							<ThemedText style={styles.retryText}>Refresh</ThemedText>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						style={{ flex: 1, display: "flex" }}
						contentContainerStyle={{ flex: 1, display: "flex" }}
						data={emails}
						renderItem={renderEmailItem}
						keyExtractor={(item) => item.id.toString()}
						refreshControl={
							<RefreshControl
								refreshing={currentQuery.isRefetching}
								onRefresh={handleRefresh}
								tintColor={Colors.tint}
							/>
						}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>

			{currentQuery.data?.rowCount && (
				<ThemedText style={styles.rowCountText}>
					{currentQuery.data.rowCount.text}
				</ThemedText>
			)}

			{/* Floating Action Button */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push("/email/compose")}
				activeOpacity={0.8}
			>
				<IconSymbol name="plus" size={24} color="white" />
			</TouchableOpacity>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	sectionTabs: {
		flexDirection: "row",
		backgroundColor: "white",
		paddingHorizontal: 4,
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.tabIconDefault + "20"
	},
	sectionTab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginHorizontal: 4,
		backgroundColor: "transparent"
	},
	activeSectionTab: {
		backgroundColor: Colors.tint + "10"
	},
	sectionTabText: {
		fontSize: 14,
		marginLeft: 6
	},
	sectionBadge: {
		marginLeft: 6,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 10,
		minWidth: 20,
		alignItems: "center",
		justifyContent: "center"
	},
	sectionBadgeText: {
		color: "white",
		fontSize: 11,
		fontWeight: "bold"
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "bold",
		marginRight: 12
	},
	unreadBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		minWidth: 24,
		alignItems: "center",
		justifyContent: "center"
	},
	unreadBadgeText: {
		color: "white",
		fontSize: 12,
		fontWeight: "bold"
	},
	rowCountContainer: {
		paddingHorizontal: 20,
		paddingBottom: 10
	},
	rowCountText: {
		fontSize: 14,
		opacity: 0.7
	},
	emailListContainer: {
		flex: 1
	},
	emailList: {
		flex: 1
	},
	emailItem: {
		padding: 16,
		borderBottomWidth: StyleSheet.hairlineWidth
	},
	emailHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4
	},
	senderContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1
	},
	sender: {
		fontSize: 16,
		flex: 1,
		marginRight: 8
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginLeft: 4
	},
	date: {
		fontSize: 14,
		marginLeft: 8
	},
	subject: {
		fontSize: 15,
		marginBottom: 8
	},
	emailMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	size: {
		fontSize: 12
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	emptyText: {
		marginTop: 16,
		fontSize: 16,
		textAlign: "center"
	},
	retryButton: {
		marginTop: 16,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		backgroundColor: "#007AFF"
	},
	retryText: {
		color: "white",
		fontWeight: "600"
	},
	messageCountContainer: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderTopWidth: StyleSheet.hairlineWidth,
		alignItems: "center",
		justifyContent: "center"
	},
	messageCountText: {
		fontSize: 12,
		opacity: 0.7
	},
	fab: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.tint,
		justifyContent: "center",
		alignItems: "center",
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 0.3,
		shadowRadius: 6
	}
})
