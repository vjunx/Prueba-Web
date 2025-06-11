const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const dinosaurData = require('./dinosaurData');

// Function to read dinosaur data from Excel
function readDinoDataFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const dinoData = {};
    data.forEach(row => {
        const name = row.NOMBRE.trim().toLowerCase();
        dinoData[name] = {
            longitud: row.LONGITUD,
            peso: row.PESO
        };
    });
    return dinoData;
}

// Function to normalize dinosaur names
function normalizeDinoName(dinoName) {
    return dinoName.trim().toLowerCase();
}

// Function to search dinosaur by name
async function searchDinosaurByName(dinoName, dinoData) {
    try {
        const formattedName = encodeURIComponent(dinoName.trim());
        const searchResponse = await axios.get(`https://es.wikipedia.org/wiki/${formattedName}`);
        if (searchResponse.status === 200) {
            const $ = cheerio.load(searchResponse.data);
            const name = $('h1').text();
            const descriptionRaw = $('p').first().text();
            const description = descriptionRaw.replace(/\[[^\]]*\]/g, '').trim();
            const period = description.match(/(Triásico|Jurásico|Cretácico)/i)?.[0] || 'Desconocido';
            const image = $('table.infobox img').first().attr('src') || 'No disponible';
            const imageUrl = image.startsWith('//') ? 'https:' + image : image;

            // Palabras clave para buscar imágenes didácticas
            const keywords = [
                'restoration',
                'life reconstruction',
                'paleoart',
                'paleoconstruction',
                'life restoration',
                'reconstruction',
                'paleoreconstruction'
            ];

            let commonsImageUrl = imageUrl; // Valor por defecto (de la infobox)
            for (const keyword of keywords) {
                const commonsSearchResponse = await axios.get('https://commons.wikimedia.org/w/api.php', {
                    params: {
                        action: 'query',
                        format: 'json',
                        list: 'search',
                        srsearch: `${dinoName} ${keyword}`,
                        srlimit: 1,
                        srnamespace: 6
                    }
                });

                if (
                    commonsSearchResponse.data.query &&
                    commonsSearchResponse.data.query.search &&
                    commonsSearchResponse.data.query.search.length > 0
                ) {
                    const commonsImage = commonsSearchResponse.data.query.search[0].title;
                    // Para una imagen de 400px de ancho:
                    const imageUrl = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(commonsImage) + '?width=400';
                    commonsImageUrl = imageUrl;
                    break; // Usa la primera imagen encontrada con una palabra clave relevante
                }
            }

            const normalizedDinoName = normalizeDinoName(dinoName);
            const longitud = dinoData[normalizedDinoName]?.longitud || 'Desconocido';
            const peso = dinoData[normalizedDinoName]?.peso || 'Desconocido';

            return {
                name: name,
                description: description,
                period: period,
                image: commonsImageUrl,
                longitud: longitud,
                peso: peso
            };
        } else {
            console.log('No se encontró ningún dinosaurio con ese nombre.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
    }
}

async function getDinosaurDetails(name) {
    console.log('Buscando detalles para:', name);
    // Leer longitud y peso desde dinosaurData.js
    let longitud = "Desconocido";
    let peso = "Desconocido";
    const dinoInfo = getDinoInfoFromData(name);
    if (dinoInfo) {
        longitud = dinoInfo.LONGITUD || "Desconocido";
        peso = dinoInfo.PESO || "Desconocido";
    }

    // Scraping de Wikipedia (especie completa)
    let details = await scrapeWikiForDino(name, longitud, peso);
    if (!details || !details.description || details.description === "Sin descripción") {
        // Si no encuentra, intenta con el género (primera palabra)
        const genus = name.split(' ')[0];
        details = await scrapeWikiForDino(genus, longitud, peso);
        details.name = name; // Muestra el nombre completo seleccionado
    }
    console.log('Detalles encontrados:', details);
    return details;
}

async function scrapeWikiForDino(name, longitud, peso) {
    try {
        const formattedName = encodeURIComponent(name.trim());
        const searchResponse = await axios.get(`https://es.wikipedia.org/wiki/${formattedName}`);
        if (searchResponse.status === 200) {
            const $ = cheerio.load(searchResponse.data);
            const nombre = $('h1').text() || name;
            const descriptionRaw = $('p').first().text() || "Sin descripción";
            const description = descriptionRaw.replace(/\[[^\]]*\]/g, '').trim();
            const period = description.match(/(Triásico|Jurásico|Cretácico)/i)?.[0] || 'Desconocido';
            let image = $('table.infobox img').first().attr('src') || '';
            if (image && image.startsWith('//')) image = 'https:' + image;

            const didacticImages = await getDidacticImages(name, 5); // O el número que prefieras

            return {
                name: nombre,
                description,
                period,
                image: didacticImages[0] || image, // La principal
                images: didacticImages,            // Todas las encontradas
                longitud,
                peso
            };
        }
    } catch (error) {}
    return {
        name,
        description: "Sin descripción",
        period: "Desconocido",
        image: "",
        longitud,
        peso
    };
}

