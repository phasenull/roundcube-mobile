import { useGetRequestToken } from "@/hooks/core/email-hooks"
import { useSearchPeople } from "@/hooks/core/util-hooks"
import { useState } from "react"
import { Text, TextInput } from "react-native"

export default function DevTools() {
	const [search, setSearch] = useState("")

	const { data: token } = useGetRequestToken()
	const { data, isLoading, isError, error } = useSearchPeople(search, "asdfa")
	return (
		<>
			<Text>Dev Tools</Text>
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
					width: "100%",
					backgroundColor: "white",
					color: "black",
					borderRadius: 5,
					marginTop: 20
				}}
			/>
			{isLoading && <Text>Loading...</Text>}
			{isError && <Text>Error: {error?.message}</Text>}
			{data && <Text>{JSON.stringify(data, null, 2)}</Text>}
		</>
	)
}
