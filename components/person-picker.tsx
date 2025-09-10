import { useGetRequestToken } from "@/hooks/core/email-hooks"
import { useSearchPeople } from "@/hooks/core/util-hooks"
import { useState } from "react"
import {
   Modal,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from "react-native"
import Badge from "./ui/Badge"

export default function PersonPicker<T extends boolean>(props: {
	allow_multiple?: T
	initial_selected?: Person[]
	onSelect?: (person: T extends true ? Person[] : Person) => void
}) {
	const [search, setSearch] = useState("")
	const { data: token } = useGetRequestToken()
	type RequestedPersonType = T extends true ? Person[] : Person
	const [selected, setSelected] = useState<Person[]>(
		props.initial_selected || []
	)
	function addOrRemovePerson(person: Person) {
		setSelected((current) => {
			if (props.allow_multiple) {
				if (current.find((p) => p.id === person.id)) {
					console.log("Removing person:", person.name)
					const new_selected = current.filter((p) => p.id !== person.id)
					return new_selected
				} else {
					console.log("Adding person:", person.name)
					const new_selected = [...current, person]
					return new_selected
				}
			} else {
				console.log("Selecting single person:", person.name)
				return [person]
			}
		})
	}
	const { data, isLoading, isError, error } = useSearchPeople(search, token)
	return (
		<Modal>
			<View>
				{selected
					.map((p) => p.name)
					.map((n) => (
						<Badge font_size={18} color="blue" key={n}>{n}</Badge>
					))}
			</View>
			<TextInput
				value={search}
				onChangeText={setSearch}
				placeholder="Search people"
				style={{
					height: 40,
					borderColor: "gray",
					borderWidth: 1,
					marginBottom: 20,
					paddingHorizontal: 10,
					width: "90%",
					alignSelf: "center",
					backgroundColor: "white",
					color: "black",
					borderRadius: 5,
					marginTop: 40
				}}
			/>
			<PersonList
				people={data?.results || []}
				selected={selected || []}
				onPresonPress={addOrRemovePerson}
			/>
			<TouchableOpacity
				onPress={() =>
					props.onSelect?.(
						props.allow_multiple
							? (selected as RequestedPersonType)
							: (selected[0] as RequestedPersonType)
					)
				}
				style={{
					padding: 10,
					backgroundColor: "lightblue",
					borderRadius: 5,
					margin: 20,
					alignItems: "center"
				}}
			>
				<Text>DONE</Text>
			</TouchableOpacity>
		</Modal>
	)
}
export interface Person {
	id: string
	name: string
	display?: string
	type: string
	source: string
}
function PersonList(props: {
	people: Person[]
	selected?: Person[]
	onPresonPress?: (person: Person) => void
}) {
	const { people, selected } = props
	return (
		<ScrollView>
			{people.map((item) => {
				if (!item) return null
				return (
					<TouchableOpacity
						key={item.id}
						style={{ paddingVertical: 4 }}
						onPress={() => props.onPresonPress?.(item)}
					>
						<Text
							style={{
								fontSize: 16,
								fontWeight: selected?.find((p) => p.id === item.id)
									? "bold"
									: "normal"
							}}
						>
							{item.display}
							{item.name}
						</Text>
					</TouchableOpacity>
				)
			})}
		</ScrollView>
	)
}
