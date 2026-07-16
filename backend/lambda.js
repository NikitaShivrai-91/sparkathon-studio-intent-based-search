const serverlessExpress = require('@codegenie/serverless-express');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const BedrockService = require('./bedrock-service');

const app = express();

app.use(cors());
app.use(express.json());

const bedrockService = new BedrockService();

// Load mock data from the frontend src directory
const mockDataPath = path.join(__dirname, '../src/app/shared/data/mock-datamaps.json');
let dataMaps = [];

try {
  const data = fs.readFileSync(mockDataPath, 'utf-8');
  dataMaps = JSON.parse(data);
  console.log(`Loaded ${dataMaps.length} mock DataMaps`);
} catch (error) {
  console.error('Failed to load mock data:', error.message);
}

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Bedrock DataMaps Search API (Lambda)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/datamaps', (req, res) => {
  const { busNo, divisionId, top } = req.query;

  let filtered = dataMaps;

  if (busNo && filtered.some(dm => dm.busNo)) {
    filtered = filtered.filter(dm => dm.busNo && dm.busNo.toString() === busNo.toString());
  }

  if (divisionId) {
    filtered = filtered.filter(dm => dm.divisionId && dm.divisionId.toString() === divisionId.toString());
  }

  const limit = top ? parseInt(top) : filtered.length;
  const results = filtered.slice(0, limit);

  res.json({
    dataMaps: results,
    total: filtered.length,
    returned: results.length
  });
});

app.post('/api/datamaps/search', async (req, res) => {
  try {
    const { prompt, busNo, divisionId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search prompt is required'
      });
    }

    console.log(`Searching for: "${prompt}"`);

    let searchableDataMaps = dataMaps;

    if (busNo && searchableDataMaps.some(dm => dm.busNo)) {
      searchableDataMaps = searchableDataMaps.filter(dm => dm.busNo && dm.busNo.toString() === busNo.toString());
    }

    if (divisionId) {
      searchableDataMaps = searchableDataMaps.filter(dm => dm.divisionId && dm.divisionId.toString() === divisionId.toString());
    }

    const searchResult = await bedrockService.searchDataMaps(prompt, searchableDataMaps);

    if (!searchResult.success) {
      return res.status(500).json({
        success: false,
        error: searchResult.error
      });
    }

    console.log(`Found ${searchResult.results.length} relevant DataMaps`);

    res.json({
      success: true,
      query: prompt,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      usage: searchResult.usage
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/datamaps/explain/:dataMapId', async (req, res) => {
  try {
    const { dataMapId } = req.params;

    const dataMap = dataMaps.find(dm =>
      dm.dataMapId === dataMapId || dm.dataMapName === dataMapId
    );

    if (!dataMap) {
      return res.status(404).json({
        success: false,
        error: `DataMap not found: ${dataMapId}`
      });
    }

    console.log(`Explaining DataMap: ${dataMap.dataMapName}`);

    const explanation = await bedrockService.explainDataMap(dataMap);

    if (!explanation.success) {
      return res.status(500).json({
        success: false,
        error: explanation.error
      });
    }

    res.json(explanation);

  } catch (error) {
    console.error('Explain error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/datamaps/:dataMapId', (req, res) => {
  const { dataMapId } = req.params;

  const dataMap = dataMaps.find(dm => dm.dataMapId === dataMapId);

  if (!dataMap) {
    return res.status(404).json({
      success: false,
      error: 'DataMap not found'
    });
  }

  res.json({
    success: true,
    dataMap
  });
});

// Export Lambda handler
exports.handler = serverlessExpress({ app });
