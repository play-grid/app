# Logo Data and Overrides

This directory contains the JSON data used for some of the logo sets in the game.

## Overriding Logo Images

You can override any logo image in the game by adding an entry to the `logo-overrides.json` file.

### Structure

The file has the following structure:

```json
{
  "_v": "2025-10-04T12:00:00Z",
  "sets": {
    "[logoSetName]": {
      "[listId]": {
        "[logoName]": "https://your-custom-image-url.png"
      }
    }
  }
}
```

- `_v`: This is a timestamp that acts as a cache-busting key. **If you change an override, you MUST update this timestamp to the current time (in ISO 8601 format)**. This tells the API to invalidate its cache and use your new overrides.
- `logoSetName`: The name of the logo set (e.g., "companies", "sports").
- `listId`: The ID of the list within the set (e.g., "saudi" for the Saudi Companies list, or "140" for the La Liga sports list).
- `logoName`: The exact name of the logo you want to replace.

### Example

To override the logo for "Apple" in the main "companies" list:

```json
{
  "_v": "2025-10-04T13:00:00Z",
  "sets": {
    "companies": {
      "companies": {
        "Apple": "https://example.com/my-apple-logo.svg"
      }
    }
  }
}
```