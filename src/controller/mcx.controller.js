// controllers/mcxController.js
const axios = require('axios');
const cheerio = require('cheerio');
const mcx = require('../model/mcx.model'); // Assuming this is your MongoDB model for MCX data

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

// Define the controller function for the API endpoint
exports.getMcxData = async (req, res) => {
    try {
        const mcxData = await scrapeMcXData();

        // Save or update each MCX data in the database
        const updatePromises = mcxData.map(mcxDataItem =>
            mcx.findOneAndUpdate(
                { Symbol: mcxDataItem.Symbol }, // Match by symbol
                mcxDataItem,
                { upsert: true, new: true } // Insert if not found, return new document
            ).catch(error => console.error(`Failed to update ${mcxDataItem.Symbol}:`, error))
        );

        await Promise.all(updatePromises); // Wait for all updates to complete

        // Fetch the updated data from the database
        const updatedData = await mcx.find({}); // Get all MCX data from the database

        // Send the updated data as the response
        res.json(updatedData);
    } catch (error) {
        console.error('Error scraping MCX data:', error);
        res.status(500).json({ error: 'Failed to retrieve MCX data' });
    }
};
