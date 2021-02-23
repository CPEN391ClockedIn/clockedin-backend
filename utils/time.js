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

const formatDateTime = () => {
  const dateTimeString = new Date().toLocaleString('en-GB', {
    timeZone: 'America/Vancouver',
  });

  const parts = dateTimeString.split(',');
  const dateString = parts[0];
  const timeString = parts[1];

  const dateParts = dateString.split('/');
  const year = dateParts[2];
  const month = formatWithZero(dateParts[1]);
  const day = formatWithZero(dateParts[0]);

  const timeParts = timeString.split(':');
  const hour = formatWithZero(timeParts[0].slice(1));
  const minute = formatWithZero(timeParts[1]);
  const second = formatWithZero(timeParts[2]);

  return { year, month, day, hour, minute, second };
};

const formatWithZero = (input) => (input.length < 2 ? `0${input}` : input);

module.exports = {
  formattedDate,
  formattedTime,
};
