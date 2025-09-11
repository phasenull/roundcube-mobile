import { ThemedText } from "@/components/ThemedText"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

interface EmailBodyProps {
	content?: string
}

export function EmailBody({ content }: EmailBodyProps) {
	return (
		<View style={styles.bodyContainer}>
			{content ? (
				<Text style={[styles.body, { color: Colors.text, userSelect: "text" }]}>
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
	)
}

const styles = StyleSheet.create({
	bodyContainer: {
		paddingBottom: 20
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
	}
})