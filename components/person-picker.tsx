import { useGetRequestToken } from "@/hooks/core/email-hooks"
import { useSearchPeople } from "@/hooks/core/util-hooks"

export default function PersonPicker(props: { search_term: string }) {
	const { data: token } = useGetRequestToken()
	const { data, isLoading, isError, error } = useSearchPeople(props.search_term, "asf")
}
