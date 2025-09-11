import { useAuthStore } from "@/constants/auth-store"
import {
	getComposeFormFromHTML,
	makeRequest,
	parseAttachments,
	parseMailboxData,
	parseMessageBody
} from "@/constants/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { router } from "expo-router"

export function useGetInbox() {
	const server = useAuthStore((state) => state.server)
	const setConfig = useAuthStore((state) => state.setConfig)
	const clearAuth = useAuthStore((state) => state.clearAuth)
	return useQuery({
		queryKey: ["inbox", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			console.log("Fetching inbox for server:", server)

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
			console.log("Inbox fetch response status:", res.status)
			if (
				text.exec.includes(
					'this.display_message("Your session is invalid or expired."'
				)
			) {
				clearAuth()
				router.navigate("/auth/login")
				return
			}
			const parsed = parseMailboxData(text.exec)
			// console.log("Inbox response:", text.exec)
			return parsed
		},
		staleTime: 0 * 1000 // 5 seconds
	})
}

export function useGetSent() {
	const server = useAuthStore((state) => state.server)
	const clearAuth = useAuthStore((state) => state.clearAuth)
	return useQuery({
		queryKey: ["sent", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			console.log("Fetching sent emails for server:", server)

			const sentUrl = `https://${server}/?_task=mail&_action=list&_mbox=Sent&_remote=1&_unlock=loading${Date.now()}&_=${Date.now()}`
			const res = await makeRequest(sentUrl, {
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
			console.log("Sent fetch response status:", res.status)
			if (
				text.exec.includes(
					'this.display_message("Your session is invalid or expired."'
				)
			) {
				clearAuth()
				router.navigate("/auth/login")
				return
			}
			const parsed = parseMailboxData(text.exec)
			return parsed
		},
		staleTime: 0 * 1000
	})
}

export function useGetDrafts() {
	const server = useAuthStore((state) => state.server)
	const clearAuth = useAuthStore((state) => state.clearAuth)
	return useQuery({
		queryKey: ["drafts", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			console.log("Fetching draft emails for server:", server)

			const draftsUrl = `https://${server}/?_task=mail&_action=list&_mbox=Drafts&_remote=1&_unlock=loading${Date.now()}&_=${Date.now()}`
			const res = await makeRequest(draftsUrl, {
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
			console.log("Drafts fetch response status:", res.status)
			if (
				text.exec.includes(
					'this.display_message("Your session is invalid or expired."'
				)
			) {
				clearAuth()
				router.navigate("/auth/login")
				return
			}
			const parsed = parseMailboxData(text.exec)
			return parsed
		},
		staleTime: 0 * 1000
	})
}
export function useGetMessagePreview(
	id: number,
	type: "INBOX" | "Sent" | "Drafts"
) {
	const server = useAuthStore((state) => state.server)
	const final_type =
		type.toLowerCase() === "inbox"
			? "INBOX"
			: capitalizeFirstLetter(type.toLowerCase())
	return useQuery({
		queryKey: ["preview", server, id],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			const previewUrl = `https://${server}/?_task=mail&_caps=pdf%3D1%2Cflash%3D0%2Ctiff%3D0%2Cwebp%3D1%2Cpgpmime%3D0&_uid=${id}&_mbox=${final_type}&_framed=1&_action=preview`
			const res = await makeRequest(previewUrl, {
				method: "GET",
				headers: {
					// "Content-Type": "application/x-www-form-urlencoded",
				},
				credentials: "include"
			})
			const text = await res.text()
			const content = parseMessageBody(text)
			const attachments = parseAttachments(text)
			// console.log(`${final_type} Preview response:`,text.includes("debug"),id, text.slice(0,20),content?.slice(0,40))

			return { content: content, attachments: attachments }
		},
		staleTime: 0 * 60 * 1000
	})
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function createComposeSessionAsync(server: string) {
	const composeUrl = `https://${server}/?_task=mail&_action=compose`
	const res = await makeRequest(composeUrl, {
		method: "GET",
		headers: {},
		credentials: "include"
	})
	const text = await res.text()
	const data = getComposeFormFromHTML(text)

	// console.log("Compose session response:", text.slice(0,100))
	return data
}

export function mutateCompose() {
	const server = useAuthStore((state) => state.server)
	return useMutation({
		mutationKey: ["compose", server],
		mutationFn: async (formData: FormData) => {
			if (!server) throw new Error("Server not set")
			const session = await createComposeSessionAsync(server)
		}
	})
}

export function useGetRequestToken() {
	const server = useAuthStore((state) => state.server)
	return useQuery({
		queryKey: ["request-token", server],
		queryFn: async () => {
			if (!server) throw new Error("Server not set")
			const session = await createComposeSessionAsync(server)
			return session?.request_token
		}
	})
}
