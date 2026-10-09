// catalogoData ya está disponible desde catalogo/index.html

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
    
    document.getElementById('filtro-compositor')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-dotacion')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-genero')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-nivel')?.addEventListener('change', aplicarFiltros);
    document.getElementById('limpiar-filtros')?.addEventListener('click', limpiarFiltros);
}

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

function limpiarFiltros() {
    document.getElementById('filtro-compositor').value = '';
    document.getElementById('filtro-dotacion').value = '';
    document.getElementById('filtro-genero').value = '';
    document.getElementById('filtro-nivel').value = '';
    mostrarPartituras(catalogoData);
}

function mostrarPartituras(partituras) {
    const contenedor = document.getElementById('catalogo-partituras');
    const contador = document.getElementById('contador-partituras');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    if (contador) contador.textContent = partituras.length;
    
    if (partituras.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">No se encontraron partituras con esos filtros.</p>';
        return;
    }
    
    partituras.forEach(partitura => {
        const card = crearCardPartitura(partitura);
        contenedor.appendChild(card);
    });
}

function crearCardPartitura(partitura) {
    const card = document.createElement('div');
    card.className = 'partitura-card';
    
    const portadaHTML = partitura.portada 
        ? `<img src="/imagenes/${partitura.portada}" alt="${partitura.titulo}" style="width:100%; height:100%; object-fit:cover;">` 
        : '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#666; font-style:italic;">Sin portada</div>';
    
    const precioTexto = typeof partitura.precio === 'string' 
        ? `$${partitura.precio}` 
        : `$${partitura.precio} USD`;
    
    card.innerHTML = `
        <div class="partitura-portada">
            ${portadaHTML}
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
            <div class="partitura-precio">${precioTexto}</div>
               <button class="btn-ver-mas" onclick="window.location.href='mailto:contacto@arsisediciones.com?subject=Me interesa la partitura: ${encodeURIComponent(partitura.titulo)}&body=Hola, estoy interesado en adquirir la partitura ${encodeURIComponent(partitura.titulo)} de ${encodeURIComponent(partitura.compositor)}. ¿Podrían darme más información?%0A%0AGracias.'">Ver detalles</button>
        </div>
    `;
    
    return card;
}

function mostrarDestacados() {
    const contenedor = document.getElementById('partituras-destacadas');
    if (!contenedor) return;
    
    const destacados = catalogoData.filter(p => p.destacado === true).slice(0, 3);
    
    destacados.forEach(partitura => {
        const card = crearCardPartitura(partitura);
        contenedor.appendChild(card);
    });
}

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    if (typeof catalogoData !== 'undefined' && catalogoData && catalogoData.length > 0) {
        inicializarFiltros();
        mostrarPartituras(catalogoData);
        mostrarDestacados();
    } else {
        console.error('No se encontraron datos del catálogo');
    }
});
