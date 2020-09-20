export default class DateUtils {
    static isValidDate(d: any): boolean {
        return !isNaN(Date.parse(d));
    }
}