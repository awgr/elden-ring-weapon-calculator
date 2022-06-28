export const damageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;

export const attributes = ["str", "dex", "int", "fai", "arc"] as const;

export const affinities = [
  "None",
  "Heavy",
  "Keen",
  "Quality",
  "Magic",
  "Cold",
  "Fire",
  "Flame Art",
  "Lightning",
  "Sacred",
  "Poison",
  "Blood",
  "Occult",
] as const;

export const weaponTypes = [
  "Axe",
  "Ballista",
  "Bow",
  "Claw",
  "Colossal Sword",
  "Colossal Weapon",
  "Crossbow",
  "Curved Greatsword",
  "Curved Sword",
  "Dagger",
  "Fist",
  "Flail",
  "Glintstone Staff",
  "Greataxe",
  "Greatbow",
  "Great Hammer",
  "Greatshield",
  "Great Spear",
  "Greatsword",
  "Halberd",
  "Hammer",
  "Heavy Thrusting Sword",
  "Katana",
  "Light Bow",
  "Medium Shield",
  "Reaper",
  "Sacred Seal",
  "Small Shield",
  "Spear",
  "Straight Sword",
  "Thrusting Sword",
  "Torch",
  "Twinblade",
  "Whip",
] as const;

export type DamageType = typeof damageTypes[number];
export type Attribute = typeof attributes[number];
export type Affinity = typeof affinities[number];
export type WeaponType = typeof weaponTypes[number];

export function getDamageTypeLabel(damageType: DamageType) {
  switch (damageType) {
    case "physical":
      return "Physical";
    case "magic":
      return "Magic";
    case "fire":
      return "Fire";
    case "lightning":
      return "Lightning";
    case "holy":
      return "Holy";
  }
}

export function getAttributeLabel(attribute: Attribute) {
  switch (attribute) {
    case "str":
      return "Strength";
    case "dex":
      return "Dexterity";
    case "int":
      return "Intelligence";
    case "fai":
      return "Faith";
    case "arc":
      return "Arcane";
  }
}

export function getScalingLabel(scaling: number) {
  if (scaling > 1.75) {
    return "S";
  } else if (scaling >= 1.4) {
    return "A";
  } else if (scaling >= 0.9) {
    return "B";
  } else if (scaling >= 0.6) {
    return "C";
  } else if (scaling >= 0.25) {
    return "D";
  } else if (scaling > 0) {
    return "E";
  } else {
    return "-";
  }
}