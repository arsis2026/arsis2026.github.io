// Cargar catálogo desde el archivo YAML
let catalogoData = [];

// Función para cargar el catálogo
async function cargarCatalogo() {
    try {
        const response = await fetch('/data/catalogo.yml');
        const text = await response.text();
        // Parsear YAML simple (en producción usar una librería como js-yaml)
        catalogoData = parseYAML(text);
        inicializarFiltros();
        mostrarPartituras(catalogoData);
        mostrarDestacados();
    } catch (error) {
        console.error('Error cargando el catálogo:', error);
    }
}

// Parseador YAML simple (para evitar dependencias)
function parseYAML(yamlText) {
    // Implementación básica - en producción usar js-yaml
    const lines = yamlText.split('\n');
    const result = { partituras: [] };
    let currentPartitura = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('- id:')) {
            if (currentPartitura) {
                result.partituras.push(currentPartitura);
            }
            currentPartitura = { id: parseInt(line.split(':')[1].trim()) };
        } else if (line.includes(':') && currentPartitura && !line.startsWith('-')) {
            const [key, value] = line.split(':');
            let cleanValue = value.trim().replace(/"/g, '').replace(/'/g, '');
            if (cleanValue === 'true') cleanValue = true;
            if (cleanValue === 'false') cleanValue = false;
            if (!isNaN(cleanValue) && typeof cleanValue !== 'boolean') {
                cleanValue = parseFloat(cleanValue);
            }
            currentPartitura[key.trim()] = cleanValue;
        }
    });
    
    if (currentPartitura) {
        result.partituras.push(currentPartitura);
    }
    
    return result.partituras;
}

// Inicializar filtros
function inicializarFiltros() {
    const compositores = [...new Set(catalogoData.map(p => p.compositor))].sort();
    const generos = [...new Set(catalogoData.map(p => p.genero))].sort();
    
    const selectCompositor = document.getElementById('filtro-compositor');
    if (selectCompositor) {
        compositores.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp;
            option.textContent = comp;
            selectCompositor.appendChild(option);
        });
    }
    
    const selectGenero = document.getElementById('filtro-genero');
    if (selectGenero) {
        generos.forEach(gen => {
            const option = document.createElement('option');
            option.value = gen;
            option.textContent = gen;
            selectGenero.appendChild(option);
        });
    }
    
    // Agregar event listeners
    document.getElementById('filtro-compositor')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-dotacion')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-genero')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-nivel')?.addEventListener('change', aplicarFiltros);
    document.getElementById('limpiar-filtros')?.addEventListener('click', limpiarFiltros);
}

// Aplicar filtros
function aplicarFiltros() {
    const compositor = document.getElementById('filtro-compositor').value;
    const dotacion = document.getElementById('filtro-dotacion').value;
    const genero = document.getElementById('filtro-genero').value;
    const nivel = document.getElementById('filtro-nivel').value;
    
    let filtrado = catalogoData;
    
    if (compositor) filtrado = filtrado.filter(p => p.compositor === compositor);
    if (dotacion) filtrado = filtrado.filter(p => p.dotacion === dotacion);
    if (genero) filtrado = filtrado.filter(p => p.genero === genero);
    if (nivel) filtrado = filtrado.filter(p => p.nivel === nivel);
    
    mostrarPartituras(filtrado);
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtro-compositor').value = '';
    document.getElementById('filtro-dotacion').value = '';
    document.getElementById('filtro-genero').value = '';
    document.getElementById('filtro-nivel').value = '';
    mostrarPartituras(catalogoData);
}

// Mostrar partituras
function mostrarPartituras(partituras) {
    const contenedor = document.getElementById('catalogo-partituras');
    const contador = document.getElementById('contador-partituras');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    contador.textContent = partituras.length;
    
    if (partituras.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem;">No se encontraron partituras con esos filtros.</p>';
        return;
    }
    
    partituras.forEach(partitura => {
        const card = crearCardPartitura(partitura);
        contenedor.appendChild(card);
    });
}

// Crear card de partitura
function crearCardPartitura(partitura) {
    const card = document.createElement('div');
    card.className = 'partitura-card';
    
    card.innerHTML = `
        <div class="partitura-portada">
            ${partitura.portada ? `<img src="/imagenes/${partitura.portada}" alt="${partitura.titulo}" style="width:100%; height:100%; object-fit:cover;">` : 'Sin portada'}
        </div>
        <div class="partitura-info">
            <h3 class="partitura-titulo">${partitura.titulo}</h3>
            <p class="partitura-compositor">${partitura.compositor}${partitura.arreglista ? ` (Arr. ${partitura.arreglista})` : ''}</p>
            <div class="partitura-detalles">
                <span class="tag">${partitura.dotacion}</span>
                <span class="tag">${partitura.genero}</span>
                <span class="tag">${partitura.nivel}</span>
                ${partitura.tipo ? `<span class="tag">${partitura.tipo}</span>` : ''}
            </div>
            ${partitura.descripcion ? `<p style="margin: 1rem 0; color: #666; font-size: 0.95rem;">${partitura.descripcion}</p>` : ''}
            ${partitura.duracion ? `<p style="font-size: 0.9rem; color: #666;">⏱ ${partitura.duracion}</p>` : ''}
            <div class="partitura-precio">$${partitura.precio} USD</div>
            <button class="btn-ver-mas" onclick="alert('Próximamente: Sistema de compra y descarga')">Ver detalles</button>
        </div>
    `;
    
    return card;
}

// Mostrar destacados en home
function mostrarDestacados() {
    const contenedor = document.getElementById('partituras-destacados');
    if (!contenedor) return;
    
    const destacados = catalogoData.filter(p => p.destacado === true).slice(0, 3);
    
    destacados.forEach(partitura => {
        const card = crearCardPartitura(partitura);
        contenedor.appendChild(card);
    });
}

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', cargarCatalogo);
