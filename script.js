document.getElementById('searchType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('nameInput').style.display = (type === 'nombre') ? '' : 'none';
    document.getElementById('periodInput').style.display = (type === 'periodo') ? '' : 'none';
    document.getElementById('subcategoryForm').style.display = (type === 'periodo') ? '' : 'none';
    document.getElementById('dinoSelectionForm').style.display = 'none';
    document.getElementById('results').innerHTML = '';
});

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchType = document.getElementById('searchType').value;
    const query = searchType === 'nombre' ? document.getElementById('dinoName').value : document.getElementById('period').value;
    if (searchType === 'periodo') {
        const subcategorySelect = document.getElementById('subcategory');
        subcategorySelect.innerHTML = ''; // Clear existing options
        if (query.toLowerCase() === 'jurásico') {
            subcategorySelect.innerHTML = `
                <option value="1">Inferior</option>
                <option value="2">Medio</option>
                <option value="3">Superior</option>
            `;
        } else if (query.toLowerCase() === 'cretácico') {
            subcategorySelect.innerHTML = `
                <option value="1">Inferior</option>
                <option value="2">Superior</option>
            `;
        }
        document.getElementById('subcategoryForm').style.display = 'block';
        document.getElementById('results').innerHTML = '';
    } else {
        if (!query.trim()) {
            document.getElementById('results').innerHTML = '<span style="color:red;">Introduce un nombre válido.</span>';
            document.getElementById('dinoSelectionForm').style.display = 'none';
            return;
        }
        fetch(`/search?type=nombre&query=${encodeURIComponent(query.trim())}`)
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    document.getElementById('results').innerHTML = '<span style="color:red;">Nombre erróneo, sugerencia buscar por periodo</span>';
                    document.getElementById('dinoSelectionForm').style.display = 'none';
                    return;
                }
                displaySpeciesSelection(data);
            });
    }
});

document.getElementById('subcategoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchType = 'periodo';
    const query = document.getElementById('period').value;
    const subcategory = document.getElementById('subcategory').value;
    fetch(`/search?type=${searchType}&query=${query}&subcategory=${subcategory}`)
        .then(response => response.json())
        .then(data => {
            displaySpeciesSelection(data);
        });
});

document.getElementById('dinoSelectionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const dinoNumber = document.getElementById('dinoNumber').value;
    const selectedDino = speciesList[dinoNumber - 1];
    console.log('Petición a /species con:', selectedDino);
    fetch(`/species?name=${encodeURIComponent(selectedDino)}`)
        .then(res => res.json())
        .then(data => {
            console.log('Respuesta del backend:', data);
            displayResults([data]);
        });
});


function displaySpeciesSelection(data) {
    setRandomBackground(); // Cambia el fondo cada vez que se muestra la lista
    speciesList = data;
    const resultsDiv = document.getElementById('results'); // <-- Asegúrate de definir esto aquí
    resultsDiv.innerHTML = '';
    if (data.length > 0) {
        data.forEach((item, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'species-list-item'; // Para estilos
            resultItem.innerHTML = `<strong>${index + 1}. ${item}</strong>`;
            resultsDiv.appendChild(resultItem);
        });
        document.getElementById('dinoSelectionForm').style.display = 'block';
    } else {
        resultsDiv.innerHTML = 'No se encontraron resultados.';
    }
}



// let currentBgIndex = Math.floor(Math.random() * backgrounds.length);

function setBackground(index) {
    const bg = backgrounds[index];
    const url = `/backgrounds/${bg}`;
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundColor = '#222';
}

function setRandomBackground() {
    currentBgIndex = Math.floor(Math.random() * backgrounds.length);
    setBackground(currentBgIndex);
}

// Cambia el fondo al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    setRandomBackground();
    // Cambia el fondo cada 10 segundos
    setInterval(() => {
        currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
        setBackground(currentBgIndex);
    }, 10000);
});

