const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to scrape MCX data
const scrapeMcXData = async () => {
    const url = 'https://mcxlive.org/';  // URL of the MCX live data page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Data array to store scraped information
    const data = [];

    // Modify the selector according to the actual structure of the table
    $('table tbody tr').each((index, element) => {
        const row = {};
        
        // Assuming the table has columns in a specific order
        const columns = $(element).find('td');
        if (columns.length > 0) {
            row.Symbol = $(columns[0]).text().trim();
            row.Last = $(columns[1]).text().trim();
            row.Change = $(columns[2]).text().trim();
            row.ChangePercent = $(columns[3]).text().trim();
            row.Close = $(columns[4]).text().trim();
            row.High = $(columns[5]).text().trim();
            row.Low = $(columns[6]).text().trim();
            row.LastTrade = $(columns[7]).text().trim();
            data.push(row);
        }
    });
    return data;
};

// Define an API endpoint
app.get('/api/mcx', async (req, res) => {
    try {
        const mcxData = await scrapeMcXData();
        res.json(mcxData);
    } catch (error) {
        console.error('Error scraping MCX data:', error);
        res.status(500).json({ error: 'Failed to retrieve MCX data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
