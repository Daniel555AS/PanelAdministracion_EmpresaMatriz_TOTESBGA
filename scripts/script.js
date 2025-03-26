// Function to dynamically load sections
function cargarSeccion(seccion) {
    const contenido = document.getElementById('contenido'); // Gets the container to display the content

    // Object storing the HTML content for each section
    const secciones = {
        'dashboard': `
            <h1>Inicio</h1>
            <p>Bienvenido al panel administrativo. Selecciona una opción para continuar.</p>
        `, // Dashboard section with a welcome message

        'items': `
            <h1>Ítems</h1>
            <!-- Button to refresh the items -->
            <div class="refresh-container" onclick="cargarItems()">
                <div class="refresh-logo">⟳</div>
            </div>
            <!-- Container for the item list -->
            <div id="lista-items" class="item-list">
                <p>Cargando ítems...</p>
            </div>
        `, // Items section with a refresh button and placeholder content

        'usuarios': `
            <h1>Administrar Usuarios</h1>
            <!-- Refresh logo -->
            <div class="refresh-container" onclick="cargarUsuarios()">
                <div class="refresh-logo">⟳</div>
            </div>
            <!-- Container for the user list -->
            <div id="lista-usuarios" class="user-list">
                <p>Cargando usuarios...</p>
            </div>
        `, // Users section with a message for administrators only

        'comentarios': `
            <h1>Comentarios</h1>
            <!-- Refresh logo -->
            <div class="refresh-container" onclick="cargarComentarios()">
                <div class="refresh-logo">⟳</div>
            </div>
            <!-- Container for the comment list -->
            <div id="lista-comentarios" class="comment-list">
                <p>Cargando comentarios...</p>
            </div>
        ` // Comments section with a refresh button and placeholder content
    };

    // Updates the content based on the selected section or shows an error message if not found
    contenido.innerHTML = secciones[seccion] || `<h1>Sección no encontrada</h1>`;

    // Loads data from the API when "comentarios" or "items" section is selected
    if (seccion === 'comentarios') {
        cargarComentarios(); // Calls the function to load comments
    } else if (seccion === 'items') {
        cargarItems(); // Calls the function to load items
    } else if (seccion === 'usuarios') {
        cargarUsuarios(); // Calls the function to load users
    }
}

// Asynchronous function to load user data from an API
async function cargarUsuarios() {
    // Get the HTML element where the user list will be displayed
    const listaUsuarios = document.getElementById('lista-usuarios');

    try {
        // Fetch user data from the API
        const respuesta = await fetch('http://localhost:8080/user');

        // Check if the request was successful (status code 200-299)
        if (!respuesta.ok) throw new Error('Error loading users');

        // Parse the JSON response and render the user interface
        const usuarios = await respuesta.json();
        renderizarInterfaz(usuarios);
    } catch (error) {
        // Display an error message in the UI if the fetch operation fails
        listaUsuarios.innerHTML = `<p>Error loading users: ${error.message}</p>`;
    }
}