// Llama a esta función tras cada búsqueda exitosa
// Ejemplo: después de mostrar resultados
function displayResults(dataArray) {
    setRandomBackground(); // Cambia el fondo
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    dataArray.forEach(data => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.image}" style="max-width:100%; border-radius:12px; margin-bottom:1em;">
            <p>${data.description}</p>
            <p><strong>Periodo:</strong> ${data.period}</p>
            <p><strong>Longitud:</strong> ${data.longitud}</p>
            <p><strong>Peso:</strong> ${data.peso}</p>
        `;
        resultsDiv.appendChild(card);
    });
}

let speciesList = [];

document.getElementById('searchType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('nameInput').style.display = (type === 'nombre') ? '' : 'none';
    document.getElementById('periodInput').style.display = (type === 'periodo') ? '' : 'none';
    document.getElementById('subcategoryForm').style.display = (type === 'periodo') ? '' : 'none';
    document.getElementById('dinoSelectionForm').style.display = 'none';
    document.getElementById('results').innerHTML = '';
});

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchType = document.getElementById('searchType').value;
    const query = searchType === 'nombre' ? document.getElementById('dinoName').value : document.getElementById('period').value;
    if (searchType === 'periodo') {
        const subcategorySelect = document.getElementById('subcategory');
        subcategorySelect.innerHTML = ''; // Clear existing options
        if (query.toLowerCase() === 'jurásico') {
            subcategorySelect.innerHTML = `
                <option value="1">Inferior</option>
                <option value="2">Medio</option>
                <option value="3">Superior</option>
            `;
        } else if (query.toLowerCase() === 'cretácico') {
            subcategorySelect.innerHTML = `
                <option value="1">Inferior</option>
                <option value="2">Superior</option>
            `;
        }
        document.getElementById('subcategoryForm').style.display = 'block';
        document.getElementById('results').innerHTML = '';
    } else {
        if (!query.trim()) {
            document.getElementById('results').innerHTML = '<span style="color:red;">Introduce un nombre válido.</span>';
            document.getElementById('dinoSelectionForm').style.display = 'none';
            return;
        }
        fetch(`/search?type=nombre&query=${encodeURIComponent(query.trim())}`)
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    document.getElementById('results').innerHTML = '<span style="color:red;">Nombre erróneo, sugerencia buscar por periodo</span>';
                    document.getElementById('dinoSelectionForm').style.display = 'none';
                    return;
                }
                displaySpeciesSelection(data);
            });
    }
});

document.getElementById('subcategoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchType = 'periodo';
    const query = document.getElementById('period').value;
    const subcategory = document.getElementById('subcategory').value;
    fetch(`/search?type=${searchType}&query=${query}&subcategory=${subcategory}`)
        .then(response => response.json())
        .then(data => {
            displaySpeciesSelection(data);
        });
});

document.getElementById('dinoSelectionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const dinoNumber = document.getElementById('dinoNumber').value;
    const selectedDino = speciesList[dinoNumber - 1];
    console.log('Petición a /species con:', selectedDino);
    fetch(`/species?name=${encodeURIComponent(selectedDino)}`)
        .then(res => res.json())
        .then(data => {
            console.log('Respuesta del backend:', data);
            displayResults([data]);
        });
});

function displaySpeciesSelection(data) {
    setRandomBackground(); // Cambia el fondo cada vez que se muestra la lista
    speciesList = data;
    const resultsDiv = document.getElementById('results'); // <-- Asegúrate de definir esto aquí
    resultsDiv.innerHTML = '';
    if (data.length > 0) {
        data.forEach((item, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'species-list-item'; // Para estilos
            resultItem.innerHTML = `<strong>${index + 1}. ${item}</strong>`;
            resultsDiv.appendChild(resultItem);
        });
        document.getElementById('dinoSelectionForm').style.display = 'block';
    } else {
        resultsDiv.innerHTML = 'No se encontraron resultados.';
    }
}


// Lista de nombres de tus imágenes de fondo (colócalas en /public/backgrounds/)
const backgrounds = [
    'Ankylosaurus.png',
    'Allosaurus.jpeg',
    'Carnotaurus.png',
    'Giganotosaurus.jpeg',
    'Deinonychus.png',
    'Iguanodon.jpeg',
    'Psittacosaurus.jpg',
    'Spinosaurus.png',
    'Triceratops.jpeg',
    'Utahraptor.png',
    'Velociraptor.png',
    'Yutyrannus.png',
    'Anchiornis.png',    
    'Archaeopteryx.jpeg',
    'Brachiosaurus.jpeg',
    'Dilophosaurus.jpeg',
    'Diplodocus.jpeg',
    'Gallimimus.jpeg',
    'Pachycephalosaurus.jpeg',
    'Oviraptor.jpeg',
    'Parasaurolophus.jpeg',
    'Pteranodon.jpeg',
    'Quetzalcoatlus.jpeg',
    'Yutyrannus2.png',
    'Therizinosaurus.jpeg',
    'Tyrannosaurus.png',
    'Stegosaurus.jpeg',
    'Concavenator.jpeg',
    // ...añade los que quieras
];

let currentBgIndex = Math.floor(Math.random() * backgrounds.length);

function setBackground(index) {
    const bg = backgrounds[index];
    const url = `/backgrounds/${bg}`;
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundColor = '#222';
}

function setRandomBackground() {
    currentBgIndex = Math.floor(Math.random() * backgrounds.length);
    setBackground(currentBgIndex);
}

// Cambia el fondo al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    setRandomBackground();
    // Cambia el fondo cada 10 segundos
    setInterval(() => {
        currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
        setBackground(currentBgIndex);
    }, 10000);
});

// Llama a esta función tras cada búsqueda exitosa
// Ejemplo: después de mostrar resultados
function displayResults(dataArray) {
    setRandomBackground(); // Cambia el fondo
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    dataArray.forEach(data => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.image}" style="max-width:100%; border-radius:12px; margin-bottom:1em;">
            <p>${data.description}</p>
            <p><strong>Periodo:</strong> ${data.period}</p>
            <p><strong>Longitud:</strong> ${data.longitud}</p>
            <p><strong>Peso:</strong> ${data.peso}</p>
        `;
        resultsDiv.appendChild(card);
    });
}
