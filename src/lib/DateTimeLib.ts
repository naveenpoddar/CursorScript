import ConvertTOMK_Object from "./BaseLibConverter";

class DateTimeL {
  now() {
    return new Date().getTime();
  }

  parse(dateString: string) {
    return new Date(dateString).getTime();
  }

  format(time: any) {
    return new Date(time).toISOString();
  }

  info(time: any) {
    const date = new Date(time);

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
      timezoneOffset: date.getTimezoneOffset(),
    };
  }

  getDay(time: any) {
    return new Date(time ?? Date.now()).getDay();
  }

  getMonth(time: any) {
    return new Date(time ?? Date.now()).getMonth();
  }

  getYear(time: any) {
    return new Date(time ?? Date.now()).getFullYear();
  }

  getHour(time: any) {
    return new Date(time ?? Date.now()).getHours();
  }

  getMinute(time: any) {
    return new Date(time ?? Date.now()).getMinutes();
  }

  getSecond(time: any) {
    return new Date(time ?? Date.now()).getSeconds();
  }

  getMillisecond(time: any) {
    return new Date(time ?? Date.now()).getMilliseconds();
  }
}

export const DateTimeLib = ConvertTOMK_Object(new DateTimeL());