// Function to render the user interface dynamically
function renderizarInterfaz(usuarios) {
    // Get the container where the user list will be displayed
    const contenedor = document.getElementById('lista-usuarios');
    
    // Create a container for the search functionality
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');

    // Create the search button (magnifying glass icon)
    const searchBtn = document.createElement('button');
    searchBtn.innerHTML = '🔍';
    searchBtn.classList.add('search-btn');

    // Create the search input field (filters users by ID)
    const searchInput = document.createElement('input');
    searchInput.type = 'number';
    searchInput.id = 'searchInput';
    searchInput.classList.add('search-input');
    searchInput.placeholder = 'Enter ID';

    // Append the search elements to the search container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchBtn);

    // Clear the previous content before rendering new elements
    contenedor.innerHTML = '';
    contenedor.appendChild(searchContainer);

    // Create the user table dynamically
    const tabla = document.createElement('table');
    tabla.classList.add('tabla-users');
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>User Status</th>
                <th>ID Type</th>
            </tr>
        </thead>
        <tbody id="tabla-body">
            ${generarFilasUsuarios(usuarios)} <!-- Generate table rows dynamically -->
        </tbody>
    `;

    // Append the table to the container
    contenedor.appendChild(tabla);

    // Event listener for the search button (toggles search input visibility)
    searchBtn.addEventListener('click', () => {
        searchInput.classList.toggle('active'); // Show or hide the search input
        if (searchInput.classList.contains('active')) {
            searchInput.focus(); // Focus input when active
        } else {
            searchInput.value = ''; // Clear input when hidden
            actualizarTabla(usuarios); // Restore the full user list
        }
    });

    // Event listener for filtering users dynamically based on input value
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim(); // Get trimmed input value
        if (searchTerm === '') {
            actualizarTabla(usuarios); // Reset the table when input is cleared
        } else {
            // Filter users whose ID contains the search term
            const filtrados = usuarios.filter(usuario => usuario.id.toString().includes(searchTerm));
            actualizarTabla(filtrados); // Update table with filtered results
        }
    });
}

// Function to generate table rows with user data
function generarFilasUsuarios(usuarios) {
    // If there are no users, return a single row indicating no data
    if (usuarios.length === 0) {
        return '<tr><td colspan="4">No users available.</td></tr>';
    }

    // Map through the user list and generate a table row for each user
    return usuarios.map(usuario => `
        <tr class="fila-user" onclick="mostrarDetalleUser(${usuario.id})">
            <td>${usuario.id}</td> <!-- User ID -->
            <td>${usuario.email}</td> <!-- User email -->
            <td>${usuario.user_state}</td> <!-- User status -->
            <td>${usuario.user_type}</td> <!-- Type of user -->
        </tr>
    `).join(''); // Join the array of rows into a single string
}

// Function to update the table content dynamically
function actualizarTabla(usuarios) {
    // Get the table body element where user data is displayed
    const tablaBody = document.getElementById('tabla-body');
    
    // Check if the table body exists to avoid errors
    if (tablaBody) {
        // Replace the current table content with new user data
        tablaBody.innerHTML = generarFilasUsuarios(usuarios);
    }
}

// Load users when the script runs
cargarUsuarios();

// Function to Generate PDF of Inventory Report
async function generarPDFReporteInventario() {
    try {
        // Get the user's email stored in sessionStorage
        const userEmail = sessionStorage.getItem("userEmail");

        if (!userEmail) {
            alert("Acceso no autorizado. Inicia sesión primero.");
            window.location.href = "login.html";
            return;
        }

        // Get the items
        const respuestaItems = await fetch("http://localhost:8080/item", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail // Add the email to the header
            }
        });

        if (!respuestaItems.ok) throw new Error("Error al obtener los ítems");

        const items = await respuestaItems.json();
        if (items.length === 0) {
            alert("No hay ítems disponibles para generar el PDF.");
            return;
        }

        // Get item types
        const respuestaTipos = await fetch("http://localhost:8080/item-type", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail // Add the email to the header
            }
        });

        if (!respuestaTipos.ok) throw new Error("Error al obtener los tipos de ítems");

        const tiposItem = await respuestaTipos.json();
        const diccionarioTipos = {};
        tiposItem.forEach(tipo => {
            diccionarioTipos[tipo.id] = tipo.name;
        });

        // Get the current date and time
        const fechaHoraActual = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

        // Create a new PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: "portrait",
            format: "letter"
        });

        // Draw the black stripe at the top
        const pageWidth = doc.internal.pageSize.getWidth();
        const headerHeight = 25;
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 10, pageWidth, headerHeight, "F");

        //Add the text "TOTES BGA - Matriz" inside the black stripe
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("TOTES BGA - Matriz", 15, 20);

        // Add the logo to the black stripe
        const imageUrl = "assets/images/logo_totes.png";
        const imgWidth = 60;
        const imgHeight = 15;
        const imgX = pageWidth - imgWidth - 15;
        const imgY = 13;

        const img = new Image();
        img.src = imageUrl;
        img.onload = function () {
            doc.addImage(img, "PNG", imgX, imgY, imgWidth, imgHeight);

            // Margins and content positioning
            const margenDebajoFranja = 10;
            let startY = 10 + headerHeight + margenDebajoFranja;

            // Add centered title
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("Reporte General de Inventario", pageWidth / 2, startY, { align: "center" });

            // Add report description
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const descripcion = `El presente reporte general de inventario fue generado en la siguiente Fecha y Hora: ${fechaHoraActual}, el cual contiene información sobre Identificador, Nombre, Descripción, Stock, Precio de Venta, Precio de Compra, Estado y Tipo de Ítem de los vehículos presentes en el inventario de la empresa TOTES BGA - Matriz.`;

            let marginX = 15;
            let marginY = startY + 10;
            let maxWidth = pageWidth - 30;

            let textoDividido = doc.splitTextToSize(descripcion, maxWidth);
            doc.text(textoDividido, marginX, marginY);

            let startTableY = marginY + doc.getTextDimensions(textoDividido).h + 5;

            // Table columns
            const columnas = [
                "ID", "Nombre", "Descripción", "Stock", "Precio Venta", "Precio Compra", "Estado", "Tipo de Ítem"
            ];

            // Build rows with the data
            const filas = items.map(item => [
                item.id,
                item.name,
                item.description || "N/A",
                item.stock,
                `$${item.selling_price.toFixed(2)}`,
                `$${item.purchase_price.toFixed(2)}`,
                item.item_state ? "Activo" : "Inactivo",
                diccionarioTipos[item.item_type_id] || "Desconocido"
            ]);

            // Determine the width of the table and center it
            let tableWidth = 180;
            let startX = (pageWidth - tableWidth) / 2;

            // Add the table to the PDF
            doc.autoTable({
                head: [columnas],
                body: filas,
                startY: startTableY,
                theme: "striped",
                styles: { fontSize: 8, halign: "center", cellPadding: 2 },
                headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 15 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 15 },
                    7: { cellWidth: 30 }
                },
                tableWidth: "wrap",
                margin: { top: 10, bottom: 10 },
                startX: startX,
                pageBreak: "auto"
            });

            // Download the PDF
            doc.save("Reporte_General_Inventario.pdf");
        };
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Error al generar el PDF: " + error.message);
    }
}


// Function to search for an item according to the selected filter
async function buscarItem() {
    const textoBusqueda = document.getElementById('inputBusqueda').value.trim();
    const filtro = document.getElementById('filtroBusqueda').value;
    const tablaBody = document.getElementById('tablaItemsBody');

    // Get the user's email from sessionStorage
    const userEmail = sessionStorage.getItem("userEmail");

    // If the search field is empty, reload all items
    if (textoBusqueda === '') {
        cargarItems();
        return;
    }

    // Build the URL based on the selected filter
    let urlBusqueda;
    if (filtro === "id") {
        urlBusqueda = `http://localhost:8080/item/searchById?id=${encodeURIComponent(textoBusqueda)}`;
    } else {
        urlBusqueda = `http://localhost:8080/item/searchByName?name=${encodeURIComponent(textoBusqueda)}`;
    }

    try {
        const respuesta = await fetch(urlBusqueda, {
            headers: { 'Username': userEmail }
        });
        if (!respuesta.ok) throw new Error('Error en la búsqueda');

        const itemsEncontrados = await respuesta.json();
        
        // If the API returns a single object (for ID), convert it to an array
        const itemsArray = Array.isArray(itemsEncontrados) ? itemsEncontrados : [itemsEncontrados];

        // Update only the `tbody` with the results
        tablaBody.innerHTML = generarFilasTabla(itemsArray);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        tablaBody.innerHTML = `<tr><td colspan="3">No se encontraron resultados</td></tr>`;
    }
}

