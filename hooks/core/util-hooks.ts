import { useAuthStore } from "@/constants/auth-store"
import { makeRequest, parseSearchResult } from "@/constants/utils"
import { useQuery } from "@tanstack/react-query"

export function useSearchPeople(term: string,request_token:string|undefined) {
	const server = useAuthStore((state) => state.server)
	return useQuery({
		queryKey: ["search-people", server, term],
		queryFn: async () => {
         if (term.length < 2) return;
			if (!server) throw new Error("No server set")
			const url = `https://${server}/?_task=mail&_action=autocomplete`
			const formData = new URLSearchParams()
			formData.append("_search", term)
			formData.append("_source", "")
			formData.append("_reqid", `${Math.floor(Date.now()/1000)}`)
			formData.append("_remote", "1")
			formData.append("_unlock", "0")
         // console.log("Searching people:",url, formData.toString().slice(0,50))
         // console.log("Using token:",request_token?.slice(0,10))
         if (!request_token) throw new Error("No auth token available")
			const request = await makeRequest(url,{
				method: "POST",
				headers: {
               "Content-Type": "application/x-www-form-urlencoded",
               "x-roundcube-request": request_token
            },
            credentials: "include",
				body: formData.toString() || ""
			})
         // console.log("Search people response:",request.status)
         // console.log("Headers",request.headers)
         const result = await request.text()
         // console.log("Search people raw result:",result.slice(0,100))
         const json = JSON.parse(result)  as {
            action: "autocomplete",
            exec: string
         }
         const parsed = parseSearchResult(json.exec)
         // console.log("Search people result:",request.status, parsed?.results.at(0),json.exec.slice(0,50))
         return parsed
		},
      enabled: !!term && term.length >= 2 && !!server && !!request_token,
	})
}
