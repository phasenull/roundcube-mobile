import { useAuthStore } from "@/constants/auth-store"
import { makeRequest, parseAndGetInputs } from "@/constants/utils"

import { useMutation, useQuery } from "@tanstack/react-query"
export function mutateLogin() {
	const server = useAuthStore((state) => state.server)
	const initial_cookie = useAuthStore((state) => state.initial_login_cookie)
	return useMutation({
		mutationKey: ["login", server],
		mutationFn: async (payload: {
			email: string
			password: string
			fields: Record<string, string | undefined>
		}) => {
			if (!server) throw new Error("Server not set")
			const loginUrl = `https://${server}/?_task=login`
			console.log("Logging in to:", loginUrl, initial_cookie)
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

					Cookie: initial_cookie || ""
				},
				credentials: "include",
				body: body.toString()
			})
			console.log("returned headers", res.headers)
			if (res.status === 302) {
				const cookies = res.headers.get("set-cookie")
				if (!cookies) throw new Error("No cookies set")
				const cookie = cookies.split(";")[0]

				console.log("Login successful, received cookie:", cookie)
				return cookie
			} else {
				const text = await res.text()
				console.log(
					"Login failed, response text:",
					res.status,
					text.slice(0, 10)
				)
				throw new Error("Login failed")
			}
		}
	})
}

export function getLoginFields() {
	const server = useAuthStore((state) => state.server)
	const setInitialLoginCookie = useAuthStore(
		(state) => state.setInitialLoginCookie
	)
	if (!server) throw new Error("Server not set")
	// react query hook
	return useQuery({
		queryKey: ["loginFields", server],
		queryFn: async () => {
			console.log("Fetching login fields from server:", `https://${server}`)
			const res = await fetch(`https://${server}/?_task=login`, {
            // method: "GET",
            headers: {
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
               "Accept-Language": "en-US,en;q=0.9",
               "Cache-Control": "no-cache",
               "Pragma": "no-cache",
               "Connection": "keep-alive",
               "Upgrade-Insecure-Requests": "1",
               "Sec-Fetch-Dest": "document",
               "Sec-Fetch-Mode": "navigate",
               "Sec-Fetch-Site": "none",
               "Sec-Fetch-User": "?1",
               "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
            },

				credentials: "include"
			})
			if (!(res.status === 200)) {
				throw new Error("Network response was not ok")
			}
			// console.log("headers", res.headers)
			// console.log("Response status:", res.status)
			
			const text = await res.text()
			console.log("Fetched login page HTML:", text.slice(0, 10))
         const cookies = res.headers.get("Set-Cookie") || res.headers.get("set-cookie")
         console.log("All response headers:", cookies)
			if (cookies) {
				const initialCookie = cookies.split(";")[0]
				setInitialLoginCookie(initialCookie)
				console.log("Initial login cookie set:", initialCookie)
			} else {
				console.log("No initial login cookie found in response")
			}
			const parsed = parseAndGetInputs(text, [
				"_token",
				"_task",
				"_action",
				"_timezone",
				"_url"
			])
			// Extract initial session cookie

			console.log("Parsed login fields:", parsed)
			return parsed
		},
		staleTime: 0,
		refetchOnWindowFocus: __DEV__, // Only refetch on focus in development
		refetchOnMount: true
	})
}
