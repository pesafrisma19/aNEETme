// src/providers/index.js
import animelovers from "./animelovers";
import lk21 from "./lk21";

const providers = {
  animelovers,
  lk21,
};

export function getProvider(name) {
  return providers[name] || null;
}