// Function to load all items in the table
async function cargarItems() {

    const userEmail = sessionStorage.getItem("userEmail");
    
    try {
        const respuesta = await fetch('http://localhost:8080/item', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail 
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener los ítems');

        const items = await respuesta.json();

        const tablaBody = document.getElementById('tablaItemsBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasTabla(items);
            return;
        }

        document.getElementById('lista-items').innerHTML = `
            <button class="btn-agregar-item" onclick="mostrarFormularioAgregarItem()"> + Agregar ítem 🚗</button>
            <button class="btn-agregar-tipo-item" onclick="generarPDFReporteInventario()">Descargar PDF 📄</button>

            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <input type="text" id="inputBusqueda" placeholder="Buscar ítem..." oninput="buscarItem()">
                    <select id="filtroBusqueda" onchange="buscarItem()">
                        <option value="id">ID</option>
                        <option value="name">Nombre</option>
                    </select>
                </div>
            </div>

            <table class="tabla-items">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody id="tablaItemsBody">
                    ${generarFilasTabla(items)}
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('lista-items').innerHTML = `<p>Oops... Ha ocurrido un error</p>`;
    }
}

// Function to generate table rows dynamically
function generarFilasTabla(items) {
    if (items.length === 0) {
        return `<tr><td colspan="3">No se encontraron resultados</td></tr>`;
    }

    return items.map(item => `
        <tr class="fila-item" onclick="mostrarDetalleItem(${item.id})">
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.stock}</td>
        </tr>
    `).join('');
}

// Call `cargarItems()` when the page loads
document.addEventListener('DOMContentLoaded', cargarItems);

// Function to display the details of an item
async function mostrarDetalleItem(id) {

    const userEmail = sessionStorage.getItem("userEmail");

    try {
        async function fetchData(url, errorMsg) {
            const respuesta = await fetch(url, {
                headers: { 'Username': userEmail }
            });
            if (!respuesta.ok) throw new Error(errorMsg);
            return respuesta.json();
        }

        // Upload the main data WITHOUT the additional costs
        const [item, tiposDeItem, historial] = await Promise.all([
            fetchData(`http://localhost:8080/item/${id}`, 'Error al cargar el ítem'),
            fetchData('http://localhost:8080/item-type', 'Error al cargar los tipos de ítem'),
            fetchData(`http://localhost:8080/historical-item-price/${id}`, 'Error al cargar el historial de precios')
        ]);

        // Variable to avoid multiple additional expense charges
        let gastosCargados = false;

        // Insert item detail content
        const contenido = document.getElementById('contenido');

        contenido.innerHTML = `
            <div class="detalle-item-container">
                <button class="btn-retorno" onclick="cargarSeccion('items')"><</button>
                <h1>Detalles del Ítem</h1>
                <form id="form-item" onsubmit="actualizarItem(event, '${item.id}')">
                    <div class="detalle-grid">
                        <div class="columna">
                            <div class="campo">
                                <label>ID:</label>
                                <div class="campo-no-editable">${item.id}</div>
                            </div>
                            <div class="campo">
                                <label for="nombre">Nombre:</label>
                                <input type="text" id="nombre" value="${item.name}" required>
                            </div>
                            <div class="campo">
                                <label for="stock">Stock:</label>
                                <input type="number" id="stock" value="${item.stock}" required>
                            </div>
                        </div>

                        <div class="columna">
                            <div class="campo">
                                <label for="precioCompra">Precio de compra:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ | </span>
                                    <input type="number" id="precioCompra" value="${item.purchase_price.toFixed(2)}" step="0.01" required>
                                </div>
                            </div>
                            <div class="campo">
                                <label for="estado">Estado:</label>
                                <select id="estado" required>
                                    <option value="true" ${item.item_state ? 'selected' : ''}>Activo</option>
                                    <option value="false" ${!item.item_state ? 'selected' : ''}>Inactivo</option>
                                </select>
                            </div>
                            <div class="campo">
                                <label for="precioVenta">Precio de venta:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ | </span>
                                    <input type="number" id="precioVenta" value="${item.selling_price.toFixed(2)}" step="0.01" required>
                                </div>
                            </div>
                        </div>

                        <div class="campo campo-doble">
                            <label for="tipoItem">Tipo de ítem:</label>
                            <select id="tipoItem" required>
                                ${tiposDeItem.map(tipo => `
                                    <option value="${tipo.name}" data-id="${tipo.id}" ${tipo.id === item.item_type_id ? 'selected' : ''}>
                                        ${tipo.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="campo campo-doble">
                            <label for="descripcion">Descripción:</label>
                            <textarea id="descripcion" required style="resize: none;">${item.description || 'No disponible'}</textarea>
                        </div>
                    </div>
                    <button type="submit" class="btn-actualizar">Actualizar Ítem 🔄</button>
                </form>
            </div>

            <!-- Contenedor de historial de precios -->
            <div class="detalle-item-container">
                <div class="toggle-container" onclick="toggleHistorial()">
                    <h2>Historial de Precios</h2>
                    <span id="toggle-icon">▼</span>
                </div>
                <div id="historial-container" class="oculto">
                    ${historial.length > 0 ? `
                        <table class="tabla-precios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Precio (COP)</th>
                                    <th>Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historial.map(h => `
                                    <tr>
                                        <td>${h.id}</td>
                                        <td>${h.price.toFixed(2)}</td>
                                        <td>${new Date(h.modified_at).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No hay registros de precios disponibles.</p>'}
                </div>
            </div>

            <!-- Contenedor de Gastos Adicionales -->
            <div class="detalle-item-container">
                <div class="toggle-container" onclick="toggleGastos(${item.id})">
                    <h2>Gastos Adicionales</h2>
                    <span id="toggle-gastos-icon">▼</span>
                </div>

                <button class="btn-agregar-gasto" onclick="mostrarFormularioAgregarGasto('${item.id}')">Agregar ➕</button>

                <div id="gastos-container" class="oculto">
                    <p id="mensaje-gastos">Haga clic para ver los gastos adicionales.</p>
                </div>
            </div>
        `;

            // Function to charge additional expenses when the section is displayed
            window.toggleGastos = async function (itemId) {
                const gastosContainer = document.getElementById('gastos-container');
                const icono = document.getElementById('toggle-gastos-icon');

                if (gastosContainer.classList.contains('oculto')) {
                    try {
                        const respuesta = await fetch('http://localhost:8080/additional-expense', {
                            headers: { 'Username': userEmail }
                        });
    
                        if (!respuesta.ok) throw new Error('Error al cargar los gastos adicionales');

                        const gastosAdicionales = await respuesta.json();
                        const gastosFiltrados = gastosAdicionales.filter(gasto => gasto.item_id === itemId);

                        gastosContainer.innerHTML = gastosFiltrados.length > 0
                            ? `<table class="tabla-gastos">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Unidad</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${gastosFiltrados.map(gasto => `
                                        <tr onclick="mostrarFormularioEditarGasto(${gasto.id}, ${itemId})" style="cursor: pointer;">
                                            <td>${gasto.id}</td>
                                            <td>${gasto.name}</td>
                                            <td>COP ($)</td>
                                            <td>${gasto.expense.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>`
                            : '<p>No hay gastos adicionales registrados.</p>';

                        gastosContainer.classList.remove('oculto');
                        icono.textContent = '▲';
                    } catch (error) {
                        console.error(error);
                        gastosContainer.innerHTML = '<p>Error al cargar los gastos adicionales.</p>';
                    }
                } else {
                    gastosContainer.classList.add('oculto');
                    icono.textContent = '▼';
                }
            };
        
    } catch (error) {
        console.error(error);
        alert(`Error al cargar el ítem: ${error.message}`);
    }
}

