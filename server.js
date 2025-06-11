const express = require('express');
const {
    searchDinosaurByPeriod,
    fetchJurassicSuperiorSpecies,
    fetchCretaceousInferiorSpecies,
    fetchCretaceousSuperiorSpecies,
    getDinosaurDetails
} = require('./Dcatalog');
const { searchDinosaurByName } = require('./Buscadino');
const app = express();
const port = 3001;

app.use(express.static('Public'));

app.get('/search', async (req, res) => {
    const { type, query, subcategory } = req.query;
    let results = [];
    if (type === 'nombre') {
        results = await searchDinosaurByName(query);
        return res.json(results);
    } else if (type === 'periodo') {
        const periodUrls = {
            jurásico: {
                '1': 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Jur%C3%A1sico_Inferior',
                '2': 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Jur%C3%A1sico_Medio',
                '3': 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Jur%C3%A1sico_Superior'
            },
            cretácico: {
                '1': 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Inferior',
                '2': 'https://es.wikipedia.org/wiki/Categor%C3%ADa:Dinosaurios_del_Cret%C3%A1cico_Superior'
            }
        };
        const period = periodUrls[query.toLowerCase()];
        console.log('Query:', query, 'Period:', period); // <-- Añade este log
        if (!period) {
            return res.json([]);
        }
        if (subcategory) {
            let results = [];
            if (query.toLowerCase() === 'jurásico' && subcategory === '3') {
                // Jurásico Superior: usa función especial
                results = await fetchJurassicSuperiorSpecies();
            } else if (query.toLowerCase() === 'cretácico' && subcategory === '1') {
                // Cretácico Inferior: usa función especial
                results = await fetchCretaceousInferiorSpecies();
            } else if (query.toLowerCase() === 'cretácico' && subcategory === '2') {
                // Cretácico Superior: usa función especial
                results = await fetchCretaceousSuperiorSpecies();
            } else {
                // Otras subcategorías: usa la función normal
                results = await searchDinosaurByPeriod(period[subcategory]);
            }
            return res.json(results);
        } else {
            const urls = Object.values(period);
            console.log('Buscando todas las subcategorías:', urls);
            const allResults = await Promise.all(
                urls.map(url => searchDinosaurByPeriod(url))
            );
            results = allResults.flat().filter(Boolean);
            console.log('Resultados:', results);
        }
    }
    results = results.filter(Boolean);
    res.json(results);
});

app.get('/species', async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'No species name provided' });
    const details = await getDinosaurDetails(name);
    res.json(details);
});

// Ejemplo en React o JS puro
// fetch('/search?type=periodo&query=jurásico&subcategory=1')
//   .then(res => res.json())
//   .then(data => {
//     // data debe ser un array de dinosaurios
//     data.forEach(dino => {
//       // Mostrar cada dino en la interfaz
//       // Por ejemplo, crear un <li> por cada uno
//     });
//   });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
