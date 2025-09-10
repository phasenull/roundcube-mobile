import { useAuthStore } from "@/constants/auth-store"
import { useQuery } from "@tanstack/react-query"

export function useGetInbox() {
	const server = useAuthStore((state) => state.server)
	return useQuery({
		queryKey: ["inbox", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			const inboxUrl = `https://${server}/`
		}
	})
}