// Function to display the add item form
async function mostrarFormularioAgregarItem() {

    const userEmail = sessionStorage.getItem("userEmail")

    try {
        // Fetches item types from the backend
        const tiposDeItem = await fetch('http://localhost:8080/item-type', {
            headers: { 'Username': userEmail }
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar los tipos de ítem');
            return res.json();
        });

        // Selects the content container and inserts the form HTML dynamically
        const contenido = document.getElementById('contenido');
        contenido.innerHTML = `
            <div class="detalle-item-container">
                <!-- Back button to return to item list -->
                <button class="btn-retorno" onclick="cargarSeccion('items')"><</button>
                <h1>Agregar Nuevo Ítem</h1>

                <!-- Item addition form -->
                <form id="form-agregar-item" onsubmit="guardarNuevoItem(event)">
                    <div class="detalle-grid">
                        <!-- First column: Name and Stock -->
                        <div class="columna">
                            <div class="campo">
                                <label for="nombre">Nombre:</label>
                                <input type="text" id="nombre" required>
                            </div>
                            <div class="campo">
                                <label for="stock">Stock:</label>
                                <input type="number" id="stock" required>
                            </div>
                        </div>

                        <!-- Second column: Purchase Price and State -->
                        <div class="columna">
                            <div class="campo">
                                <label for="precioCompra">Precio de compra:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ | </span>
                                    <input type="number" id="precioCompra" step="0.01" required>
                                </div>
                            </div>
                            <div class="campo">
                                <label for="estado">Estado:</label>
                                <select id="estado" required>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <!-- Third column: Selling Price -->
                        <div class="columna">
                            <div class="campo">
                                <label for="precioVenta">Precio de venta:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ | </span>
                                    <input type="number" id="precioVenta" step="0.01" required>
                                </div>
                            </div>
                        </div>

                        <!-- Fourth column: Item Type -->
                        <div class="columna">
                            <div class="campo">
                                <label for="tipoItem">Tipo de ítem:</label>
                                <select id="tipoItem" required>
                                    ${tiposDeItem.map(tipo => `
                                        <option value="${tipo.id}">${tipo.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Full-width field: Description -->
                        <div class="campo campo-doble">
                            <label for="descripcion">Descripción:</label>
                            <textarea id="descripcion" required style="resize: none;"></textarea>
                        </div>
                    </div>

                    <!-- Submit button to save the item -->
                    <button type="submit" class="btn-actualizar">Guardar Ítem ✅</button>
                </form>
            </div>
        `;

    } catch (error) {
        console.error(error); // Logs the error in the console
        alert(`Error al cargar el formulario: ${error.message}`); // Displays an error message
    }
}

// Function to save a new item with additional validations
async function guardarNuevoItem(event) {

    const userEmail = sessionStorage.getItem("userEmail")

    event.preventDefault(); // Avoid page recharge

    // Gets the values ​​of the form fields
    const nombre = document.getElementById('nombre').value.trim();
    const stock = parseInt(document.getElementById('stock').value);
    const purchasePrice = parseFloat(document.getElementById('precioCompra').value);
    const sellingPrice = parseFloat(document.getElementById('precioVenta').value);

    // Validations
    if (nombre === '') {
        alert('Error: El nombre del ítem no puede estar vacío.');
        return;
    }

    if (stock < 0 || purchasePrice < 0 || sellingPrice < 0) {
        alert('Error: El stock, el precio de compra y el precio de venta no pueden ser negativos.');
        return;
    }

    if (sellingPrice <= purchasePrice) {
        alert('Error: El precio de venta debe ser mayor que el precio de compra.');
        return;
    }

    // Constructs the object of the new item
    const nuevoItem = {
        name: nombre,
        stock: stock,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        item_state: document.getElementById('estado').value === "true",
        item_type_id: parseInt(document.getElementById('tipoItem').value),
        description: document.getElementById('descripcion').value.trim()
    };

    try {
        // Sends the POST request to the backend
        const respuesta = await fetch('http://localhost:8080/item', {
            method: 'POST',
            headers: { 
                      'Content-Type': 'application/json', 
                      'Username': userEmail
            },
            body: JSON.stringify(nuevoItem)
        });

        if (!respuesta.ok) throw new Error('Error al guardar el ítem');

        alert('Ítem guardado con éxito'); // Displays success message
        cargarSeccion('items'); // Reloads the list of items
    } catch (error) {
        console.error(error);
        alert(`Error al guardar el ítem: ${error.message}`);
    }
}

// Function to display the form to add a new additional expense
function mostrarFormularioAgregarGasto(itemId) {
    const contenido = document.getElementById('contenido');

    // Validates itemId to ensure it's valid
    if (!itemId || itemId === 0) {
        console.error("Error: Invalid item_id", itemId);
        alert("Error: Unable to retrieve item ID.");
        return;
    }

    // Dynamically inserts the additional expense form into the page
    contenido.innerHTML = `
        <div class="detalle-item-container">
            <!-- Back button to return to item details -->
            <button class="btn-retorno" onclick="mostrarDetalleItem('${itemId}')"><</button>
            <h1>Agregar Gasto Adicional</h1>

            <!-- Additional expense form -->
            <form id="form-gasto" onsubmit="guardarGastoAdicional(event, ${itemId})"> 
                <div class="campo">
                    <label for="nombreGasto">Nombre:</label>
                    <input type="text" id="nombreGasto" required>
                </div>
                <div class="campo">
                    <label for="valorGasto">Valor:</label>
                    <input type="number" id="valorGasto" step="0.01" required>
                </div>
                <div class="campo">
                    <label for="unidad">Unidad:</label>
                    <input type="text" id="unidad" value="COP ($)" disabled style="background-color: #e0e0e0; color: #555;">
                </div>

                <!-- Optional comment field -->
                <div class="campo campo-doble">
                    <label for="comentarioGasto">Comentario:</label>
                    <textarea id="comentarioGasto" style="resize: none;" placeholder="Opcional"></textarea>
                </div>

                <!-- Submit button to add the expense -->
                <button type="submit" class="btn-agregar-gasto">Agregar Gasto ➕</button>
            </form>
        </div>
    `;
}

// Function to display the form to edit an additional expense
function mostrarFormularioEditarGasto(gastoId, itemId) {
    const userEmail = sessionStorage.getItem("userEmail");
    const contenido = document.getElementById('contenido');

    // Validates itemId to ensure it's valid
    if (!itemId || itemId === 0) {
        console.error("Error: Invalid item_id", itemId);
        alert("Error: Unable to retrieve item ID.");
        return;
    }

        // Fetches additional expense data from the server
        fetch(`http://localhost:8080/additional-expense/${gastoId}`, {
            headers: {
                'Username': userEmail
            }
        })     
        .then(response => {
            if (!response.ok) throw new Error('Error retrieving additional expense data');
            return response.json();
        })
        .then(gasto => {
            // Dynamically generates the form with the retrieved data
            contenido.innerHTML = `
                <div class="detalle-item-container">
                    <!-- Back button to return to item details -->
                    <button class="btn-retorno" onclick="mostrarDetalleItem('${itemId}')"><</button>
                    <h1>Editar Gasto Adicional</h1>

                    <!-- Form to edit the additional expense -->
                    <form id="form-gasto" data-item-id="${itemId}" onsubmit="actualizarGastoAdicional(event, ${gastoId})">
                        <div class="campo">
                            <label for="nombreGasto">Nombre:</label>
                            <input type="text" id="nombreGasto" value="${gasto.name}" required>
                        </div>
                        <div class="campo">
                            <label for="valorGasto">Valor:</label>
                            <input type="number" id="valorGasto" value="${gasto.expense}" step="0.01" required>
                        </div>
                        <div class="campo">
                            <label for="unidad">Unidad:</label>
                            <input type="text" id="unidad" value="COP ($)" disabled style="background-color: #e0e0e0; color: #555;">
                        </div>
                        
                        <!-- Optional comment field -->
                        <div class="campo campo-doble">
                            <label for="comentarioGasto">Comentario:</label>
                            <textarea id="comentarioGasto" style="resize: none;" placeholder="Opcional">${gasto.description || ''}</textarea>
                        </div>
                        
                        <!-- Submit button to update the expense -->
                        <button type="submit" class="btn-actualizar">Actualizar Gasto 🔄</button>
                        <button type="button" class="btn-actualizar" onclick="eliminarGastoAdicional(${gastoId}, ${itemId})">Eliminar 🗑️</button>
                    </form>
                </div>
            `;
        })
        .catch(error => {
            console.error(error);
            alert("Error loading additional expense data.");
        });
}

