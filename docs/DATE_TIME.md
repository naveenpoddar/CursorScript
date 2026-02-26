# DateTime Library (`DateTime`) 📅

## Methods Index

- [now](#datetimenow) | [parse](#datetimeparsedatestring) | [format](#datetimeformattimestamp) | [info](#datetimeinfotimestamp)
- [getDay](#datetimegetdayts) | [getMonth](#datetimegetmonthts) | [getYear](#datetimegetyearts)
- [getHour](#datetimegethourts) | [getMinute](#datetimegetminutets) | [getSecond](#datetimegetsecondts) | [getMillisecond](#datetimegetmillisecondts)

## Methods

### `DateTime.now()`

- **Example**: `let current = DateTime.now();`

### `DateTime.parse(dateString)`

- **Example**: `let ts = DateTime.parse("2024-05-20");`

### `DateTime.format(timestamp)`

- **Example**: `let iso = DateTime.format(DateTime.now());`

### `DateTime.info(timestamp)`

- **Example**: `let data = DateTime.info(DateTime.now());`

---

## Specific Getters

### `DateTime.getDay(ts)`

Returns the day of the week (0-6).

- **Example**: `let dayOfWeek = DateTime.getDay(DateTime.now());`

### `DateTime.getMonth(ts)`

Returns the month (0-11).

- **Example**: `let month = DateTime.getMonth(DateTime.now());`

### `DateTime.getYear(ts)`

Returns the full year.

- **Example**: `let year = DateTime.getYear(DateTime.now());`

### `DateTime.getHour(ts)`

Returns the hour (0-23).

- **Example**: `let hr = DateTime.getHour(DateTime.now());`

### `DateTime.getMinute(ts)`

Returns the minute (0-59).

- **Example**: `let min = DateTime.getMinute(DateTime.now());`

### `DateTime.getSecond(ts)`

Returns the second (0-59).

- **Example**: `let sec = DateTime.getSecond(DateTime.now());`

### `DateTime.getMillisecond(ts)`

Returns the milliseconds (0-999).

- **Example**: `let ms = DateTime.getMillisecond(DateTime.now());`
