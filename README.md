# NFL Stats Viewer

An interactive Vue.js application for viewing NFL player statistics.

## Features

- Interactive and sortable data table
- Responsive design
- Modern UI with hover effects
- Sort by any column
- Mobile-friendly

## Setup

1. Install dependencies:

```bash
npm install
```

2. Convert the CSV data to JSON:

```bash
npm run convert-csv
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components/StatsTable.vue` - The main table component
- `src/App.vue` - The root component
- `scripts/convertCsv.js` - Script to convert CSV data to JSON
- `resources/stats_12032024.csv` - Source data
- `src/data/stats.json` - Converted JSON data

## Technologies Used

- Vue.js 3
- Vite
- CSV Parser
- Modern CSS