// Function to update an additional expense
async function actualizarGastoAdicional(event, gastoId) {
    const userEmail = sessionStorage.getItem("userEmail")

    event.preventDefault(); // Prevents the default behavior of the form

    // Gets form elements and input values
    const form = document.getElementById('form-gasto');
    const nombre = document.getElementById('nombreGasto').value.trim();
    const valor = parseFloat(document.getElementById('valorGasto').value);
    const comentario = document.getElementById('comentarioGasto').value.trim();
    const itemId = form.dataset.itemId; // Gets the itemId from the form attribute

    // Validations
    if (!itemId || itemId === "0") {
        console.error("Error: item_id no válido", itemId);
        alert("Error: No se pudo obtener el ID del ítem.");
        return;
    }

    if (!nombre) {
        alert("Error: El nombre del gasto no puede estar vacío.");
        return;
    }

    if (isNaN(valor) || valor <= 0) {
        alert("Error: El valor del gasto debe ser mayor que cero.");
        return;
    }

    // Create the object with the updated expense data
    const datos = {
        name: nombre,
        item_id: parseInt(itemId), // Convert itemId to number
        expense: valor
    };

    // Add the description only if it has content
    if (comentario) {
        datos.description = comentario;
    }

    try {
        // Send a PUT request to update the additional spend
        const respuesta = await fetch(`http://localhost:8080/additional-expense/${gastoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Username': userEmail },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) throw new Error('Error al actualizar el gasto adicional');

        alert('¡El gasto adicional se ha actualizado correctamente!');
        mostrarDetalleItem(itemId); // Return to the item details view
    } catch (error) {
        console.error("Error al actualizar el gasto adicional:", error);
        alert(error.message);
    }
}

// Function to delete an additional expense
async function eliminarGastoAdicional(id, itemId) {
    const userEmail = sessionStorage.getItem("userEmail");

    // Confirm deletion before proceeding
    if (!confirm('¿Está seguro de que desea eliminar este gasto adicional?')) return;

    try {
        // Sends a DELETE request to the backend
        const respuesta = await fetch(`http://localhost:8080/additional-expense/${id}`, {
            method: 'DELETE',
            headers: {
                'Username': userEmail
            }
        });

        // Checks if the request was successful
        if (!respuesta.ok) throw new Error('Error ocurrido al eliminar gasto adicional');

        alert('¡Gasto adicional eliminado con éxito!');
        mostrarDetalleItem(itemId); // Refreshes the item details view
    } catch (error) {
        console.error(error);
        alert('Error ocurrido al eliminar gasto adicional');
    }
}

