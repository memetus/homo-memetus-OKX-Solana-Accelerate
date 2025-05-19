import { getMonth, getDaysInMonth } from 'date-fns';

const TimeMap = (() => {
  const min = 60;
  const hour = min * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = week * 4;
  const year = month * 12;
  return { min, hour, day, week, month, year };
})();

const TimeMapDay = (() => {
  const min = 60;
  const hour = min * 60;
  const day = hour * 24;
  return { min, hour, day };
})();

const TimeTextShortMap = {
  [TimeMap.min]: 'm',
  [TimeMap.hour]: 'h',
  [TimeMap.day]: 'd',
  [TimeMap.week]: 'w',
  [TimeMap.month]: 'm',
  [TimeMap.year]: 'y',
};

const TimeTextMap = {
  [TimeMap.min]: 'minute',
  [TimeMap.hour]: 'hour',
  [TimeMap.day]: 'day',
  [TimeMap.week]: 'week',
  [TimeMap.month]: 'month',
  [TimeMap.year]: 'year',
};

const createTimeTextShort = (
  time: number,
  standard: number,
  suffix: string,
) => {
  const duration = Math.floor(time / standard);
  return `${duration}${duration === 1 ? suffix : suffix}`;
};

const createTimeText = (time: number, standard: number, suffix: string) => {
  const duration = Math.floor(time / standard);
  return `${duration} ${duration === 1 ? suffix : suffix}`;
};

const translateTimeZone = (updated_at: string) => {
  return +new Date(
    parseInt(updated_at.slice(0, 4)),
    parseInt(updated_at.slice(5, 7)) - 1,
    parseInt(updated_at.slice(8, 10)),
    parseInt(updated_at.slice(11, 13)) + 9,
    parseInt(updated_at.slice(14, 16)),
  );
};

export const fetchRelatedTimeDay = (updated_at: string, isShorten: boolean) => {
  const seconds = (+new Date() - translateTimeZone(updated_at)) / 1000;

  if (isShorten) {
    return Object.entries(TimeMapDay).reduce((text, [time, value]) => {
      if (seconds >= value && time)
        return `${createTimeTextShort(
          seconds,
          value,
          TimeTextShortMap[value],
        )}`;
      return text;
    }, 'now');
  } else {
    return Object.entries(TimeMap).reduce((text, [time, value]) => {
      if (seconds >= value && time)
        return `${createTimeText(seconds, value, TimeTextMap[value])} ago`;
      return text;
    }, 'just before');
  }
};

export const fetchRelatedTime = (updated_at: string, isShorten: boolean) => {
  const seconds = (+new Date() - translateTimeZone(updated_at)) / 1000;

  if (isShorten) {
    return Object.entries(TimeMap).reduce((text, [time, value]) => {
      if (seconds >= value && time)
        return `${createTimeTextShort(
          seconds,
          value,
          TimeTextShortMap[value],
        )}`;
      return text;
    }, 'now');
  } else {
    return Object.entries(TimeMap).reduce((text, [time, value]) => {
      if (seconds >= value && time)
        return `${createTimeText(seconds, value, TimeTextMap[value])} ago`;
      return text;
    }, 'just before');
  }
};

export const fetchDateFormat = (date: string) => {
  return date.slice(0, 10);
};

export const fetchTimeFormat = (date: string) => {
  return date.slice(11, 19);
};

export const fetchUpdatedTime = (updated_at: string) => {
  let time = updated_at.slice(16, 24);
  let day = updated_at.slice(8, 10);
  let month = monthReverseShortTextMap[updated_at.slice(4, 7)];
  let year = updated_at.slice(11, 16);

  if (time === '00:00:00') {
    day = `${
      parseInt(day) - 1 > 9 ? parseInt(day) - 1 : `0${parseInt(day) - 1}`
    }`;
    if (day === '00') {
      month = `${
        parseInt(month) - 1 > 9
          ? parseInt(month) - 1
          : `0${parseInt(month) - 1}`
      }`;
      day =
        getDaysInMonth(month) > 9
          ? `${getDaysInMonth(month)}`
          : `0${getDaysInMonth(month)}`;

      if (month === '00') {
        year = `${parseInt(year) - 1}`;
        month = '12';
      }
    }
  }

  return `${time.slice(0, 2)}:00:00 ${day}/${month}/${year}`;
};

