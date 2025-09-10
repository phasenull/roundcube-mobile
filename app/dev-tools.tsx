import PersonPicker, { Person } from "@/components/person-picker"
import { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"

export default function DevTools() {
	const [visible, setVisible] = useState(false)
	const [selectedPeople, setSelectedPeople] = useState<Person[]>([])
	return (
		<View style={{ padding: 20 }}>
			<Text>Dev Tools</Text>
			<TouchableOpacity
				onPress={() => setVisible((v) => !v)}
				style={{
					padding: 10,
					backgroundColor: "lightgray",
					borderRadius: 5,
					marginBottom: 20
				}}
			>
				<Text>
					{selectedPeople.length > 0
						? selectedPeople.map((p) => p.name).join(", ")
						: "SELECT A PERSON"}
				</Text>
			</TouchableOpacity>
			<PersonPicker
				visible={visible}
				initial_selected={selectedPeople}
				allow_multiple={true}
				onSelect={(e) => {
					setSelectedPeople(e as Person[])
					setVisible(false)
				}}
			/>
		</View>
	)
}