// Function to save a new additional expense
function guardarGastoAdicional(event, itemId) {

    const userEmail = sessionStorage.getItem("userEmail");

    event.preventDefault(); // Prevents the default behavior of the form

    // Gets and clears input values
    const nombre = document.getElementById('nombreGasto').value.trim();
    const valor = parseFloat(document.getElementById('valorGasto').value);
    const comentario = document.getElementById('comentarioGasto').value.trim();

    // Validations
    if (!nombre) {
        alert("Error: El nombre del gasto no puede estar vacío.");
        return;
    }

    if (isNaN(valor) || valor <= 0) {
        alert("Error: El valor del gasto debe ser mayor que cero.");
        return;
    }

    // Create the object with the expense data
    const nuevoGasto = {
        name: nombre,
        item_id: parseInt(itemId), // Associate the expense with the item
        expense: valor,
    };

    // Add description if it has content
    if (comentario) {
        nuevoGasto.description = comentario;
    }

    // Displays JSON in the console before sending it to the backend
    console.log("JSON enviado al backend:", JSON.stringify(nuevoGasto, null, 2));

    // Send the POST request to add the additional expense
    fetch('http://localhost:8080/additional-expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Username': userEmail
        },
        body: JSON.stringify(nuevoGasto)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || "Error desconocido"); });
        }
        return response.json();
    })
    .then(() => {
        alert("¡Gasto adicional agregado con éxito!");
        mostrarDetalleItem(itemId); // Return to the item details view
    })
    .catch(error => {
        console.error("Error al agregar el gasto adicional:", error);
        alert("Error al agregar el gasto adicional: " + error.message);
    });
}

