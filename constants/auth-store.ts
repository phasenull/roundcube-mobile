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
	user: {
		username: string
	} | null
	setUser: (user: { username: string } | null) => void
	login_payload: ILoginPayload | null
	server: string | null
	config: {
		logo_url?: string
		quota?: {
			used: number
			total: number
			percent: number
			free: number
			type: string
			folder: string
			title: string
		}
		title?: string
		[key: string]: any
	} | null
	setConfig: (config: { [key: string]: any } | null) => void
	setLoginPayload: (payload: ILoginPayload) => void
	setServer: (url: string) => void
	clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			login_payload: null,
			server: null,
			config: null,
			setConfig: (config) => {
				const old = get().config
				set({config: {...old, ...config}})
			},
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
			setUser: (user) => set({ user }),
			clearAuth: () => set({ login_payload: null})
		}),

		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
