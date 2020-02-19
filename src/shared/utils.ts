export function getMonthDiff(date1: Date, date2: Date): number {
    let monthDiff = (date2.getFullYear() - date1.getFullYear()) * 12;
    monthDiff += date2.getMonth() - date1.getMonth();

    return monthDiff;
}
