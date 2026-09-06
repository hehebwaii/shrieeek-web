import { CharacterInfo } from "./types";

export const COMIC_CHARACTERS: CharacterInfo[] = [
  {
    id: "iron-man",
    name: "Tony Stark",
    heroTitle: "IRON MAN",
    universe: "TECH & INVENTIONS",
    defaultPowers: "Arc Reactor Powered Armor, Tactical Flight, Repulsor Blasts & Supercomputer AI",
    quote: "I am Iron Man.",
    accentColor: "#E62429",
    badgeBg: "#F3F000",
    description: "Genius billionaire industrialist equipped with cybernetic particle beam weaponry.",
    svgIcon: "iron-man",
    combatClass: "TECH",
    specialMove: "Unibeam Overcharge",
  },
  {
    id: "thor",
    name: "Thor Odinson",
    heroTitle: "THOR",
    universe: "ASGARDIAN THUNDER",
    defaultPowers: "Mjolnir Channeling, Weather & Lightning Manipulation, Godly Durability",
    quote: "For Asgard!",
    accentColor: "#00E5FF",
    badgeBg: "#1B1B1B",
    description: "The God of Thunder capable of summoning lightning storms across the cosmos.",
    svgIcon: "thor",
    combatClass: "MIGHT",
    specialMove: "Mjolnir Thunderstrike",
  },
  {
    id: "spiderman",
    name: "Peter Parker",
    heroTitle: "SPIDER-MAN",
    universe: "QUEENS VIGILANTE",
    defaultPowers: "Wall-Crawling, Precognitive Spider-Sense, Acrobatic Web-Shooting Reflexes",
    quote: "With great power comes great responsibility.",
    accentColor: "#FF2A2A",
    badgeBg: "#141313",
    description: "Agile hero fighting with rapid acrobatic web traversal and instinctual danger sense.",
    svgIcon: "spiderman",
    combatClass: "TECH",
    specialMove: "Web-Sling Blitz",
  },
  {
    id: "hulk",
    name: "Bruce Banner",
    heroTitle: "THE INCREDIBLE HULK",
    universe: "GAMMA RADIATION",
    defaultPowers: "Limitless Kinetic Strength, Rapid Cellular Regeneration, Shockwave Thunderclap",
    quote: "HULK SMASH!",
    accentColor: "#22C55E",
    badgeBg: "#141313",
    description: "Immense physical behemoth fueled by rage with impenetrable armored skin.",
    svgIcon: "hulk",
    combatClass: "MIGHT",
    specialMove: "Gamma Shockwave",
  },
  {
    id: "black-panther",
    name: "T'Challa",
    heroTitle: "BLACK PANTHER",
    universe: "WAKANDA FOREVER",
    defaultPowers: "Vibranium Kinetic Micro-Weave Suit, Enhanced Senses & Martial Prowess",
    quote: "Wakanda Forever!",
    accentColor: "#A855F7",
    badgeBg: "#1D1D1D",
    description: "Wakandan monarch armed with kinetic-absorption Vibranium claws and apex reflexes.",
    svgIcon: "black-panther",
    combatClass: "MARTIAL",
    specialMove: "Vibranium Kinetic Blast",
  },
  {
    id: "captain-marvel",
    name: "Carol Danvers",
    heroTitle: "CAPTAIN MARVEL",
    universe: "COSMIC FLIGHT",
    defaultPowers: "Cosmic Energy Absorption, Stellar Photon Blasts, Binary Mode Flight",
    quote: "Higher, further, faster.",
    accentColor: "#F59E0B",
    badgeBg: "#1E1D1C",
    description: "Cosmic warrior harnessing the power of raw stellar energy and lightspeed velocity.",
    svgIcon: "captain-marvel",
    combatClass: "COSMIC",
    specialMove: "Stellar Photon Barrage",
  },
  {
    id: "doctor-strange",
    name: "Stephen Strange",
    heroTitle: "DOCTOR STRANGE",
    universe: "MYSTIC ARTS",
    defaultPowers: "Sorcery, Eldritch Geometry, Mirror Dimension Traversal & Temporal Sight",
    quote: "We never lose our demons. We only learn to live above them.",
    accentColor: "#EC4899",
    badgeBg: "#121212",
    description: "Master of the Mystic Arts wielding arcane spells and reality-warping shields.",
    svgIcon: "doctor-strange",
    combatClass: "COSMIC",
    specialMove: "Eldritch Dimensional Rift",
  },
  {
    id: "wolverine",
    name: "Logan",
    heroTitle: "WOLVERINE",
    universe: "MUTANT WEAPON X",
    defaultPowers: "Adamantium Claws, Accelerated Healing Factor, Hyper-Keen Tracking Senses",
    quote: "I'm the best there is at what I do.",
    accentColor: "#FBBF24",
    badgeBg: "#1B1B1B",
    description: "Fierce mutant fighter with unbreakable adamantium skeleton and rapid healing.",
    svgIcon: "wolverine",
    combatClass: "MARTIAL",
    specialMove: "Berserker Adamantium Slash",
  },
];

export function getCharacterById(id: string | null): CharacterInfo {
  if (!id) return COMIC_CHARACTERS[0];
  const found = COMIC_CHARACTERS.find((c) => c.id === id);
  return found || COMIC_CHARACTERS[0];
}

export function getRandomCharacter(excludeId?: string): CharacterInfo {
  const pool = excludeId
    ? COMIC_CHARACTERS.filter((c) => c.id !== excludeId)
    : COMIC_CHARACTERS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
