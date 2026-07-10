// src/providers/index.js
import animelovers from "./animelovers";
import lk21 from "./lk21";
import dramabox from "./dramabox";
import otakudesu from "./otakudesu";

const providers = {
  animelovers,
  lk21,
  dramabox,
  otakudesu,
};

export function getProvider(name) {
  return providers[name] || null;
}

export function getAllProviders() {
  return Object.values(providers).map(p => ({
    id: p.id,
    name: p.name,
    desc: p.desc,
    logo: p.logo,
    capabilities: p.capabilities
  }));
}