// --- Scraping por periodo (igual que tu código) ---
async function fetchDinosaurSpecies(url) {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            const speciesList = [];
            // Selecciona correctamente los enlaces de especies
            $('div.mw-category-group ul li a').each((index, element) => {
                const speciesName = $(element).text().trim();
                if (speciesName) speciesList.push(speciesName); // <-- Evita undefined
            });
            console.log('Especies encontradas:', speciesList);
            return speciesList;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

async function fetchJurassicSuperiorSpecies() {
    const url1 = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Jur%C3%A1sico_Superior';
    const url2 = 'https://es.wikipedia.org/w/index.php?title=Categor%C3%ADa:Dinosaurios_del_Jur%C3%A1sico_Superior&pagefrom=Xiaotingia+zhengi#mw-pages';
    const speciesList1 = await fetchDinosaurSpecies(url1);
    const speciesList2 = await fetchDinosaurSpecies(url2);
    return speciesList1.concat(speciesList2);
}
async function fetchCretaceousInferiorSpecies() {
    const url1 = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Inferior';
    const url2 = 'https://es.wikipedia.org/w/index.php?title=Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Inferior&pagefrom=Ningyuansaurus+wangi#mw-pages';
    const speciesList1 = await fetchDinosaurSpecies(url1);
    const speciesList2 = await fetchDinosaurSpecies(url2);
    return speciesList1.concat(speciesList2);
}
async function fetchCretaceousSuperiorSpecies() {
    const url1 = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Superior';
    const url2 = 'https://es.wikipedia.org/w/index.php?title=Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Superior&pagefrom=Deltadromeus+agilis#mw-pages';
    const url3 = 'https://es.wikipedia.org/w/index.php?title=Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Superior&pagefrom=Masiakasaurus+knopfleri#mw-pages';
    const url4 = 'https://es.wikipedia.org/w/index.php?title=Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Superior&pagefrom=Shuvuuia+deserti#mw-pages';
    const speciesList1 = await fetchDinosaurSpecies(url1);
    const speciesList2 = await fetchDinosaurSpecies(url2);
    const speciesList3 = await fetchDinosaurSpecies(url3);
    const speciesList4 = await fetchDinosaurSpecies(url4);
    return speciesList1.concat(speciesList2).concat(speciesList3).concat(speciesList4);
}

// Para búsqueda por periodo simple:
async function searchDinosaurByPeriod(periodUrl) {
    return fetchDinosaurSpecies(periodUrl);
}

// Función para obtener imágenes didácticas
async function getDidacticImages(dinoName, maxImages = 5) {
    const keywords = [
        'restoration',
        'life reconstruction',
        'paleoart',
        'paleoconstruction',
        'life restoration',
        'reconstruction',
        'paleoreconstruction'
    ];
    const images = new Set();

    for (const keyword of keywords) {
        try {
            const commonsSearchResponse = await axios.get('https://commons.wikimedia.org/w/api.php', {
                params: {
                    action: 'query',
                    format: 'json',
                    list: 'search',
                    srsearch: `${dinoName} ${keyword}`,
                    srlimit: maxImages,
                    srnamespace: 6
                }
            });

            if (
                commonsSearchResponse.data.query &&
                commonsSearchResponse.data.query.search
            ) {
                for (const result of commonsSearchResponse.data.query.search) {
                    const commonsImage = result.title;
                    const imageUrl = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(commonsImage) + '?width=400';
                    images.add(imageUrl);
                    if (images.size >= maxImages) break;
                }
            }
            if (images.size >= maxImages) break;
        } catch (error) {
            // Puedes loguear el error si quieres
        }
    }
    return Array.from(images);
}

function getDinoInfoFromData(name) {
    const normalized = name.trim().toLowerCase();
    return dinosaurData.find(d =>
        d.NOMBRE && d.NOMBRE.trim().toLowerCase() === normalized
    );
}

// Exporta las funciones necesarias
module.exports = {
    searchDinosaurByName,
    getDinosaurDetails,
    searchDinosaurByPeriod,
    fetchJurassicSuperiorSpecies,
    fetchCretaceousInferiorSpecies,
    fetchCretaceousSuperiorSpecies,
    getDidacticImages
};
