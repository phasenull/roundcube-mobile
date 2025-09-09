import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface ILoginPayload {
	_token: string
	_task: "login"
	_action: "login"
	_timezone: "Europe/Istanbul"
	_url: undefined
}

interface AuthState {
	cookie: string | null
	login_payload: ILoginPayload | null
	server: string | null
	initial_login_cookie: string | null
	setAuth: (cookie: string) => void
	setInitialLoginCookie: (cookie: string | null) => void
	setLoginPayload: (payload: ILoginPayload) => void
	setServer: (url: string) => void
	clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			cookie: null,
			initial_login_cookie: null,
			login_payload: null,
			server: null,
			setAuth: (cookie: string) => set({ cookie }),
			setLoginPayload: (payload: ILoginPayload) =>
				set({ login_payload: payload }),
			setServer: (url: string) => {
				try {
					const parsedUrl = new URL(url)
					const host = parsedUrl.host // This includes hostname and port if present
					set({ server: host })
				} catch (error) {
					console.warn("Invalid URL provided to setServer:", url)
					set({ server: null })
				}
			},
			clearAuth: () => set({ cookie: null, login_payload: null, server: null }),
			setInitialLoginCookie: (cookie: string | null) => set({ initial_login_cookie: cookie })
		}),

		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
