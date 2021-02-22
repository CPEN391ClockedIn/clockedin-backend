/* Return current date in or YYYY-MM-DD format */
const formattedDate = () => {
  const time = new Date();
  const year = time.getFullYear();
  const month = formatWithZero((time.getMonth() + 1).toString());
  const day = formatWithZero((time.getDate() + 1).toString());
  return `${year}-${month}-${day}`;
};

/* Return current date in hh:mm:ss format */
const formattedTime = () => {
  const time = new Date();
  const hour = formatWithZero(time.getHours().toString());
  const minute = formatWithZero(time.getMinutes().toString());
  const second = formatWithZero(time.getSeconds().toString());
  return `${hour}:${minute}:${second}`;
};

const formatWithZero = input => (input.length < 2 ? `0${input}` : input);

module.exports = {
  formattedDate,
  formattedTime,
};
