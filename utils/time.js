const formatWithZero = (input) => (input.length < 2 ? `0${input}` : input);

const hour24 = (hour, range) => {
  if (range === 'AM') {
    if (hour === '12') {
      return '0';
    } else {
      return hour;
    }
  } else {
    if (hour === '12') {
      return hour;
    } else {
      return (+hour + 12).toString();
    }
  }
};

const formatDateTime = () => {
  const dateTimeString = new Date().toLocaleString(new Date(), {
    timeZone: 'America/Vancouver',
  });

  const parts = dateTimeString.split(',');
  const dateString = parts[0];
  const timeRangeString = parts[1];

  const dateParts = dateString.split('/');
  const year = dateParts[2];
  const month = formatWithZero(dateParts[0]);
  const day = formatWithZero(dateParts[1]);

  const timeRangeParts = timeRangeString.split(' ');
  const timeString = timeRangeParts[1];
  const range = timeRangeParts[2];
  const timeParts = timeString.split(':');
  const hour = formatWithZero(hour24(timeParts[0], range));
  const minute = formatWithZero(timeParts[1]);
  const second = formatWithZero(timeParts[2]);

  return { year, month, day, hour, minute, second };
};

/* Return current date in or YYYY-MM-DD format */
const formattedDate = () => {
  const { year, month, day } = formatDateTime();
  return `${year}-${month}-${day}`;
};

/* Return current date in hh:mm:ss format */
const formattedTime = () => {
  const { hour, minute, second } = formatDateTime();
  return `${hour}:${minute}:${second}`;
};

module.exports = {
  formattedDate,
  formattedTime,
  formatWithZero,
  hour24,
};
