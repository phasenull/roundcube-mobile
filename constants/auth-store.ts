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
	user: {
		username:string
	} | null
	setUser: (user:{username:string}|null) => void
	login_payload: ILoginPayload | null
	server: string | null
	config: {
		logo_url: string | null

	} | null,
	setConfig: (config: {logo_url: string | null}|null) => void
	setAuth: (cookie: string|null) => void
	setLoginPayload: (payload: ILoginPayload) => void
	setServer: (url: string) => void
	clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			cookie: null,
			user:null,
			login_payload: null,
			server: null,
			config: null,
			setConfig: (config) => set({config}),
			setAuth: (cookie) => set({ cookie }),
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
			setUser: (user) => set({user}),
			clearAuth: () => set({ cookie: null, login_payload: null, server: null }),
		}),

		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
