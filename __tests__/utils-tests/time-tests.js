const {
  hour24,
  formatWithZero,
  formattedDate,
  formattedTime,
} = require('../../utils/time');

describe('12-hour to 24-hour conversion tests', () => {
  let hour, range, expectedConversion;

  it('should have correct conversion for 12AM', () => {
    hour = '12';
    range = 'AM';
    expectedConversion = '0';
    expect(hour24(hour, range)).toEqual(expectedConversion);
  });

  it('should have correct conversion for other AM times', () => {
    hour = '1';
    range = 'AM';
    expectedConversion = '1';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '2';
    range = 'AM';
    expectedConversion = '2';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '3';
    range = 'AM';
    expectedConversion = '3';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '4';
    range = 'AM';
    expectedConversion = '4';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '5';
    range = 'AM';
    expectedConversion = '5';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '6';
    range = 'AM';
    expectedConversion = '6';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '7';
    range = 'AM';
    expectedConversion = '7';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '8';
    range = 'AM';
    expectedConversion = '8';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '9';
    range = 'AM';
    expectedConversion = '9';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '10';
    range = 'AM';
    expectedConversion = '10';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '11';
    range = 'AM';
    expectedConversion = '11';
    expect(hour24(hour, range)).toEqual(expectedConversion);
  });

  it('should have correct conversion for 12PM', () => {
    hour = '12';
    range = 'PM';
    expectedConversion = '12';
    expect(hour24(hour, range)).toEqual(expectedConversion);
  });

  it('should have correct conversion for other PM times', () => {
    hour = '1';
    range = 'PM';
    expectedConversion = '13';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '2';
    range = 'PM';
    expectedConversion = '14';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '3';
    range = 'PM';
    expectedConversion = '15';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '4';
    range = 'PM';
    expectedConversion = '16';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '5';
    range = 'PM';
    expectedConversion = '17';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '6';
    range = 'PM';
    expectedConversion = '18';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '7';
    range = 'PM';
    expectedConversion = '19';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '8';
    range = 'PM';
    expectedConversion = '20';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '9';
    range = 'PM';
    expectedConversion = '21';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '10';
    range = 'PM';
    expectedConversion = '22';
    expect(hour24(hour, range)).toEqual(expectedConversion);

    hour = '11';
    range = 'PM';
    expectedConversion = '23';
    expect(hour24(hour, range)).toEqual(expectedConversion);
  });
});

describe('Fill zero format tests', () => {
  it('should fill with zero for 1-digit input', () => {
    const input = '1';
    const expected = '01';
    expect(formatWithZero(input)).toEqual(expected);
  });

  it('should not fill with zero for 2-digit input', () => {
    const input = '20';
    const expected = '20';
    expect(formatWithZero(input)).toEqual(expected);
  });
});

describe('Date and time format tests', () => {
  it('should have correct date format', () => {
    const dateTimeString = new Date().toLocaleString(new Date(), {
      timeZone: 'America/Vancouver',
    });
    const indexOfComma = dateTimeString.indexOf(',');
    const dateString = dateTimeString.slice(0, indexOfComma);
    const date = dateString.split('/');

    const year = date[2];
    const month = ('0' + date[0]).slice(-2);
    const day = ('0' + date[1]).slice(-2);
    const expectedDate = `${year}-${month}-${day}`;
    expect(formattedDate()).toEqual(expectedDate);
  });

  it('should have correct time format', () => {
    const dateTimeString = new Date().toLocaleString(new Date(), {
      timeZone: 'America/Vancouver',
    });

    const indexOfFirstSpace = dateTimeString.indexOf(' ');
    const indexOfSecondSpace = dateTimeString.indexOf(
      ' ',
      indexOfFirstSpace + 1
    );
    const timeString = dateTimeString.slice(
      indexOfFirstSpace + 1,
      indexOfSecondSpace
    );
    const range = dateTimeString.slice(indexOfSecondSpace + 1);

    const time = timeString.split(':');
    const hour = ('0' + hour24(time[0], range)).slice(-2);
    const minute = ('0' + time[1]).slice(-2);
    const second = ('0' + time[2]).slice(-2);
    const expectedTime = `${hour}:${minute}:${second}`;
    expect(formattedTime()).toEqual(expectedTime);
  });
});
