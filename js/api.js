import { api_url } from "./config.js";

export async function get_movies() {
  const res = await fetch(api_url);
  if (!res.ok) {
    throw new Error(`Impossible de récupérer les films depuis l'API (${res.status})`);
  }
  return await res.json();
}