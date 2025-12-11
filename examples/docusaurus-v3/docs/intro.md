# Introduction

This is an example site demonstrating the **docusaurus-plugin-statuspage** plugin.

## How it works

The plugin monitors a Statuspage.io status page and displays a banner when there are degraded services or active incidents.

### Features

- Displays a discreet, dismissible banner
- Automatically fetches status from Statuspage.io API
- Persists dismissed banners per incident using localStorage
- Configurable position (top-left, top-right, bottom-left, bottom-right)
- Respects Docusaurus theme variables for consistent styling
- Accessible with ARIA labels and semantic HTML

## Testing the banner

This example site is configured to monitor GitHub's status page (`https://www.githubstatus.com`).

If GitHub is experiencing any issues, you should see a status banner appear in the bottom-left corner of the page.

### Simulating an incident

To test the banner locally, you can:

1. Open browser DevTools
2. Go to the Network tab
3. Find the request to `githubstatus.com/api/v2/summary.json`
4. Copy the response and modify `status.indicator` to something other than `"none"`
5. Use DevTools to mock the response

Or configure the plugin to point to a different Statuspage that has active incidents.

## Configuration

```js
// docusaurus.config.js
plugins: [
  [
    'docusaurus-plugin-statuspage',
    {
      statuspageUrl: 'https://www.githubstatus.com',
      position: 'bottom-left',    // optional, default: 'bottom-left'
      linkLabel: 'View status',   // optional, default: 'View status'
      enabled: true,              // optional, default: true
    },
  ],
],
```
