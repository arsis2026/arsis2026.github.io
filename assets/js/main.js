// catalogoData ya está disponible desde catalogo/index.html

function inicializarFiltros() {
    // Filtramos para no incluir el placeholder en las opciones del filtro
    const datosReales = catalogoData.filter(p => !p.es_placeholder);
    const compositores = [...new Set(datosReales.map(p => p.compositor))].sort();
    const generos = [...new Set(datosReales.map(p => p.genero))].sort();
    
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
    
    // Filtramos solo las partituras reales
    let filtrado = catalogoData.filter(p => !p.es_placeholder);
    
    if (compositor) filtrado = filtrado.filter(p => p.compositor === compositor);
    if (dotacion) filtrado = filtrado.filter(p => p.dotacion === dotacion);
    if (genero) filtrado = filtrado.filter(p => p.genero === genero);
    if (nivel) filtrado = filtrado.filter(p => p.nivel === nivel);
    
    // Si hay filtros activos, mostramos solo los resultados. 
    // Si no hay filtros, agregamos el placeholder al final.
    const hayFiltrosActivos = compositor || dotacion || genero || nivel;
    
    if (!hayFiltrosActivos) {
        const placeholder = catalogoData.find(p => p.es_placeholder);
        if (placeholder) filtrado.push(placeholder);
    }
    
    mostrarPartituras(filtrado);
}

function limpiarFiltros() {
    document.getElementById('filtro-compositor').value = '';
    document.getElementById('filtro-dotacion').value = '';
    document.getElementById('filtro-genero').value = '';
    document.getElementById('filtro-nivel').value = '';
    
    // Al limpiar, volvemos a incluir el placeholder
    const datosReales = catalogoData.filter(p => !p.es_placeholder);
    const placeholder = catalogoData.find(p => p.es_placeholder);
    
    const datosFinales = placeholder ? [...datosReales, placeholder] : datosReales;
    mostrarPartituras(datosFinales);
}

function mostrarPartituras(partituras) {
    const contenedor = document.getElementById('catalogo-partituras');
    const contador = document.getElementById('contador-partituras');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    // El contador solo cuenta las partituras reales, no el placeholder
    const cantidadReal = partituras.filter(p => !p.es_placeholder).length;
    if (contador) contador.textContent = cantidadReal;
    
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
    
    // === LÓGICA ESPECIAL PARA EL PLACEHOLDER ===
    if (partitura.es_placeholder) {
        card.className = 'partitura-card placeholder';
        card.innerHTML = `
            <div class="partitura-portada">🎼</div>
            <div class="partitura-info">
                <h3 class="partitura-titulo">${partitura.titulo}</h3>
                <p class="partitura-compositor">${partitura.compositor}</p>
                <p class="partitura-descripcion">${partitura.descripcion}</p>
                <a href="mailto:arsisediciones@proton.me?subject=Quiero%20publicar%20mi%20obra" class="btn-ver-mas">
                    Enviar mi obra
                </a>
            </div>
        `;
        return card;
    }

    // === LÓGICA NORMAL PARA PARTITURAS REALES ===
    card.className = 'partitura-card';
    
    const portadaHTML = partitura.portada 
        ? `<img src="/imagenes/${partitura.portada}" alt="${partitura.titulo}" style="width:100%; height:100%; object-fit:cover;">` 
        : '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#666; font-style:italic;">Sin portada</div>';
    
    // Manejo seguro del precio (evita "$Consultar" si el valor es texto)
    const precioTexto = typeof partitura.precio === 'number' 
        ? `$${partitura.precio}` 
        : partitura.precio;
    
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
            <a href="mailto:arsisediciones@proton.me?subject=Me interesa la partitura: ${encodeURIComponent(partitura.titulo)}&body=Hola, estoy interesado en adquirir la partitura ${encodeURIComponent(partitura.titulo)} de ${encodeURIComponent(partitura.compositor)}. ¿Podrían darme más información?%0A%0AGracias." class="btn-ver-mas">
                Ver detalles
            </a>
        </div>
    `;
    
    return card;
}

function mostrarDestacados() {
    const contenedor = document.getElementById('partituras-destacadas');
    if (!contenedor) return;
    
    // Filtramos para no mostrar el placeholder en destacados
    const destacados = catalogoData.filter(p => p.destacado === true && !p.es_placeholder).slice(0, 3);
    
    destacados.forEach(partitura => {
        const card = crearCardPartitura(partitura);
        contenedor.appendChild(card);
    });
}

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    if (typeof catalogoData !== 'undefined' && catalogoData && catalogoData.length > 0) {
        inicializarFiltros();
        
        // Al cargar, mostramos todo incluyendo el placeholder al final
        const datosReales = catalogoData.filter(p => !p.es_placeholder);
        const placeholder = catalogoData.find(p => p.es_placeholder);
        const datosIniciales = placeholder ? [...datosReales, placeholder] : datosReales;
        
        mostrarPartituras(datosIniciales);
        mostrarDestacados();
    } else {
        console.error('No se encontraron datos del catálogo');
    }
});
