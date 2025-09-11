import { Colors } from "@/constants/Colors"
import { MessageRow } from "@/constants/utils"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

interface EmailHeaderProps {
	email: MessageRow
	type: "inbox" | "sent" | "drafts"
	userEmail?: string
}

export function EmailHeader({ email, type, userEmail }: EmailHeaderProps) {
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

	return (
		<>
			{/* Subject */}
			<Text style={[styles.subject, { color: Colors.text, userSelect: "text" }]}>
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
							: userEmail}
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
							? userEmail || "Unknown Sender"
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
		</>
	)
}

const styles = StyleSheet.create({
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
	}
})