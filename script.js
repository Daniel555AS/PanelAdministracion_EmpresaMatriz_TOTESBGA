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

async function cargarUsuarios() {
    const listaUsuarios = document.getElementById('lista-usuarios');

    try {
        // Fetch user data from the API
        const respuesta = await fetch('http://localhost:8080/user');
        if (!respuesta.ok) throw new Error('Error loading users');

        // Parse the JSON response and render the UI
        const usuarios = await respuesta.json();
        renderizarInterfaz(usuarios);
    } catch (error) {
        // Display error message if the fetch fails
        listaUsuarios.innerHTML = `<p>Error loading users: ${error.message}</p>`;
    }
}

function renderizarInterfaz(usuarios) {
    const contenedor = document.getElementById('lista-usuarios');
    
    // Create the search container dynamically
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');

    // Search button (magnifying glass icon)
    const searchBtn = document.createElement('button');
    searchBtn.innerHTML = '🔍';
    searchBtn.classList.add('search-btn');

    // Search input field
    const searchInput = document.createElement('input');
    searchInput.type = 'number';
    searchInput.id = 'searchInput';
    searchInput.classList.add('search-input');
    searchInput.placeholder = 'Enter ID';

    // Append search elements to the container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchBtn);
    contenedor.innerHTML = ''; // Clear previous content
    contenedor.appendChild(searchContainer);

    // Create the user table
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
            ${generarFilasUsuarios(usuarios)}
        </tbody>
    `;

    contenedor.appendChild(tabla);

    // Add event listener for the search button (toggles search input visibility)
    searchBtn.addEventListener('click', () => {
        searchInput.classList.toggle('active');
        if (searchInput.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            actualizarTabla(usuarios); // Restore the full user list
        }
    });

    // Filter users dynamically based on input
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm === '') {
            actualizarTabla(usuarios); // Reset the table when input is cleared
        } else {
            const filtrados = usuarios.filter(usuario => usuario.id.toString().includes(searchTerm));
            actualizarTabla(filtrados);
        }
    });
}

// Generate table rows with user data
function generarFilasUsuarios(usuarios) {
    if (usuarios.length === 0) {
        return '<tr><td colspan="4">No users available.</td></tr>';
    }

    return usuarios.map(usuario => `
        <tr class="fila-user" onclick="mostrarDetalleUser(${usuario.id})">
            <td>${usuario.id}</td>
            <td>${usuario.email}</td>
            <td>${usuario.user_state}</td>
            <td>${usuario.user_type}</td>
        </tr>
    `).join('');
}

// Update the table content dynamically
function actualizarTabla(usuarios) {
    const tablaBody = document.getElementById('tabla-body');
    if (tablaBody) {
        tablaBody.innerHTML = generarFilasUsuarios(usuarios);
    }
}

// Load users when the script runs
cargarUsuarios();

// Function to fetch and display items
async function cargarItems() {
    const listaItems = document.getElementById('lista-items'); // Gets the item list container

    try {
        // Sends a GET request to the item API
        const respuesta = await fetch('http://localhost:8080/item');
        if (!respuesta.ok) throw new Error('Error al obtener los ítems'); // Throws an error if the request fails

        const items = await respuesta.json(); // Parses the JSON response

        // Checks if there are no items available
        if (items.length === 0) {
            listaItems.innerHTML = '<p>No hay ítems disponibles.</p>'; // Displays a message if the item list is empty
            return; // Exits the function
        }

        // Renders the items in a table format
        listaItems.innerHTML = `
            <table class="tabla-items">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <!-- Each row displays item data and is clickable to show item details -->
                        <tr class="fila-item" onclick="mostrarDetalleItem(${item.id})">
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.stock}</td>
                        </tr>
                    `).join('')} <!-- Joins all rows into a single HTML string -->
                </tbody>
            </table>
        `;
    } catch (error) {
        // Displays an error message if the fetch operation fails
        listaItems.innerHTML = `<p>Error al cargar los ítems: ${error.message}</p>`;
    }
}

