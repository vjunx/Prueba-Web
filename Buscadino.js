const axios = require('axios');
const cheerio = require('cheerio');

// Búsqueda por nombre (devuelve array de especies)
async function searchDinosaurByName(dinoName) {
    try {
        const searchResponse = await axios.get('https://es.wikipedia.org/wiki/' + encodeURIComponent(dinoName));
        if (searchResponse.status === 200) {
            const $ = cheerio.load(searchResponse.data);
            const speciesList = [];
            $('table.infobox tbody tr').each((index, element) => {
                const text = $(element).text().trim();
                const match = text.match(new RegExp(`${dinoName}\\s+\\w+`, 'i'));
                if (match) {
                    let speciesName = match[0]
                        .replace(/Marsh\nOsborn\nGodefroit\nBarsbold\nDong\nParks\nHatcher\net al\.,?\s*\d{4}/gi, '')
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    speciesList.push(speciesName);
                }
            });
            return speciesList;
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
}

module.exports = {
    searchDinosaurByName
};