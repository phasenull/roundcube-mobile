export async function tryToFixSSLErrors() {
   const google = await fetch("https://www.google.com")
   const metu_url = await fetch("https://webmail.metu.edu.tr")
   console.log("Google fetch status:", google.status)
   console.log("METU fetch status:", metu_url.status)
   return
}