import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useAuthStore } from "@/constants/auth-store"
import { Colors } from "@/constants/Colors"
import { MessageRow } from "@/constants/utils"
import { useGetInbox } from "@/hooks/core/email-hooks"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter } from "expo-router"
import React from "react"
import {
	Alert,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native"

export default function EmailsScreen() {
	const router = useRouter()
	const colorScheme = useColorScheme()
	const { user } = useAuthStore()
	const {
		data: mailboxData,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching
	} = useGetInbox()

	const emails = mailboxData?.messages || []

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
			await refetch()
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
					router.push({ pathname: `/email/[id]`, params: { id: item.id, email_json: JSON.stringify(item) } })
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
								style={[
									styles.unreadDot,
									{ backgroundColor: Colors.tint }
								]}
							/>
						)}
					</View>
					<Text
						style={[
							styles.date,
							{ color: Colors.tabIconDefault }
						]}
					>
						{item.date}
					</Text>
				</View>

				<View style={styles.emailMeta}>
					<Text
						style={[
							styles.size,
							{ color: Colors.tabIconDefault }
						]}
					>
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
				<IconSymbol
					name="envelope"
					size={60}
					color={Colors.tabIconDefault}
				/>
				<ThemedText style={styles.emptyText}>
					Please login to view emails
				</ThemedText>
			</ThemedView>
		)
	}

	if (isError) {
		return (
			<ThemedView style={styles.centered}>
				<IconSymbol
					name="exclamationmark.triangle"
					size={60}
					color={Colors.tabIconDefault}
				/>
				<ThemedText style={styles.emptyText}>
					{error?.message || "Failed to load emails"}
				</ThemedText>
				<TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
					<ThemedText style={styles.retryText}>Retry</ThemedText>
				</TouchableOpacity>
			</ThemedView>
		)
	}

	return (
		<ThemedView style={styles.container}>
			<View style={[styles.emailListContainer, { flex: 1, display: "flex" }]}>
				{emails.length === 0 && !isLoading ? (
					<View style={styles.centered}>
						<IconSymbol
							name="envelope"
							size={60}
							color={Colors.tabIconDefault}
						/>
						<ThemedText style={styles.emptyText}>No emails found</ThemedText>
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
								refreshing={isRefetching}
								onRefresh={handleRefresh}
								tintColor={Colors.tint}
							/>
						}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>

			{mailboxData?.rowCount && (
				<ThemedText style={styles.rowCountText}>
					{mailboxData.rowCount.text}
				</ThemedText>
			)}

			{/* Floating Action Button */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push('/email/compose')}
				activeOpacity={0.8}
			>
				<IconSymbol
					name="plus"
					size={24}
					color="white"
				/>
			</TouchableOpacity>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
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
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.tint,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 6,
	}
})
