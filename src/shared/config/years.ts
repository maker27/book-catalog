export const FIRST_CATALOG_YEAR = 2000;

export function buildYearOptions(currentYear: number): number[] {
  const years: number[] = [];
  for (let year = currentYear; year >= FIRST_CATALOG_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}
