import { useAuthStore } from "@/constants/auth-store"
import { getUsage, makeRequest, parseAndGetInputs } from "@/constants/utils"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
export function mutateLogin() {
	const server = useAuthStore((state) => state.server)
	const setUser = useAuthStore((state) => state.setUser)
	const router = useRouter()
	return useMutation({
		mutationKey: ["login", server],
		mutationFn: async (payload: {
			email: string
			password: string
			fields: Record<string, string | undefined>
		}) => {
			if (!server) throw new Error("Server not set")
			const loginUrl = `https://${server}/?_task=login`
			const body = new URLSearchParams()
			body.append("_token", payload.fields._token || "")
			body.append("_task", "login")
			body.append("_action", "login")
			body.append("_timezone", "Europe/Istanbul")
			body.append("_url", "")
			body.append("_user", payload.email)
			body.append("_pass", payload.password)
			console.log("Login payload:", body.toString())
			const res = await makeRequest(loginUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					
					Cookie: ""
				},
				credentials: "include",	
				body: body.toString()
			})
			console.log("returned headers", res.headers)
			const cookies = res.headers.get("set-cookie")
			// if (!cookies) throw new Error("No cookies set")
			const cookie = cookies?.split(";")[0]
			const text = await res.text()
			const is_login_successful = text.includes('span class="header-title username">')
			const quota = getUsage(text)
			setUser({username: payload.email})
			if (is_login_successful && quota) {
				console.log("Login successful, received quota:", quota)
				router.replace("/")
				return cookie
			} else {
				console.log("Login failed, response text:", res.status)
				// console.log(text)
				throw new Error("Login failed")
			}
		}
	})
}

export function getLoginFields() {
	const server = useAuthStore((state) => state.server)
	
	const setConfig = useAuthStore((state) => state.setConfig)
	if (!server) throw new Error("Server not set")
	// react query hook
	return useQuery({
		queryKey: ["loginFields", server],
		queryFn: async () => {
			console.log("Fetching login fields from server:", `https://${server}`)
			const res = await makeRequest(`https://${server}/?_task=login`, {
				// method: "GET",
				headers: {
					Accept:
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					// "Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					Host: server,
					Pragma: "no-cache",
					Referer: "https://google.com/",
					"Sec-Ch-Ua":
						'"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
					"sec-ch-ua-mobile": "?0",
					"Sec-Ch-Ua-Platform": '"Windows"',
					"Sec-Fetch-Dest": "document",
					"Upgrade-Insecure-Requests": "1",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "none",
					"sec-fetch-site": "cross-site",
					"Sec-Fetch-User": "?1",
					Cookie: "none",
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
				},
				credentials: "include"
			})
			if (!(res.status === 200)) {
				throw new Error(`Network response was not ok ${res.status}`)
			}
			// console.log("headers", res.headers)
			console.log("Response status:", res.status)

			const text = await res.text()
			const headers = res.headers.get("Set-Cookie")
			// console.log(text)
			// console.log(
			// 	"All response headers:",
			// 	JSON.stringify(res._rawHeaders, undefined, 4)
			// )
			const parsed = parseAndGetInputs(text, [
				"_token",
				"_task",
				"_action",
				"_timezone",
				"_url"
			])
			// Extract initial session cookie

			console.log("Parsed login fields:", parsed)
			setConfig({logo_url:parsed.logoUrl?.startsWith("http") ? parsed.logoUrl : `https://${server}/${parsed.logoUrl}` || null})
			return parsed
		},
		staleTime: 0,
		refetchOnWindowFocus: __DEV__, // Only refetch on focus in development
		refetchOnMount: true
	})
}