// Function to display item details
async function mostrarDetalleItem(id) {
    try {
        // Helper function to perform GET requests
        async function fetchData(url, errorMsg) {
            const respuesta = await fetch(url); // Sends GET request
            if (!respuesta.ok) throw new Error(errorMsg); // Throws error if the request fails
            return respuesta.json(); // Parses JSON response
        }

        // Fetch item data, item types, price history, and additional expenses concurrently
        const [item, tiposDeItem, historial, gastosAdicionales] = await Promise.all([
            fetchData(`http://localhost:8080/item/${id}`, 'Error al cargar el ítem'),
            fetchData('http://localhost:8080/item-type', 'Error al cargar los tipos de ítem'),
            fetchData(`http://localhost:8080/historical-item-price/${id}`, 'Error al cargar el historial de precios'),
            fetchData(`http://localhost:8080/additional-expense?item_id=${id}`, 'Error al cargar los gastos adicionales')
        ]);

        const contenido = document.getElementById('contenido'); // Gets the main content container

        contenido.innerHTML = `
            <!-- Item details container -->
            <div class="detalle-item-container">
                <!-- Return button -->
                <button class="btn-retorno" onclick="cargarSeccion('items')"><</button>
                <h1>Detalles del Ítem</h1>

                <!-- Form for updating item information -->
                <form id="form-item" onsubmit="actualizarItem(event, '${item.id}')">
                    <div class="detalle-grid">
                        <!-- First column with ID, Name, and Stock -->
                        <div class="columna">
                            <div class="campo">
                                <label>ID:</label>
                                <div class="campo-no-editable">${item.id}</div> <!-- Non-editable field -->
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

                        <!-- Second column with purchase price, status, and selling price -->
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
                                    <!-- Select option for item status -->
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

                        <!-- Item type selection -->
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

                        <!-- Item description -->
                        <div class="campo campo-doble">
                            <label for="descripcion">Descripción:</label>
                            <textarea id="descripcion" required>${item.description || 'No disponible'}</textarea>
                        </div>
                    </div>
                    <button type="submit" class="btn-actualizar">Actualizar Ítem</button>
                </form>
            </div>

            <!-- Price history container -->
            <div class="detalle-item-container">
                <!-- Collapsible section for price history -->
                <div class="toggle-container" onclick="toggleHistorial()">
                    <h2>Historial de Precios</h2>
                    <span id="toggle-icon">▼</span>
                </div>

                <!-- Displays price history if available -->
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

            <!-- Additional expenses container -->
            <div class="detalle-item-container">
                <!-- Collapsible section for additional expenses -->
                <div class="toggle-container" onclick="toggleGastos()">
                    <h2>Gastos Adicionales</h2>
                    <span id="toggle-gastos-icon">▼</span>
                </div>

                <!-- Displays additional expenses if available -->
                <div id="gastos-container" class="oculto">
                    ${gastosAdicionales.length > 0 ? `
                        <table class="tabla-precios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Unidad</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${gastosAdicionales.map(gasto => `
                                    <tr>
                                        <td>${gasto.id}</td>
                                        <td>${gasto.name}</td>
                                        <td>${gasto.is_percentage ? '%' : 'COP $'}</td>
                                        <td>${gasto.expense.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No hay gastos adicionales registrados.</p>'}
                </div>
        `;
    } catch (error) {
        // Logs error and shows an alert if data loading fails
        console.error(error);
        alert(`Error al cargar el ítem: ${error.message}`);
    }
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

// Function to toggle the visibility of the additional expenses section
function toggleGastos() {
    // Selects the container holding the additional expenses details
    const gastos = document.getElementById('gastos-container');
    // Selects the icon used for visual indication (arrow)
    const icono = document.getElementById('toggle-gastos-icon');
    
    // Toggles the 'oculto' class, which controls the section's visibility
    gastos.classList.toggle('oculto');
    
    // Updates the icon based on the visibility state: ▼ (collapsed) or ▲ (expanded)
    icono.textContent = gastos.classList.contains('oculto') ? '▼' : '▲';
}

// Function to update an item
async function actualizarItem(event, id) {
    // Prevents the default form submission behavior
    event.preventDefault();

    // Displays a confirmation dialog; exits if the user cancels
    if (!confirm("¿Está seguro de que desea actualizar este ítem?")) return;

    try {
        // Retrieve the correct item_type_id from the dropdown menu
        const tipoItemSeleccionado = document.getElementById('tipoItem');
        const item_type_id = tipoItemSeleccionado.options[tipoItemSeleccionado.selectedIndex].getAttribute('data-id');

        // Collect updated item data from form inputs
        const datosActualizados = {
            name: document.getElementById('nombre').value, // Item name
            description: document.getElementById('descripcion').value, // Item description
            stock: parseInt(document.getElementById('stock').value), // Item stock (converted to integer)
            selling_price: parseFloat(document.getElementById('precioVenta').value), // Selling price (float)
            purchase_price: parseFloat(document.getElementById('precioCompra').value), // Purchase price (float)
            item_state: document.getElementById('estado').value === 'true', // Item status (boolean)
            item_type_id: parseInt(item_type_id) // Item type ID (converted to integer)
        };

        // Logs the updated item data to the console (for debugging purposes)
        console.log('Datos actualizados:', datosActualizados);

        // Sends a PUT request to update the item on the backend
        const respuesta = await fetch(`http://localhost:8080/item/${id}`, {
            method: 'PUT',                         // HTTP method: PUT (used for updating)
            headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
            body: JSON.stringify(datosActualizados) // Convert data to JSON format
        });

        // If the response is not OK, throws an error with the response message
        if (!respuesta.ok) {
            const errorMensaje = await respuesta.text();
            throw new Error(`Error al actualizar el ítem: ${errorMensaje}`);
        }

        // Displays a success alert and reloads the item list
        alert('¡Ítem actualizado con éxito!');
        cargarSeccion('items');  // Reloads the "items" section
    } catch (error) {
        // Displays an error alert if the update process fails
        alert(`Error al actualizar el ítem: ${error.message}`);
    }
}