// Function to toggle the visibility of the price history section
function toggleHistorial() {
    // Selects the container holding the price history details
    const historial = document.getElementById('historial-container');
    // Selects the icon used for visual indication (arrow)
    const icono = document.getElementById('toggle-icon');
    
    // Toggles the 'oculto' class, which controls the section's visibility
    historial.classList.toggle('oculto');
    
    // Updates the icon based on the visibility state: ▼ (collapsed) or ▲ (expanded)
    icono.textContent = historial.classList.contains('oculto') ? '▼' : '▲';
}

// Function to toggle the visibility of the price history section
function toggleHistorial() {
    // Selects the container holding the price history details
    const historial = document.getElementById('historial-container');
    // Selects the icon used for visual indication (arrow)
    const icono = document.getElementById('toggle-icon');
    
    // Toggles the 'oculto' class, which controls the section's visibility
    historial.classList.toggle('oculto');
    
    // Updates the icon based on the visibility state: ▼ (collapsed) or ▲ (expanded)
    icono.textContent = historial.classList.contains('oculto') ? '▼' : '▲';
}

// Function to update an item with additional validations
async function actualizarItem(event, id) {
    event.preventDefault(); // Avoid the default behavior of the form

    // Confirms whether the user really wants to update the item
    if (!confirm("¿Está seguro de que desea actualizar este ítem?")) return;

    // Obtiene los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const stock = parseInt(document.getElementById('stock').value);
    const purchasePrice = parseFloat(document.getElementById('precioCompra').value);
    const sellingPrice = parseFloat(document.getElementById('precioVenta').value);
    const tipoItemSeleccionado = document.getElementById('tipoItem');
    const item_type_id = parseInt(tipoItemSeleccionado.options[tipoItemSeleccionado.selectedIndex].getAttribute('data-id'));

    // Validations
    if (nombre === '') {
        alert('Error: El nombre del ítem no puede estar vacío.');
        return;
    }

    if (stock < 0 || purchasePrice < 0 || sellingPrice < 0) {
        alert('Error: El stock, el precio de compra y el precio de venta no pueden ser negativos.');
        return;
    }

    if (sellingPrice <= purchasePrice) {
        alert('Error: El precio de venta debe ser mayor que el precio de compra.');
        return;
    }

    // Build the object with the updated data
    const datosActualizados = {
        name: nombre,
        description: document.getElementById('descripcion').value.trim(),
        stock: stock,
        selling_price: sellingPrice,
        purchase_price: purchasePrice,
        item_state: document.getElementById('estado').value === 'true',
        item_type_id: item_type_id
    };

    try {
        const userEmail = sessionStorage.getItem("userEmail");

        // Sends the PUT request to the backend
        const respuesta = await fetch(`http://localhost:8080/item/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Username': userEmail },
            body: JSON.stringify(datosActualizados)
        });

        // Check if the answer is correct
        if (!respuesta.ok) {
            const errorMensaje = await respuesta.text();
            throw new Error(`Error al actualizar el ítem: ${errorMensaje}`);
        }

        // Displays a success message and reloads the item list
        alert('¡Ítem actualizado con éxito!');
        cargarSeccion('items');
    } catch (error) {
        alert(`Error al actualizar el ítem: ${error.message}`);
    }
}

// Function to fetch and display comments
async function cargarComentarios() {
    const userEmail = sessionStorage.getItem("userEmail");
    const listaComentarios = document.getElementById('lista-comentarios');

    try {
        // Perform a GET request to the comments API
        const respuesta = await fetch('http://localhost:8080/comments', {
            headers: {
                'Username': userEmail
            }
        });
        if (!respuesta.ok) throw new Error('Error retrieving comments');

        // Parse the response to JSON format
        const comentarios = await respuesta.json();

        // If no comments are available, display a message
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p>No comments available.</p>';
            return;
        }

        // Sort comments by ID in descending order (latest first)
        comentarios.sort((a, b) => b.id - a.id);

        // Render comments as a preview list (like an inbox)
        listaComentarios.innerHTML = comentarios.map(comentario => `
            <div class="comentario-preview" onclick="mostrarDetalleComentario(${comentario.id})">
                <strong>${comentario.name} ${comentario.last_name}</strong> - ${comentario.email}
                <p>${comentario.comment.substring(0, 80)}...</p> <!-- Display first 80 characters -->
            </div>
        `).join('');
    } catch (error) {
        // Display an error message if the request fails
        listaComentarios.innerHTML = `<p>Oops, algo no ha salido bien...</p>`;
    }
}

// Function to display the full details of a comment
async function mostrarDetalleComentario(id) {
    const userEmail = sessionStorage.getItem("userEmail");
    try {
        // Fetch the specific comment by its ID
        const respuesta = await fetch(`http://localhost:8080/comment/${id}`, {
            headers: {
                'Username': userEmail
            }
        });
        if (!respuesta.ok) throw new Error('Error loading comment');

        // Parse the comment data to JSON format
        const comentario = await respuesta.json();

        const contenido = document.getElementById('contenido');

        // Populate the comment details in the HTML
        contenido.innerHTML = `
            <div class="detalle-comentario-container">
                <!-- Return button to go back to the comments section -->
                <button class="btn-retorno-comentario" onclick="cargarSeccion('comentarios')"><</button>

                <h1 class="titulo-detalle">Detalles de Comentario</h1>

                <div class="detalle-comentario">
                    <!-- Display comment information -->
                    <p><strong>Nombre Completo:</strong> ${comentario.name} ${comentario.last_name}</p>
                    <p><strong>Email:</strong> ${comentario.email}</p>
                    <p><strong>Teléfono:</strong> ${comentario.phone || 'Not provided'}</p>
                    <p><strong>Departamento de Residencia:</strong> ${comentario.residence_state || 'Not specified'}</p>
                    <p><strong>Ciudad de Residencia:</strong> ${comentario.residence_city || 'Not specified'}</p>

                    <div class="separador"></div>

                    <!-- Display the full comment -->
                    <h2>Comentario:</h2>
                    <div class="comentario-marco">
                        <p>${comentario.comment}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        // Show an alert if the comment fails to load
        alert(`Error loading the comment: ${error.message}`);
    }
}

// Function to manage role-based access control
function controlarAcceso() {
    if (usuario.rol === "empresa") {
        // Hide admin-exclusive options for users with the "empresa" role
        document.querySelectorAll('.admin').forEach(item => item.classList.add('hidden'));
    }
}

// logout function
function cerrarSesion() {
    // Clear all sessionStorage information
    sessionStorage.clear();

    alert("¡Sesión cerrada con éxito!");
    window.location.href = "index.html"; // Redirect to the login page
}

// Execute access control when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", controlarAcceso);