export const fetchUpdatedDuration = (startedAt: string, updated_at: string) => {
  let time = fetchTimeFormat(updated_at);
  let day = updated_at.slice(8, 10);
  let month = updated_at.slice(5, 7);
  let year = updated_at.slice(0, 4);

  let startDay = startedAt.slice(8, 10);
  let startMonth = startedAt.slice(5, 7);

  time = `${
    parseInt(time.slice(0, 2)) - 1 > 9
      ? parseInt(time.slice(0, 2)) - 1
      : `0${parseInt(time.slice(0, 2)) - 1}`
  }:${time.slice(3, 5)}:${time.slice(6, 8)}`;

  if (time === '00:00:00') {
    day = `${
      parseInt(day) - 1 > 9 ? parseInt(day) - 1 : `0${parseInt(day) - 1}`
    }`;
    if (day === '00') {
      month = `${
        parseInt(month) - 1 > 9
          ? parseInt(month) - 1
          : `0${parseInt(month) - 1}`
      }`;
      day =
        getDaysInMonth(month) > 9
          ? `${getDaysInMonth(month)}`
          : `0${getDaysInMonth(month)}`;

      if (month === '00') {
        year = `${parseInt(year) - 1}`;
        month = '12';
      }
    }
  }

  const monthText = updated_at.slice(5, 7);

  return `${
    monthShortTextMap[startMonth as keyof typeof monthShortTextMap]
  } ${startDay} ${'00:00'} - ${
    monthShortTextMap[monthText as keyof typeof monthShortTextMap]
  } ${updated_at.slice(8, 10)} ${fetchTimeFormat(updated_at).slice(0, 5)}, UTC`;
};

export const monthTextMap = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

export const monthShortTextMap = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

export const monthReverseShortTextMap: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export const getISOStringToArray = (
  day: string,
): [number, number, number, number, number, number] => {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  const date = Number(day.slice(8, 10));
  const hour = Number(day.slice(11, 13));
  const minute = Number(day.slice(14, 16));
  const second = Number(day.slice(17, 19));

  return [year, month - 1, date, hour, minute, second];
};

export const getGoneTime = (startTime: string) => {
  const now = new Date(Date.now());
  const start = new Date(startTime);

  let remaining = now.getTime() - start.getTime();

  const millisecondsPerMinute = 60 * 1000;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;

  const days = Math.floor(remaining / millisecondsPerDay);
  remaining -= days * millisecondsPerDay;

  const hours = Math.floor(remaining / millisecondsPerHour);
  remaining -= hours * millisecondsPerHour;

  const minutes = Math.floor(remaining / millisecondsPerMinute);
  remaining -= minutes * millisecondsPerMinute;

  return { days, hours, minutes };
};

export const getTimeDuration = (startTime: string) => {
  const { days, hours } = getGoneTime(startTime);

  const dayList = new Array(days * 24 + hours).fill('');

  return dayList.map((_, index) => {
    const date = new Date(startTime);
    if (index === 0) {
      return `${fetchDateFormat(date.toISOString())}:${fetchTimeFormat(
        date.toISOString(),
      ).slice(0, 5)}`;
    } else if (index === dayList.length - 1) {
      date.setHours(date.getHours() + index + 1);
      return `${fetchDateFormat(date.toISOString())}:${fetchTimeFormat(
        date.toISOString(),
      ).slice(0, 5)}`;
    }
    const prevDate = new Date(startTime);
    prevDate.setHours(prevDate.getHours() + index + 1);
    const from = `${fetchDateFormat(prevDate.toISOString())}:${fetchTimeFormat(
      prevDate.toISOString(),
    ).slice(0, 5)}`;
    date.setHours(date.getHours() + index + 2);
    return `${from} - ${fetchDateFormat(date.toISOString())}:${fetchTimeFormat(
      date.toISOString(),
    ).slice(0, 5)}`;
  });
};
