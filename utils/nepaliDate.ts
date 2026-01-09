export const getNepaliDigits = (num: number | string): string => {
  const digits: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };
  return num.toString().split('').map(d => digits[d] || d).join('');
};

const nepaliMonths = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const nepaliDays = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

/**
 * Accurate Nepali Date mapping for 2081 and 2082 BS.
 * Reference: 2081 Baishakh 1 = 2024-04-13
 */
export const getExactNepaliDate = (): string => {
  const now = new Date();
  const dayName = nepaliDays[now.getDay()];

  // Reference Point: 2081 Baishakh 1 is April 13, 2024
  const refDate = new Date(2024, 3, 13);
  const diffTime = now.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Actual days in months for 2081 and 2082 BS
  const calendarData: Record<number, number[]> = {
    2081: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2082: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]
  };

  let year = 2081;
  let monthIndex = 0;
  let remainingDays = diffDays;

  // Process years
  while (true) {
    const months = calendarData[year] || calendarData[2081]; // Fallback if year not mapped
    let yearTotalDays = months.reduce((a, b) => a + b, 0);
    
    if (remainingDays < yearTotalDays) {
      // Find month in current year
      for (let i = 0; i < months.length; i++) {
        if (remainingDays < months[i]) {
          monthIndex = i;
          break;
        }
        remainingDays -= months[i];
      }
      break;
    }
    remainingDays -= yearTotalDays;
    year++;
  }

  const nepYear = getNepaliDigits(year);
  const nepMonth = nepaliMonths[monthIndex];
  const nepDay = getNepaliDigits(remainingDays + 1);

  return `${nepYear} साल ${nepMonth} ${nepDay} गते, ${dayName}`;
};