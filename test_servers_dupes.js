import { getAllProviders } from "./src/providers/index.js";
const servers = getAllProviders();
const ids = servers.map(s => s.id);
console.log("Server IDs:", ids);
