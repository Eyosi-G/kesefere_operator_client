export const BRANDS: Record<string, string[]> = {
  Toyota: ["Hiace", "Coaster", "Corolla", "Vitz", "Yaris", "Prado", "Land Cruiser", "RAV4", "Hilux", "Camry", "Starlet", "Noah", "Voxy", "Avanza"],
  Nissan: ["Patrol", "Sunny", "Navara", "X-Trail", "Urvan"],
  Mitsubishi: ["Pajero", "L200", "Lancer"],
  Hyundai: ["Accent", "Grandeur", "Elantra", "Tucson", "H-1", "Starex"],
  Kia: ["Picanto", "Morning", "Sportage", "Carnival"],
  Suzuki: ["Swift", "Vitara", "Baleno", "Dzire", "Ertiga"],
  Honda: ["Fit", "Civic", "CR-V"],
  "Mercedes-Benz": ["C-Class", "E-Class", "Sprinter"],
  Foton: ["View", "Gratour"],
  BYD: ["Qin", "Song"],
}

export const COLORS = [
  "White",
  "Silver",
  "Gray",
  "Black",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Beige",
  "Brown",
  "Orange",
  "Purple",
]

export function getProductionYears(): number[] {
  const end = new Date().getFullYear() + 1
  const years: number[] = []
  for (let year = end; year >= 1980; year--) years.push(year)
  return years
}