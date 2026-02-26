# DateTime Library (`DateTime`) 📅

Methods for parsing and extracting date/time information.

## Methods

### `DateTime.now()`

Returns the current unix timestamp in milliseconds.

- **Example**: `let ts = DateTime.now();`

### `DateTime.format(timestamp)`

Returns a human-readable date string.

- **Example**: `DateTime.format(DateTime.now());`

### `DateTime.getYear(ts)`

- **Example**: `DateTime.getYear(DateTime.now()); // 2026`

### `DateTime.getMonth(ts)`

- **Example**: `DateTime.getMonth(DateTime.now()); // 2`

### `DateTime.getDay(ts)`

- **Example**: `DateTime.getDay(DateTime.now()); // 27`
