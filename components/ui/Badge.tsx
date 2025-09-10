import { Text, View } from "react-native"

export default function Badge({
	children,
	color,
	font_size
}: {
	children: React.ReactNode
	color?: string
	font_size?: number
}) {
	return (
		<View
			style={{
				backgroundColor: color || "red",
				borderRadius: 4,
				paddingHorizontal: 6,
				paddingVertical: 3,
				alignSelf: "center",
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<Text
				style={{
					textAlign: "center",
					color: "white",
					fontSize: font_size || 10,
					fontWeight: "semibold"
				}}
			>
				{children}
			</Text>
		</View>
	)
}
