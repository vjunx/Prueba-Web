// Mostrar/ocultar campos según el tipo de búsqueda
document.getElementById('searchType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('nameInput').style.display = (type === 'nombre') ? '' : 'none';
    document.getElementById('dinoSelectionForm').style.display = 'none';
    document.getElementById('results').innerHTML = '';
});

// Búsqueda por nombre
document.getElementById('searchForm').addEventListener('submit', function(event) {
    const type = document.getElementById('searchType').value;
    if (type !== 'nombre') return; // Solo si es búsqueda por nombre
    event.preventDefault();

    const dinoName = document.getElementById('dinoName').value.trim();
    if (!dinoName) return;

    fetch(`/search?type=nombre&query=${encodeURIComponent(dinoName)}`)
        .then(res => res.json())
        .then(data => {
            speciesList = data;
            const resultsDiv = document.getElementById('results');
            if (!speciesList.length) {
                resultsDiv.innerHTML = '<span style="color:red;">Nombre erróneo, sugerencia buscar por periodo</span>';
                document.getElementById('dinoSelectionForm').style.display = 'none';
                return;
            }
            // Mostrar lista numerada
            let html = `<b>Especies de ${dinoName} encontradas:</b><br><ol>`;
            speciesList.forEach((sp, idx) => {
                html += `<li>${sp}</li>`;
            });
            html += '</ol>';
            resultsDiv.innerHTML = html;
            // Mostrar formulario para elegir especie
            document.getElementById('dinoSelectionForm').style.display = '';
            document.getElementById('dinoNumber').value = '';
        });
});

// Selección de especie por número
document.getElementById('dinoSelectionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const idx = parseInt(document.getElementById('dinoNumber').value, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= speciesList.length) {
        document.getElementById('results').innerHTML += '<br><span style="color:red;">Número inválido.</span>';
        return;
    }
    const sp = speciesList[idx];
    // Petición para obtener los detalles
    fetch(`/species?name=${encodeURIComponent(sp)}`)
        .then(res => res.json())
        .then(details => {
            let html = `<b>Has elegido: ${details.name}</b><br>`;
            html += `<pre>${JSON.stringify(details, null, 2)}</pre>`;
            document.getElementById('results').innerHTML += html;
        });
});

let speciesList = [];

// Mostrar/ocultar campos según el tipo de búsqueda
document.getElementById('searchType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('nameInput').style.display = (type === 'nombre') ? '' : 'none';
    document.getElementById('dinoSelectionForm').style.display = 'none';
    document.getElementById('results').innerHTML = '';
});

// Búsqueda por nombre
document.getElementById('searchForm').addEventListener('submit', function(event) {
    const type = document.getElementById('searchType').value;
    if (type !== 'nombre') return; // Solo si es búsqueda por nombre
    event.preventDefault();

    const dinoName = document.getElementById('dinoName').value.trim();
    if (!dinoName) return;

    fetch(`/search?type=nombre&query=${encodeURIComponent(dinoName)}`)
        .then(res => res.json())
        .then(data => {
            speciesList = data;
            const resultsDiv = document.getElementById('results');
            if (!speciesList.length) {
                resultsDiv.innerHTML = '<span style="color:red;">Nombre erróneo, sugerencia buscar por periodo</span>';
                document.getElementById('dinoSelectionForm').style.display = 'none';
                return;
            }
            // Mostrar lista numerada
            let html = `<b>Especies de ${dinoName} encontradas:</b><br><ol>`;
            speciesList.forEach((sp, idx) => {
                html += `<li>${sp}</li>`;
            });
            html += '</ol>';
            resultsDiv.innerHTML = html;
            // Mostrar formulario para elegir especie
            document.getElementById('dinoSelectionForm').style.display = '';
            document.getElementById('dinoNumber').value = '';
        });
});

// Selección de especie por número
document.getElementById('dinoSelectionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const idx = parseInt(document.getElementById('dinoNumber').value, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= speciesList.length) {
        document.getElementById('results').innerHTML += '<br><span style="color:red;">Número inválido.</span>';
        return;
    }
    const sp = speciesList[idx];
    // Petición para obtener los detalles
    fetch(`/species?name=${encodeURIComponent(sp)}`)
        .then(res => res.json())
        .then(details => {
            let html = `<b>Has elegido: ${details.name}</b><br>`;
            html += `<pre>${JSON.stringify(details, null, 2)}</pre>`;
            document.getElementById('results').innerHTML += html;
        });
});