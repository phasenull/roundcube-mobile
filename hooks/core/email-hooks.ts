import { useAuthStore } from "@/constants/auth-store"
import { makeRequest, parseMailboxData, parseMessageBody } from "@/constants/utils"
import { useQuery } from "@tanstack/react-query"

export function useGetInbox() {
	const server = useAuthStore((state) => state.server)
	const setConfig = useAuthStore((state) => state.setConfig)
	return useQuery({
		queryKey: ["inbox", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			const inboxUrl = `https://${server}/?_task=mail&_action=list&_mbox=INBOX&_remote=1&_unlock=loading${Date.now()}&_=${Date.now()}`
			const res = await makeRequest(inboxUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Cookie: ""
				},

				credentials: "include"
			})
			const text = (await res.json()) as {
				action: "list"
				unlock: string
				env: object
				exec: string
			}
			// console.log("Inbox response:", text.exec)
			return parseMailboxData(text.exec)
		},
		staleTime: 5 * 1000 // 5 seconds
	})
}
export function useGetMessagePreview(id: number) {
	const server = useAuthStore((state) => state.server)
	return useQuery({
		queryKey: ["preview", server, id],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			const previewUrl = `https://webmail.kocaeli.edu.tr/?_task=mail&_caps=pdf%3D1%2Cflash%3D0%2Ctiff%3D0%2Cwebp%3D1%2Cpgpmime%3D0&_uid=${id}&_mbox=INBOX&_framed=1&_action=preview`
			const res = await makeRequest(previewUrl, {
				method: "GET",
				headers: {
					// "Content-Type": "application/x-www-form-urlencoded",
				},
				credentials: "include"
			})
			const text = await res.text()
			const content = parseMessageBody(text)
			// console.log("Preview response:",id, text.slice(0,40),content?.slice(0,40))

			return content
		},
		staleTime: 0 * 60 * 1000 // 5 minutes
	})
}