export function formatDateInput(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  return `${day}/${month}/${year}`;
}

export function formatDisplayDate(value) {
  return formatDateInput(value) || '-';
}

export function parseDateInput(value) {
  const input = value.trim()
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/\s+/g, '');
  const dayFirst = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(input);
  const yearFirst = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(input);
  if (!dayFirst && !yearFirst) return null;

  let day;
  let month;
  let year;
  if (yearFirst) {
    [, year, month, day] = yearFirst.map(Number);
  } else {
    const [, firstText, secondText, yearText] = dayFirst;
    const first = Number(firstText);
    const second = Number(secondText);
    day = first;
    month = second;
    year = Number(yearText);
    if (first <= 12 && second > 12) {
      month = first;
      day = second;
    }
  }
  if (year < 1 || year > 9999) return null;

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null;

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