// Function to fetch and display comments
async function cargarComentarios() {
    const listaComentarios = document.getElementById('lista-comentarios');

    try {
        // Perform a GET request to the comments API
        const respuesta = await fetch('http://localhost:8080/comments');
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
        listaComentarios.innerHTML = `<p>Error loading comments: ${error.message}</p>`;
    }
}

// Function to display the full details of a comment
async function mostrarDetalleComentario(id) {
    try {
        // Fetch the specific comment by its ID
        const respuesta = await fetch(`http://localhost:8080/comment/${id}`);
        if (!respuesta.ok) throw new Error('Error loading comment');

        // Parse the comment data to JSON format
        const comentario = await respuesta.json();

        const contenido = document.getElementById('contenido');

        // Populate the comment details in the HTML
        contenido.innerHTML = `
            <div class="detalle-comentario-container">
                <!-- Return button to go back to the comments section -->
                <button class="btn-retorno" onclick="cargarSeccion('comentarios')"><</button>

                <h1 class="titulo-detalle">Comment Details</h1>

                <div class="detalle-comentario">
                    <!-- Display comment information -->
                    <p><strong>Name:</strong> ${comentario.name} ${comentario.last_name}</p>
                    <p><strong>Email:</strong> ${comentario.email}</p>
                    <p><strong>Phone:</strong> ${comentario.phone || 'Not provided'}</p>
                    <p><strong>State of Residence:</strong> ${comentario.residence_state || 'Not specified'}</p>
                    <p><strong>City of Residence:</strong> ${comentario.residence_city || 'Not specified'}</p>

                    <div class="separador"></div>

                    <!-- Display the full comment -->
                    <h2>Comment:</h2>
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

// Simulate user logout
function cerrarSesion() {
    alert("Session closed. Redirecting...");
    window.location.href = "index.html"; // Redirect to the login page
}

// Execute access control when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", controlarAcceso);

