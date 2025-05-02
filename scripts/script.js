// Function to dynamically load sections
function cargarSeccion(seccion) {

    if (seccion === 'email') {
        window.open('http://matriztotesbgacorreo/squirrelmail', '_blank');
        return;
    }

    const contenido = document.getElementById('contenido'); // Gets the container to display the content

    // Object storing the HTML content for each section
    const secciones = {
        'dashboard': `
        <h1>Bienvenido(a)</h1>
        <div class="mensaje-inicio">Bienvenido al panel administrativo. Selecciona una opción para continuar.</div>
        <div class="contenedor-video">
            <video class="video-inicio" autoplay loop muted playsinline>
                <source src="assets/videos/video_totes.mp4" type="video/mp4">
                Tu navegador no soporta la reproducción de video.
            </video>
        </div>
        <div id="btn-cerrar-sesion">
            <img src="assets/images/logout-icon.png" alt="Cerrar sesión" title="Cerrar sesión" onclick="cerrarSesion()">
        </div>
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
            <div class="refresh-container" onclick="cargarUsuarios()">
                <div class="refresh-logo">⟳</div>
            </div>
            <div id="lista-usuarios" class="user-list">
            <p>Cargando usuarios...</p>
            </div>
`, // Employees section witha  message for administrator only

        'empleados': `
            <h1>Administrar Empleados</h1>
            <div class="refresh-container" onclick="cargarEmpleados()">
                <div class="refresh-logo">⟳</div>
            </div>
                <div id="lista-empleados" class="user-list">
            <p>Cargando empleados...</p>
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
        `, // Comments section with a refresh button and placeholder content

        'clientes': `
            <h1>Gestionar Clientes</h1>
            <div class="refresh-container" onclick="cargarClientes()">
                <div class="refresh-logo">⟳</div>
            </div>
            <div id="lista-clientes" class="client-list">
                <p>Cargando clientes...</p>
            </div>
        `,

        'citas': `
            <h1>Gestionar Citas</h1>
            <div class="refresh-container" onclick="cargarCitas()">
                <div class="refresh-logo">⟳</div>
            </div>
            <div id="calendario-semanal" class="calendar-container">
                <p>Cargando calendario...</p>
            </div>
            <div id="popup-cita" class="popup-cita oculto">
            <div class="popup-contenido">
                <span id="cerrar-popup" class="cerrar-popup">×</span>
                <div id="detalle-cita"></div>
                </div>
            </div>
            <div id="modal-fechas" style="display: none;" class="modal">
            <div class="modal-contenido">
                <h3 class="seleccione-rango-fechas">Seleccione el Rango de Fechas</h3>
                <label for="fecha-inicio" class="label-fecha-inicio">Fecha de Inicio:</label>
                <input type="date" id="fecha-inicio">
                <label for="fecha-fin" class="label-fecha-fin">Fecha de Fin:</label>
                <input type="date" id="fecha-fin">

                <!-- Agrupamos los botones -->
                <div class="contenedor-botones-modal">
                    <button id="confirmar-fechas" class="btn-generar-reporte">Generar Reporte ⬇️</button>
                    <button onclick="cerrarModalFechas()" class="btn-cancelar-reporte">Cancelar ❌</button>
                </div>
            </div>

            <canvas id="graficoCitas" width="400" height="400" style="display: none;"></canvas>
        `,

        'financiera': `
        <h1 class="titulo-gestion-financiera">Gestión Financiera</h1>
        <div id="contenedor-financiera"></div>
    `
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
    } else if (seccion === 'clientes') {
        cargarClientes(); // Call the function to load customers
    } else if (seccion === 'citas') {
        cargarCitas(); // Call the function to load appointments
    } else if(seccion === 'financiera') {
        cargarFinanciera();
    } else if (seccion === 'empleados') {
        cargarEmpleados(); // Call the function to load taxes
    }
}

// - Invoice generation section

let listaClientes = [];
let listaVehiculos = [];
let clienteSeleccionado = null;
let vehiculosSeleccionados = [];
let descuentosDisponibles = [];
let impuestosDisponibles = [];
let descuentosSeleccionados = [];
let impuestosSeleccionados = [];
let infoaboutempresa = "";


function mostrarVistaGenerarFactura() {

    clienteSeleccionado = null;
    vehiculosSeleccionados = [];

    const contenedor = document.getElementById("contenido");
    contenedor.innerHTML = `
        <div class="detalle-item-container">
        <button class="btn-retorno" onclick=cargarFinanciera()><</button>
        <h1>Generar Factura</h1>

        <div>
            <label for="inputCliente">Buscar Cliente:</label>
            <input type="text" id="inputCliente" onkeyup="buscarClientesFactura()" placeholder="Ingrese nombre o identificación del cliente">
            <div id="resultadoClientes" class="resultados"></div>
        </div>

        <div id="clienteSeleccionado" style="margin-top: 10px;"></div>

        <div style="margin-top: 20px;">
            <label for="inputVehiculo">Buscar Vehículo:</label>
            <input type="text" id="inputVehiculo" onkeyup="buscarVehiculosFactura()" placeholder="Ingrese nombre del vehículo">
            <div id="resultadoVehiculos" class="resultados"></div>
        </div>

        <div id="vehiculosSeleccionados" style="margin-top: 10px;"></div>
        <div id="vehiculosSeleccionados" style="margin-top: 10px;"></div>
        
        <div class="subtotal-container">
            <label for="subtotal">Subtotal:</label>
            <input type="text" id="subtotal" class="subtotal-display" value="$ 0" readonly>
       </div>

        <!-- Discounts -->
        <div style="margin-top: 20px;">
            <label for="inputDescuento">Buscar Descuento:</label>
            <input type="text" id="inputDescuento" onkeyup="buscarDescuentos()" placeholder="Ingrese nombre del descuento">
            <div id="resultadoDescuentos" class="resultados"></div>
        </div>
        <div id="descuentosSeleccionados" style="margin-top: 10px;"></div>

        <!-- Taxes -->
        <div style="margin-top: 20px;">
            <label for="inputImpuesto">Buscar Impuesto:</label>
            <input type="text" id="inputImpuesto" onkeyup="buscarImpuestos()" placeholder="Ingrese nombre del impuesto">
            <div id="resultadoImpuestos" class="resultados"></div>
        </div>
        <div id="impuestosSeleccionados" style="margin-top: 10px;"></div>

        <!-- Total -->
        <div class="subtotal-container">
            <label for="total">Total:</label>
            <input type="text" id="total" class="subtotal-display" value="$ 0" readonly>
        </div>

        <!-- Section: Company Information -->
        <div class="company-info-section">
        <label for="infoEmpresa">Información de Empresa: </label>
            <textarea id="company-info" class="company-info-textarea">
                TOTES BGA - Matriz
                NIT. 800197268-4
                Calle 27 # Carrera 19 – 50
                Bucaramanga, Santander, Colombia
            </textarea>
        </div>
        <button type="submit" class="btn-agregar-gasto">Generar Factura</button>
        </div>
    `;
    obtenerClientes();
    obtenerVehiculos();
    obtenerDescuentos();
    obtenerImpuestos();
}

async function obtenerClientes() {
    try {
        const userEmail = sessionStorage.getItem("userEmail");
        const res = await fetch("http://localhost:8080/customers", {
            headers: { "Username": userEmail }
        });
        const data = await res.json();
        listaClientes = data.filter(c => c.customerState);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
    }
}

async function obtenerVehiculos() {
    try {
        const userEmail = sessionStorage.getItem("userEmail");
        const res = await fetch("http://localhost:8080/items", {
            headers: { "Username": userEmail }
        });
        const data = await res.json();
        listaVehiculos = data.filter(v => v.item_state && v.stock > 0);
    } catch (error) {
        console.error("Error al obtener vehículos:", error);
    }
}

function buscarClientesFactura() {
    const query = document.getElementById("inputCliente").value.trim().toLowerCase();
    const contenedor = document.getElementById("resultadoClientes");

    if (query === "") {
        contenedor.innerHTML = "";
        return;
    }

    const resultados = listaClientes.filter(c =>
        c.customerId.toLowerCase().includes(query) ||
        c.customerName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query)
    );

    if (resultados.length === 0) {
        contenedor.innerHTML = "<div class='no-result'>No se encontraron coincidencias.</div>";
        return;
    }

    contenedor.innerHTML = resultados.map(c => `
        <div class="vehiculo-fila opcion" onclick="seleccionarClienteFactura(${c.id}, ${c.identifierTypeId}, '${c.customerId}', '${c.customerName}', '${c.lastName}')">
            <div class="vehiculo-info">
                <strong>${c.customerName} ${c.lastName}</strong><br>
                <span>${c.customerId}</span>
            </div>
        </div>
    `).join("");
}

function buscarVehiculosFactura() {
    const query = document.getElementById("inputVehiculo").value.trim().toLowerCase();
    const contenedor = document.getElementById("resultadoVehiculos");

    if (query === "") {
        contenedor.innerHTML = "";
        return;
    }

    const resultados = listaVehiculos.filter(v =>
        v.name.toLowerCase().includes(query)
    );

    if (resultados.length === 0) {
        contenedor.innerHTML = "<div class='no-result'>No se encontraron coincidencias.</div>";
        return;
    }

    contenedor.innerHTML = resultados.map(v => `
        <div class="opcion" onclick="seleccionarVehiculoFactura(${v.id}, '${v.name}')">
            ${v.name} - Stock: ${v.stock}
        </div>
    `).join("");
}

function seleccionarClienteFactura(id, tipoID, numeroID, nombre, apellido) {
    clienteSeleccionado = { id, tipoID, numeroID, nombre, apellido };

    document.getElementById("clienteSeleccionado").innerHTML = `
        <div class="vehiculo-fila">
            <div class="vehiculo-info">
                <strong>Cliente Seleccionado:</strong><br>
                <span>${nombre} ${apellido} - ${numeroID}</span>
            </div>
        </div>
    `;
    document.getElementById("resultadoClientes").innerHTML = "";
    document.getElementById("inputCliente").value = "";
}

function buscarVehiculosFactura() {
    const query = document.getElementById("inputVehiculo").value.trim().toLowerCase();
    const contenedor = document.getElementById("resultadoVehiculos");

    if (query === "") {
        contenedor.innerHTML = "";
        return;
    }

    const vehiculosNoSeleccionados = listaVehiculos.filter(v => 
        v.name.toLowerCase().includes(query) && 
        !vehiculosSeleccionados.some(vSeleccionado => vSeleccionado.id === v.id)
    );

    if (vehiculosNoSeleccionados.length === 0) {
        contenedor.innerHTML = "<div class='no-result'>No se encontraron coincidencias.</div>";
        return;
    }

    contenedor.innerHTML = vehiculosNoSeleccionados.map(v => `
        <div class="vehiculo-fila">
            <div class="vehiculo-info">
                <strong>${v.name}</strong><br>
                <span>Stock: ${v.stock}</span><br>
                <span>Precio Unitario: $${v.selling_price.toLocaleString("es-CO")}</span>
            </div>
            <div class="vehiculo-acciones">
                <input type="number" id="cantidad-${v.id}" min="1" max="${v.stock}" placeholder="Cant." class="input-cantidad">
                <button onclick="agregarVehiculoFactura(${v.id})" class="btn-agregar">+</button>
            </div>
        </div>
    `).join("");
}

function agregarVehiculoFactura(id) {
    const vehiculo = listaVehiculos.find(v => v.id === id);
    if (!vehiculo) return;

    const inputCantidad = document.getElementById(`cantidad-${id}`);
    const cantidad = parseInt(inputCantidad.value);

    if (isNaN(cantidad) || cantidad < 1) {
        alert("Cantidad inválida.");
        return;
    }

    if (cantidad > vehiculo.stock) {
        alert(`La cantidad excede el stock disponible (${vehiculo.stock}).`);
        return;
    }

    const yaExiste = vehiculosSeleccionados.some(v => v.id === id);
    if (yaExiste) {
        alert("Este vehículo ya ha sido agregado.");
        return;
    }

    vehiculosSeleccionados.push({
        id: vehiculo.id,
        nombre: vehiculo.name,
        cantidad: cantidad,
        precioUnitario: vehiculo.selling_price
    });

    actualizarListaVehiculosSeleccionados();
    document.getElementById("resultadoVehiculos").innerHTML = "";
    document.getElementById("inputVehiculo").value = "";
    actualizarSubtotal();

}

function actualizarListaVehiculosSeleccionados() {
    const contenedor = document.getElementById("vehiculosSeleccionados");
    if (vehiculosSeleccionados.length === 0) {
        contenedor.innerHTML = "";
        return;
    }

    contenedor.innerHTML = `
        <strong>Vehículos seleccionados:</strong><br>
        ${vehiculosSeleccionados.map(v => `
            <div class="vehiculo-fila">
                <div class="vehiculo-info">
                    <strong>${v.nombre}</strong><br>
                    <span>Cantidad: ${v.cantidad}</span><br>
                    <span>Precio Unitario: $${v.precioUnitario.toLocaleString("es-CO")}</span>
                </div>
                <div class="vehiculo-acciones">
                    <button onclick="eliminarVehiculoSeleccionado(${v.id})" class="btn-eliminar">Eliminar</button>
                </div>
            </div>
        `).join("")}
    `;
}

function eliminarVehiculoSeleccionado(id) {
    vehiculosSeleccionados = vehiculosSeleccionados.filter(v => v.id !== id);
    actualizarListaVehiculosSeleccionados();
    actualizarSubtotal();

}

function actualizarSubtotal() {
    const subtotal = vehiculosSeleccionados.reduce((total, item) => {
        return total + item.precioUnitario * item.cantidad;
    }, 0);

    document.getElementById("subtotal").value = `$ ${subtotal.toLocaleString("es-CO")}`;
    actualizarTotal();
}

async function obtenerDescuentos() {
    try {
        const userEmail = sessionStorage.getItem("userEmail");
        const res = await fetch("http://localhost:8080/discount-types", {
            headers: { "Username": userEmail }
        });
        const data = await res.json();
        descuentosDisponibles = data;
    } catch (error) {
        console.error("Error al obtener descuentos:", error);
    }
}

async function obtenerImpuestos() {
    try {
        const userEmail = sessionStorage.getItem("userEmail");
        const res = await fetch("http://localhost:8080/tax-types", {
            headers: { "Username": userEmail }
        });
        const data = await res.json();
        impuestosDisponibles = data;
    } catch (error) {
        console.error("Error al obtener impuestos:", error);
    }
}

function buscarDescuentos() {
    const query = document.getElementById("inputDescuento").value.trim().toLowerCase();
    const contenedor = document.getElementById("resultadoDescuentos");

    if (query === "") {
        contenedor.innerHTML = "";
        return;
    }

    const resultados = descuentosDisponibles.filter(d =>
        d.name.toLowerCase().includes(query) &&
        !descuentosSeleccionados.some(sel => sel.id === d.id)
    );

    if (resultados.length === 0) {
        contenedor.innerHTML = "<div class='no-result'>No se encontraron coincidencias.</div>";
        return;
    }

    contenedor.innerHTML = resultados.map(d => `
        <div class="vehiculo-fila opcion" onclick="agregarDescuento(${d.id})">
            <div class="vehiculo-info">
                <strong>ID: ${d.id} - ${d.name}</strong><br>
                <span>${d.is_percentage ? d.value + '%' : '$ ' + d.value.toLocaleString('es-CO')}</span>
            </div>
        </div>
    `).join("");
}

function agregarDescuento(id) {
    const descuento = descuentosDisponibles.find(d => d.id === id);
    if (!descuento) return;

    descuentosSeleccionados.push(descuento);
    actualizarDescuentosSeleccionados();
    document.getElementById("resultadoDescuentos").innerHTML = "";
    document.getElementById("inputDescuento").value = "";
    actualizarTotal();
}

function actualizarDescuentosSeleccionados() {
    const contenedor = document.getElementById("descuentosSeleccionados");
    contenedor.innerHTML = descuentosSeleccionados.map(d => `
        <strong>Descuentos seleccionados:</strong><br>
            <div class="vehiculo-fila">
                <div class="vehiculo-info">
                <strong>ID: ${d.id} - ${d.name}</strong><br>
                <span>${d.is_percentage ? d.value + '%' : '$ ' + d.value.toLocaleString('es-CO')}</span>
                </div>
                <div class="vehiculo-acciones">
                    <button onclick="eliminarDescuento(${d.id})" class="btn-eliminar">Eliminar</button>
                </div>
            </div>
    `).join("");
}

function eliminarDescuento(id) {
    descuentosSeleccionados = descuentosSeleccionados.filter(d => d.id !== id);
    actualizarDescuentosSeleccionados();
    actualizarTotal();
}

function buscarImpuestos() {
    const query = document.getElementById("inputImpuesto").value.trim().toLowerCase();
    const contenedor = document.getElementById("resultadoImpuestos");

    if (query === "") {
        contenedor.innerHTML = "";
        return;
    }

    const resultados = impuestosDisponibles.filter(t =>
        t.name.toLowerCase().includes(query) &&
        !impuestosSeleccionados.some(sel => sel.id === t.id)
    );

    if (resultados.length === 0) {
        contenedor.innerHTML = "<div class='no-result'>No se encontraron coincidencias.</div>";
        return;
    }

    contenedor.innerHTML = resultados.map(t => `

        <div class="vehiculo-fila opcion" onclick="agregarImpuesto(${t.id})">
            <div class="vehiculo-info">
                <strong>ID: ${t.id} - ${t.name}</strong><br>
                <span>${t.is_percentage ? t.value + '%' : '$ ' + t.value.toLocaleString('es-CO')}</span>
            </div>
        </div>
    `).join("");
}

function agregarImpuesto(id) {
    const impuesto = impuestosDisponibles.find(t => t.id === id);
    if (!impuesto) return;

    impuestosSeleccionados.push(impuesto);
    actualizarImpuestosSeleccionados();
    document.getElementById("resultadoImpuestos").innerHTML = "";
    document.getElementById("inputImpuesto").value = "";
    actualizarTotal();
}

function actualizarImpuestosSeleccionados() {
    const contenedor = document.getElementById("impuestosSeleccionados");
    contenedor.innerHTML = impuestosSeleccionados.map(t => `
        <strong>Impuestos seleccionados:</strong><br>
            <div class="vehiculo-fila">
                <div class="vehiculo-info">
                <strong>ID: ${t.id} - ${t.name}</strong><br>
                <span>${t.is_percentage ? t.value + '%' : '$ ' + t.value.toLocaleString('es-CO')}</span>
                </div>
                <div class="vehiculo-acciones">
                    <button onclick="eliminarImpuesto(${t.id})" class="btn-eliminar">Eliminar</button>
                </div>
            </div>
    `).join("");
}

function eliminarImpuesto(id) {
    impuestosSeleccionados = impuestosSeleccionados.filter(t => t.id !== id);
    actualizarImpuestosSeleccionados();
    actualizarTotal();
}

function actualizarTotal() {

    let subtotal = vehiculosSeleccionados.reduce((total, item) => {
        return total + item.precioUnitario * item.cantidad;
    }, 0);

    // Apply discounts
    descuentosSeleccionados.forEach(desc => {
        if (desc.is_percentage) {
            subtotal -= (subtotal * (desc.value / 100));
        } else {
            subtotal -= desc.value;
        }
    });

    // Apply taxes
    impuestosSeleccionados.forEach(tax => {
        if (tax.is_percentage) {
            subtotal += (subtotal * (tax.value / 100));
        } else {
            subtotal += tax.value;
        }
    });

    document.getElementById("total").value = `$ ${subtotal.toLocaleString("es-CO")}`;
}

function dibujarEncabezadoFactura(doc, pageWidth, img) {
    const headerHeight = 25;

    doc.setFillColor(0, 0, 0);
    doc.rect(0, 10, pageWidth, headerHeight, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTES BGA - Matriz", 15, 20);

    const imgWidth = 60;
    const imgHeight = 15;
    const imgX = pageWidth - imgWidth - 15;
    const imgY = 13;
    doc.addImage(img, "PNG", imgX, imgY, imgWidth, imgHeight);
}

const { jsPDF } = window.jspdf;

function generarFacturaPDF() {
    if (!clienteSeleccionado) {
        alert("Por favor, seleccione un cliente.");
        return;
    }

    const img = new Image();
    img.src = "assets/images/logo_totes.png";

    img.onload = function () {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        dibujarEncabezadoFactura(doc, pageWidth, img);

        doc.setTextColor(0, 0, 0);
        let yOffset = 50;

        // Centered title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Generación de Factura", pageWidth / 2, yOffset, { align: "center" });
        yOffset += 10;

        // Company
        if (infoaboutempresa && infoaboutempresa.trim() !== "") {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(infoaboutempresa.trim(), 10, yOffset);
        } else {
            console.warn("La información de empresa (infoaboutempresa) está vacía.");
        }
        yOffset += 20;

        // Invoice Generation Date and Time on One Line
        const fechaGeneracion = new Date().toLocaleString('es-CO', {
            timeZone: 'America/Bogota',
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        doc.setFont("helvetica", "bold");
        doc.text("Fecha de Generación:     ", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(fechaGeneracion, 65, yOffset); 
        yOffset += 8;

        // Customer
        doc.setFont("helvetica", "bold");
        doc.text("Cliente:", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido} - ${clienteSeleccionado.numeroID}`, 32, yOffset);
        yOffset += 8;

        // Vehicles
        const vehiculosTable = [['Vehículo', 'Cantidad', 'Precio Unitario', 'Total']];
        vehiculosSeleccionados.forEach(v => {
            const total = v.precioUnitario * v.cantidad;
            vehiculosTable.push([v.nombre, v.cantidad, `$ ${v.precioUnitario.toLocaleString('es-CO')}`, `$ ${total.toLocaleString('es-CO')}`]);
        });

        doc.autoTable({
            head: [vehiculosTable[0]],
            body: vehiculosTable.slice(1),
            startY: yOffset,
            theme: 'grid',
            styles: { fontSize: 10 },
            didDrawPage: function (data) {
                dibujarEncabezado(doc, pageWidth, img);
            }
        });
        yOffset = doc.lastAutoTable.finalY + 6;

        // Discounts
        const descuentosTable = [['Descuento', 'Valor']];
        descuentosSeleccionados.forEach(d => {
            descuentosTable.push([d.name, d.is_percentage ? `${d.value}%` : `$ ${d.value.toLocaleString('es-CO')}`]);
        });

        doc.autoTable({
            head: [descuentosTable[0]],
            body: descuentosTable.slice(1),
            startY: yOffset,
            theme: 'grid',
            styles: { fontSize: 10 },
            didDrawPage: function (data) {
                dibujarEncabezado(doc, pageWidth, img);
            }
        });
        yOffset = doc.lastAutoTable.finalY + 6;

        // Taxes
        const impuestosTable = [['Impuesto', 'Valor']];
        impuestosSeleccionados.forEach(i => {
            impuestosTable.push([i.name, i.is_percentage ? `${i.value}%` : `$ ${i.value.toLocaleString('es-CO')}`]);
        });

        doc.autoTable({
            head: [impuestosTable[0]],
            body: impuestosTable.slice(1),
            startY: yOffset,
            theme: 'grid',
            styles: { fontSize: 10 },
            didDrawPage: function (data) {
                dibujarEncabezado(doc, pageWidth, img);
            }
        });
        yOffset = doc.lastAutoTable.finalY + 6;

        // Calculations
        const subtotal = vehiculosSeleccionados.reduce((t, i) => t + i.precioUnitario * i.cantidad, 0);
        const totalDescuentos = descuentosSeleccionados.reduce((t, d) => t + (d.is_percentage ? subtotal * d.value / 100 : d.value), 0);
        const totalImpuestos = impuestosSeleccionados.reduce((t, i) => t + (i.is_percentage ? subtotal * i.value / 100 : i.value), 0);
        const totalFactura = subtotal - totalDescuentos + totalImpuestos;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(`$ ${subtotal.toLocaleString('es-CO')}`, 40, yOffset);
        yOffset += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total Descuentos:", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(`$ ${totalDescuentos.toLocaleString('es-CO')}`, 55, yOffset);
        yOffset += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total Impuestos:", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(`$ ${totalImpuestos.toLocaleString('es-CO')}`, 55, yOffset);
        yOffset += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total:", 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(`$ ${totalFactura.toLocaleString('es-CO')}`, 30, yOffset);

        doc.save(`Factura_${clienteSeleccionado.numeroID}.pdf`);
    };

    img.onerror = function () {
        alert("No se pudo cargar el logo.");
    };
}

document.addEventListener("click", function (e) {
    if (e.target && e.target.textContent === "Generar Factura") {
        generarFactura();
    }
});

async function generarFactura() {
    if (!clienteSeleccionado || vehiculosSeleccionados.length === 0) {
        alert("Debe seleccionar un cliente y al menos un vehículo.");
        return;
    }

    const enterprise_data = document.getElementById("company-info").value.trim();
    const subtotalStr = document.getElementById("subtotal").value.replace(/\D/g, '');
    const totalStr = document.getElementById("total").value.replace(/\D/g, '');

    const billingItems = vehiculosSeleccionados.map(v => ({
        ID: v.id,
        Stock: v.cantidad
    }));

    const invoiceData = {
        enterprise_data: enterprise_data,
        customer_id: clienteSeleccionado.id,
        Subtotal: parseInt(subtotalStr),
        Total: parseInt(totalStr),
        Items: billingItems,
        Discounts: descuentosSeleccionados.map(d => d.id),
        Taxes: impuestosSeleccionados.map(t => t.id)
    };
    console.log(invoiceData);

    try {
        const userEmail = sessionStorage.getItem("userEmail");
        const res = await fetch("http://localhost:8080/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            },
            body: JSON.stringify(invoiceData)
        });

        if (res.ok) {
            const nuevaFactura = await res.json();
            infoaboutempresa = invoiceData.enterprise_data;
            alert("Factura generada exitosamente");
            generarFacturaPDF();
            cargarFinanciera(); 
        } else {
            const errorData = await res.json();
            alert("Error al generar la factura: " + (errorData.error || "Desconocido"));
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error de red al generar la factura.");
    }
}

// - END OF THE INVOICE GENERATION SECTION

let descuentosGlobal = [];

async function cargarDescuentos() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const respuesta = await fetch('http://localhost:8080/discount-types', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener los descuentos');
        descuentosGlobal = await respuesta.json(); // Save to global variable

        const tablaBody = document.getElementById('tablaDescuentosBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasDescuentos(descuentosGlobal);
            return;
        }

        document.getElementById('lista-descuentos').innerHTML = `
        <div class="contenedor-superior">
            <button class="btn-agregar-descuento" onclick="mostrarFormularioAgregarDescuento()">+ Agregar Descuento 🏷️</button>
            <div class="refresh-container-descuento" onclick="cargarDescuentos()">
                <div class="refresh-logo-descuento">⟳</div>
            </div>
        </div>

            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <select id="filtroBusqueda" onchange="buscarDescuento()">
                        <option value="id">Nombre</option>
                    </select>
                    <input type="text" id="inputBusquedaDescuento" placeholder="Buscar descuento.." oninput="buscarDescuento()">
                </div>
            </div>

            <table class="tabla-clientes">
                <thead>
                    <tr>
                        <th>ID Descuento</th>
                        <th>Nombre</th>
                        <th>Unidad</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody id="tablaDescuentosBody">
                    ${generarFilasDescuentos(descuentosGlobal)}
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('lista-descuentos').innerHTML = `<p>Oops... Ha ocurrido un error al cargar los descuentos</p>`;
        console.error(error);
    }
}

function generarFilasDescuentos(descuentos) {
    if (descuentos.length === 0) {
        return `<tr><td colspan="4">No se encontraron descuentos</td></tr>`;
    }

    return descuentos.map(descuento => {
        const unidad = descuento.is_percentage ? "%" : "$ (COP)";
        let valorFormateado;

        if (descuento.is_percentage) {
            // For percentage
            valorFormateado = descuento.value.toFixed(2).replace('.', ',');
        } else {
            // For pesos: format with thousands separators
            valorFormateado = descuento.value.toLocaleString("es-CO");
        }

        return `
            <tr class="fila-cliente" onclick="mostrarDetalleDescuento(${descuento.id})">
                <td>${descuento.id}</td>
                <td>${descuento.name}</td>
                <td>${unidad}</td>
                <td>${valorFormateado}</td>
            </tr>
        `;
    }).join('');
}

function buscarDescuento() {
    const input = document.getElementById('inputBusquedaDescuento').value.trim().toLowerCase();

    const filtrados = descuentosGlobal.filter(descuento =>
        descuento.name.toLowerCase().includes(input)
    );

    document.getElementById('tablaDescuentosBody').innerHTML = generarFilasDescuentos(filtrados);
}

function cargarFinanciera() {
    const contenedor = document.getElementById("contenido");
    contenedor.innerHTML = `
        <h1 class="titulo-gestion-financiera">Gestión Financiera</h1>
        <div class="fila-botones">
            <div class="bloque-financiero-generacion-facturas" onclick="mostrarVistaGenerarFactura()">
            Generación de Facturas
            <img src="assets/images/icono_generar_factura.png" alt="Icono Generar Factura" class="icono-financiero">
            </div>
            <div class="bloque-financiero-gestion-facturas" onclick="alert('Egresos')">
            Gestión de Facturas
            <img src="assets/images/icono_gestion_facturas.png" alt="Icono Gestión de Facturas" class="icono-financiero">
            </div>
            <div class="bloque-financiero-gestion-ordenes-compra" onclick="alert('Facturación')">
            Gestión de Órdenes de Compra
            <img src="assets/images/icono_gestion_ordenes_compra.png" alt="Icono Gestión de Órdenes de Compra" class="icono-financiero">
            </div>
        </div>
        <div class="fila-botones">
            <div class="bloque-financiero-gestion-impuestos" onclick="mostrarVistaImpuestos()">
            Gestión de Impuestos
            <img src="assets/images/icono_gestion_impuestos.png" alt="Icono Gestión de Impuestos" class="icono-financiero">
            </div>
            <div class="bloque-financiero-gestion-descuentos" onclick="mostrarVistaDescuentos()">
            Gestión de Descuentos
            <img src="assets/images/icono_descuentos.png" alt="Icono Descuentos" class="icono-financiero">
            </div>
            <div class="bloque-financiero-reportes-financieros" onclick="alert('Reportes')">
            Reportes Financieros
            <img src="assets/images/icono_reportes_financieros.png" alt="Icono Reportes Financieros" class="icono-financiero">
            </div>
        </div>
        <div id="lista-descuentos" style="margin-top: 30px;"></div>
    `;
}

function mostrarVistaDescuentos() {
    const contenedor = document.getElementById("contenido");
    contenedor.innerHTML = `
        <button class="btn-retorno" onclick=cargarFinanciera()><</button>
        <h1 class="titulo-gestion-descuentos">Gestión de Descuentos</h1>
        <div id="lista-descuentos"></div>
    `;
    cargarDescuentos();
}

// For percentage values: allow numbers with decimal point
function permitirDecimales(event) {
    let valor = event.target.value;

    // Allow only numbers and a comma
    valor = valor.replace(/[^0-9,]/g, '');

    const partes = valor.split(',');
    if (partes.length > 2) {
        valor = partes[0] + ',' + partes[1]; // only one comma allowed
    }

    event.target.value = valor;
}

function mostrarFormularioAgregarDescuento() {
    const contenido = document.getElementById('contenido');

    contenido.innerHTML = `
        <div class="detalle-item-container">
            <button class="btn-retorno" onclick=mostrarVistaDescuentos()><</button>
            <h1>Agregar Descuento</h1>

            <form id="form-descuento" onsubmit="guardarDescuento(event)">
                <div class="campo">
                    <label for="nombreDescuento">Nombre:</label>
                    <input type="text" maxlength="90" id="nombreDescuento" required">
                </div>

                <div class="fila-doble">
                    <div class="campo">
                        <label for="unidadDescuento">Unidad:</label>
                        <select id="unidadDescuento" required>
                            <option value="$">COP ($)</option>
                            <option value="%">%</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="valorDescuento">Valor:</label>
                        <input type="text" id="valorDescuento" required>
                    </div>
                </div>

                <div class="campo">
                    <label for="descripcionDescuento">Descripción:</label>
                    <textarea maxlength="299" id="descripcionDescuento" rows="4" placeholder="Describe brevemente el descuento..." style="resize: none;"></textarea>
                </div>

                <button type="submit" class="btn-agregar-gasto">Guardar Descuento ➕</button>
            </form>
        </div>
    `;

    setTimeout(() => {
        const unidadSelect = document.getElementById("unidadDescuento");
        const valorInput = document.getElementById("valorDescuento");

        function actualizarValidaciones() {
            valorInput.value = ""; // Clear field when changing unit
        
            // Delete both to avoid duplicates
            valorInput.removeEventListener("input", permitirSoloEnterosFormateados);
            valorInput.removeEventListener("input", permitirDecimales);
        
            if (unidadSelect.value === "$") {
                valorInput.addEventListener("input", permitirSoloEnterosFormateados);
            } else {
                valorInput.addEventListener("input", permitirDecimales);
            }
        }

        // For values ​​in pesos: only whole numbers and Colombian format
        function permitirSoloEnterosFormateados(event) {
            let valor = event.target.value.replace(/\D/g, '');
            valor = valor.slice(0, 15); // Limit to 15 numeric characters
            event.target.value = valor ? Number(valor).toLocaleString("es-CO") : '';
        }
        

        function permitirDecimales(event) {
            let valor = event.target.value.replace(/[^0-9,]/g, ''); // Only numbers and commas
        
            // Limit to a single comma
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes[1];
            }
        
            // Count only numeric characters (without commas)
            const cantidadNumeros = valor.replace(/,/g, '').length;
            if (cantidadNumeros > 3) {
                // Trim to the first 3 numeric digits respecting commas
                let numeros = '';
                let comaAgregada = false;
                for (let i = 0; i < valor.length; i++) {
                    const char = valor[i];
                    if (char === ',' && !comaAgregada) {
                        numeros += ',';
                        comaAgregada = true;
                    } else if (/\d/.test(char) && numeros.replace(/,/g, '').length < 3) {
                        numeros += char;
                    }
                }
                valor = numeros;
            }
        
            // Validate that the numerical value is not greater than 100
            const valorNumerico = parseFloat(valor.replace(',', '.'));
            if (!isNaN(valorNumerico) && valorNumerico > 100) {
                valor = '100';
            }
        
            event.target.value = valor;
        }
    
        unidadSelect.addEventListener("change", actualizarValidaciones);
        actualizarValidaciones(); // Initialize according to default value
    }, 0);
}

async function guardarDescuento(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombreDescuento").value.trim();
    const unidad = document.getElementById("unidadDescuento").value;
    const valorRaw = document.getElementById("valorDescuento").value.trim();
    const descripcion = document.getElementById("descripcionDescuento").value.trim();

    let valor;

    if (unidad === "$") {
        // Remove thousands points and parse as integer
        valor = parseInt(valorRaw.replace(/\./g, ''), 10);
    } else {
        // Replace comma with period before parsing as decimal
        valor = parseFloat(valorRaw.replace(",", "."));
    }

    const descuento = {
        name: nombre,
        is_percentage: unidad === "%",
        value: valor,
        description: descripcion
    };

    try {
        const userEmail = localStorage.getItem("userEmail");

        const response = await fetch("http://localhost:8080/discount-types", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            },
            body: JSON.stringify(descuento)
        });

        if (response.ok) {
            alert("Descuento guardado correctamente");
            cargarFinanciera();
        } else {
            const err = await response.text();
            alert("Error al guardar: " + err);
        }
    } catch (error) {
        console.error("Error al guardar descuento:", error);
        alert("Error en la solicitud");
    }
}

////////////////////////////////////////////////////////////////////////////////////

let impuestosGlobal = [];

async function cargarImpuestos() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const respuesta = await fetch('http://localhost:8080/tax-types', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener los impuestos');
        impuestosGlobal = await respuesta.json();

        const tablaBody = document.getElementById('tablaImpuestosBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasImpuestos(impuestosGlobal);
            return;
        }

        document.getElementById('lista-impuestos').innerHTML = `
        <div class="contenedor-superior">
            <button class="btn-agregar-descuento" onclick="mostrarFormularioAgregarImpuesto()">+ Agregar Impuesto 🧾</button>
            <div class="refresh-container-descuento" onclick="cargarImpuestos()">
                <div class="refresh-logo-descuento">⟳</div>
            </div>
        </div>

        <div class="barra-busqueda">
            <div class="busqueda-container">
                <select id="filtroBusqueda" onchange="buscarImpuesto()">
                    <option value="name">Nombre</option>
                </select>
                <input type="text" id="inputBusquedaImpuesto" placeholder="Buscar impuesto.." oninput="buscarImpuesto()">
            </div>
        </div>

        <table class="tabla-clientes">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Valor</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody id="tablaImpuestosBody">
                ${generarFilasImpuestos(impuestosGlobal)}
            </tbody>
        </table>`;
    } catch (error) {
        document.getElementById('lista-impuestos').innerHTML = `<p>Error al cargar impuestos</p>`;
        console.error(error);
    }
}

function generarFilasImpuestos(impuestos) {
    if (impuestos.length === 0) {
        return `<tr><td colspan="5">No se encontraron impuestos</td></tr>`;
    }

    return impuestos.map(impuesto => {
        const unidad = impuesto.is_percentage ? "%" : "$ (COP)";
        let valorFormateado;

        if (impuesto.is_percentage) {
            // For percentages
            valorFormateado = impuesto.value.toFixed(2).replace('.', ',');
        } else {
            // For pesos: points every 3 digits
            valorFormateado = impuesto.value.toLocaleString("es-CO");
        }

        return `
            <tr>
                <td>${impuesto.id}</td>
                <td>${impuesto.name}</td>
                <td>${unidad}</td>
                <td>${valorFormateado}</td>
                <td>${impuesto.description || ''}</td>
            </tr>
        `;
    }).join('');
}

function buscarImpuesto() {
    const input = document.getElementById('inputBusquedaImpuesto').value.trim().toLowerCase();

    const filtrados = impuestosGlobal.filter(impuesto =>
        impuesto.name.toLowerCase().includes(input)
    );

    document.getElementById('tablaImpuestosBody').innerHTML = generarFilasImpuestos(filtrados);
}

function mostrarVistaImpuestos() {
    const contenedor = document.getElementById("contenido");
    contenedor.innerHTML = `
        <button class="btn-retorno" onclick=cargarFinanciera()><</button>
        <h1 class="titulo-gestion-descuentos">Gestión de Impuestos</h1>
        <div id="lista-impuestos"></div>
    `;
    cargarImpuestos();
}

function mostrarFormularioAgregarImpuesto() {
    const contenido = document.getElementById('contenido');

    contenido.innerHTML = `
        <div class="detalle-item-container">
            <button class="btn-retorno" onclick=mostrarVistaImpuestos()><</button>
            <h1>Agregar Impuesto</h1>

            <form id="form-impuesto" onsubmit="guardarImpuesto(event)">
                <div class="campo">
                    <label for="nombreImpuesto">Nombre:</label>
                    <input type="text" maxlength="90" id="nombreImpuesto" required>
                </div>

                <div class="fila-doble">
                    <div class="campo">
                        <label for="unidadImpuesto">Unidad:</label>
                        <select id="unidadImpuesto" required>
                            <option value="$">COP ($)</option>
                            <option value="%">%</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="valorImpuesto">Valor:</label>
                        <input type="text" id="valorImpuesto" required>
                    </div>
                </div>

                <div class="campo">
                    <label for="descripcionImpuesto">Descripción:</label>
                    <textarea maxlength="299" id="descripcionImpuesto" rows="4" style="resize: none;" placeholder="Describe el impuesto..."></textarea>
                </div>

                <button type="submit" class="btn-agregar-gasto">Guardar Impuesto ➕</button>
            </form>
        </div>
    `;

    setTimeout(() => {
        const unidadSelect = document.getElementById("unidadImpuesto");
        const valorInput = document.getElementById("valorImpuesto");

        function actualizarValidaciones() {
            valorInput.value = "";

            valorInput.removeEventListener("input", permitirSoloEnterosFormateados);
            valorInput.removeEventListener("input", permitirDecimales);

            if (unidadSelect.value === "$") {
                valorInput.addEventListener("input", permitirSoloEnterosFormateados);
            } else {
                valorInput.addEventListener("input", permitirDecimales);
            }
        }

        function permitirSoloEnterosFormateados(event) {
            let valor = event.target.value.replace(/\D/g, '');
            valor = valor.slice(0, 15);
            event.target.value = valor ? Number(valor).toLocaleString("es-CO") : '';
        }

        function permitirDecimales(event) {
            let valor = event.target.value.replace(/[^0-9,]/g, '');
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes[1];
            }

            const cantidadNumeros = valor.replace(/,/g, '').length;
            if (cantidadNumeros > 3) {
                let numeros = '';
                let comaAgregada = false;
                for (let i = 0; i < valor.length; i++) {
                    const char = valor[i];
                    if (char === ',' && !comaAgregada) {
                        numeros += ',';
                        comaAgregada = true;
                    } else if (/\d/.test(char) && numeros.replace(/,/g, '').length < 3) {
                        numeros += char;
                    }
                }
                valor = numeros;
            }

            const valorNumerico = parseFloat(valor.replace(',', '.'));
            if (!isNaN(valorNumerico) && valorNumerico > 100) {
                valor = '100';
            }

            event.target.value = valor;
        }

        unidadSelect.addEventListener("change", actualizarValidaciones);
        actualizarValidaciones();
    }, 0);
}

async function guardarImpuesto(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombreImpuesto").value.trim();
    const unidad = document.getElementById("unidadImpuesto").value;
    const valorRaw = document.getElementById("valorImpuesto").value.trim();
    const descripcion = document.getElementById("descripcionImpuesto").value.trim();

    let valor;
    if (unidad === "$") {
        valor = parseInt(valorRaw.replace(/\./g, ''), 10);
    } else {
        valor = parseFloat(valorRaw.replace(",", "."));
    }

    const impuesto = {
        name: nombre,
        is_percentage: unidad === "%",
        value: valor,
        description: descripcion
    };

    try {
        const userEmail = localStorage.getItem("userEmail");

        const response = await fetch("http://localhost:8080/tax-types", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            },
            body: JSON.stringify(impuesto)
        });

        if (response.ok) {
            alert("Impuesto guardado correctamente");
            mostrarVistaImpuestos();
        } else {
            const err = await response.text();
            alert("Error al guardar: " + err);
        }
    } catch (error) {
        console.error("Error al guardar impuesto:", error);
        alert("Error en la solicitud");
    }
}



async function cargarEmpleados() {
    const userEmail = sessionStorage.getItem("userEmail");
    try {
        const respuesta = await fetch('http://localhost:8080/employees', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener los empleados');
        const empleados = await respuesta.json();

        // Verifica que el contenedor exista en el DOM
        const listaEmpleadosContainer = document.getElementById('lista-empleados');
        if (!listaEmpleadosContainer) {
            console.error("Elemento 'lista-empleados' no encontrado en el DOM.");
            return;
        }

        // Si ya existe la tabla, solo actualizamos el tbody
        const tablaBody = document.getElementById('tablaEmpleadosBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasEmpleados(empleados);
            return;
        }

        // Si la tabla no existe, creamos la estructura completa
        listaEmpleadosContainer.innerHTML = `
            <button class="btn-agregar-empleado" onclick="mostrarFormularioAgregarEmpleado()"> Agregar Empleado</button>
            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <input type="text" id="inputBusquedaEmpleado" placeholder="Buscar empleado..." oninput="buscarEmpleado()">
                    <select id="filtroBusquedaEmpleado" onchange="buscarEmpleado()">
                        <option value="id">ID</option>
                        <option value="names">Nombre</option>
                        <option value="last_names">Apellido</option>
                        <option value="personal_id">Identificación</option>
                        <option value="address">Dirección</option>
                        <option value="phone_numbers">Teléfono</option>
                    </select>
                </div>
            </div>
            <table class="tabla-empleados">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Identificacion</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>ID de usuario</th>
                        <th>Tipo de identificacion</th>
                    </tr>
                </thead>
                <tbody id="tablaEmpleadosBody">
                    ${generarFilasEmpleados(empleados)}
                </tbody>
            </table>
        `;
    }
    catch (error) {
        const listaEmpleadosContainer = document.getElementById('lista-empleados');
        if (listaEmpleadosContainer) {
            listaEmpleadosContainer.innerHTML = `<p>Oops... Ha ocurrido un error al cargar los empleados: ${error.message}</p>`;
        } else {
            console.error("Elemento 'lista-empleados' no encontrado al mostrar error:", error);
        }
    }
}

function generarFilasEmpleados(empleados) {
    const tiposIdentificador = {
        1: "Pasaporte",
        2: "Licencia de conducción",
        3: "Cédula",
        4: "SSN",
        5: "Permiso de trabajo",
        6: "Tarjeta de residencia",
        7: "ID militar",
        8: "ID estudiante",
        9: "ID impuestos",
        10: "Número de registro de compañía",
        11: "NIT"
    };

    return empleados.map(empleado => `
        <tr onclick="mostrarDetalleEmpleado(${empleado.id})">
            <td>${empleado.id}</td>
            <td>${empleado.names}</td>
            <td>${empleado.last_names}</td>
            <td>${empleado.personal_id}</td>
            <td>${empleado.address}</td>
            <td>${empleado.phone_numbers}</td>
            <td>${empleado.user_id}</td>
            <td>${tiposIdentificador[empleado.identifier_type_id] || 'Desconocido'}</td>
        </tr>
    `).join('');
}

function mostrarFormularioAgregarEmpleado() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = `
        <div class="detalle-empleado-container">
            <button class="btn-retorno" onclick="cargarSeccion('empleados')"><</button>
            <form id="form-empleado" onsubmit="guardarEmpleado(event)">
                <div class="campo">
                    <label for="Names">Nombre:</label>
                    <input type="text" id="Names" required>
                </div>
                <div class="campo">
                    <label for="LastNames">Apellido:</label>
                    <input type="text" id="LastNames" required>
                </div>
                <div class="campo">
                    <label for="PersonalID">ID Personal:</label>
                    <input type="text" id="PersonalID" required>
                </div>
                <div class="campo">
                    <label for="Address">Dirección:</label>
                    <input type="text" id="Address" required>
                </div>
                <div class="campo">
                    <label for="PhoneNumbers">Teléfono:</label>
                    <input type="text" id="PhoneNumbers" required>
                </div>
                <div class="campo">
                    <label for="UserID">ID de usuario:</label>
                    <input type="text" id="UserID" required>
                </div>
                <div class="campo">
                    <label for="IdType">Tipo de identificación:</label>
                    <select id="identifier_type_id" required>
                        <option value="1">Pasaporte</option>
                        <option value="2">Licencia de conducción</option>
                        <option value="3">Cédula</option>
                        <option value="4">SSN</option>
                        <option value="5">Permiso de trabajo</option>
                        <option value="6">Tarjeta de residencia</option>
                        <option value="7">ID militar</option>
                        <option value="8">ID estudiante</option>
                        <option value="9">ID impuestos</option>
                        <option value="10">Número de registro de compañía</option>
                        <option value="11">NIT</option>
                    </select>
                </div>
                <button type="submit" class="btn-guardar-empleado">Guardar Empleado</button>
            </form>
        </div>
    `;
}

async function mostrarDetalleEmpleado(id) {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const res = await fetch(`http://localhost:8080/employees/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!res.ok) throw new Error('No se pudo obtener el detalle del empleado');
        const empleado = await res.json();

        const contenido = document.getElementById('contenido');
        contenido.innerHTML = `
            <div class="detalle-empleado-container">
                <button class="btn-retorno" onclick="cargarSeccion('empleados')"><</button>
                <form id="form-editar-empleado" onsubmit="actualizarEmpleado(${id}); return false;">
                    <div class="campo">
                        <label for="Names">Nombre:</label>
                        <input type="text" id="Names" value="${empleado.names}" required>
                    </div>
                    <div class="campo">
                        <label for="LastNames">Apellido:</label>
                        <input type="text" id="LastNames" value="${empleado.last_names}" required>
                    </div>
                    <div class="campo">
                        <label for="PersonalID">ID Personal:</label>
                        <input type="text" id="PersonalID" value="${empleado.personal_id}" required>
                    </div>
                    <div class="campo">
                        <label for="Address">Dirección:</label>
                        <input type="text" id="Address" value="${empleado.address}" required>
                    </div>
                    <div class="campo">
                        <label for="PhoneNumbers">Teléfono:</label>
                        <input type="text" id="PhoneNumbers" value="${empleado.phone_numbers}" required>
                    </div>
                    <div class="campo">
                        <label for="UserID">ID de usuario:</label>
                        <input type="text" id="UserID" value="${empleado.user_id}" required>
                    </div>
                    <div class="campo">
                        <label for="identifier_type_id">Tipo de identificación:</label>
                        <select id="identifier_type_id" required>
                            <option value="1">Pasaporte</option>
                            <option value="2">Licencia de conducción</option>
                            <option value="3">Cédula</option>
                            <option value="4">SSN</option>
                            <option value="5">Permiso de trabajo</option>
                            <option value="6">Tarjeta de residencia</option>
                            <option value="7">ID militar</option>
                            <option value="8">ID estudiante</option>
                            <option value="9">ID impuestos</option>
                            <option value="10">Número de registro de compañía</option>
                            <option value="11">NIT</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-guardar-empleado">Actualizar Empleado</button>
                </form>
            </div>
        `;

        // Selecciona automáticamente el tipo de identificación actual
        document.getElementById('identifier_type_id').value = empleado.identifier_type_id;

    } catch (error) {
        console.error("Error al mostrar detalles:", error);
        alert("Error al mostrar el detalle del empleado");
    }
}

async function guardarEmpleado(event) {
    event.preventDefault();

    const userEmail = sessionStorage.getItem("userEmail");

    // 1) Recogemos los valores del formulario
    const Names = document.getElementById('Names').value.trim();
    const LastNames = document.getElementById('LastNames').value.trim();
    const PersonalID = document.getElementById('PersonalID').value.trim();
    const Address = document.getElementById('Address').value.trim();
    const PhoneNumbers = document.getElementById('PhoneNumbers').value.trim();
    const UserID = parseInt(document.getElementById('UserID').value);
    const IdentifierTypeID = parseInt(document.getElementById('identifier_type_id').value);

    // Validación básica
    if (!Names || !LastNames || !PersonalID || isNaN(UserID) || isNaN(IdentifierTypeID)) {
        alert("Por favor, completa todos los campos requeridos correctamente.");
        return;
    }

    // 2) Creamos el objeto empleado
    const empleado = {
        names: Names,
        last_names: LastNames,
        personal_id: PersonalID,
        address: Address,       
        phone_numbers: PhoneNumbers,
        user_id: UserID,
        identifier_type_id: IdentifierTypeID
    };

    console.log("Empleado a guardar:", empleado); // Debugging line

    try {
        // 3) Enviamos el objeto al servidor
        const respuesta = await fetch('http://localhost:8080/employees', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            },
            body: JSON.stringify(empleado)
        });

        if (!respuesta.ok) throw new Error('Error al guardar el empleado');

        alert("Empleado guardado correctamente");
        cargarSeccion('empleados'); // Recargamos la vista de empleados
    } catch (error) {
        console.error("Error al guardar empleado:", error);
        alert("Error en la solicitud");
    }
}

async function buscarEmpleado() {
    const input = document.getElementById('inputBusquedaEmpleado').value.trim().toLowerCase();
    const filtro = document.getElementById('filtroBusquedaEmpleado').value;

    // Traer empleados (puedes reemplazar esto si ya tienes los datos cargados en memoria)
    const empleados = await fetch('http://localhost:8080/employees', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Username": sessionStorage.getItem("userEmail")
        }
    }).then(res => res.json());

    const filtrados = empleados.filter(empleado => {
        const valorCampo = (empleado[filtro] || '').toString().toLowerCase();
        return valorCampo.includes(input);
    });

    document.getElementById('tablaEmpleadosBody').innerHTML = generarFilasEmpleados(filtrados);
}

async function actualizarEmpleado(id) {
    const userEmail = sessionStorage.getItem("userEmail");

    const Names = document.getElementById('Names').value.trim();
    const LastNames = document.getElementById('LastNames').value.trim();
    const PersonalID = document.getElementById('PersonalID').value.trim();
    const Address = document.getElementById('Address').value.trim();
    const PhoneNumbers = document.getElementById('PhoneNumbers').value.trim();
    const UserID = parseInt(document.getElementById('UserID').value);
    const IdentifierTypeID = parseInt(document.getElementById('identifier_type_id').value);

    const bodyPut = {
        names: Names,
        last_names: LastNames,
        personal_id: PersonalID,
        address: Address,
        phone_numbers: PhoneNumbers,
        user_id: UserID,
        identifier_type_id: IdentifierTypeID
    };

    console.log("Empleado a actualizar:", bodyPut); // Debugging line

    try {
        const resPut = await fetch(`http://localhost:8080/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Username': userEmail
            },
            body: JSON.stringify(bodyPut)
        });

        if (!resPut.ok) {
            const detalle = await resPut.text();
            throw new Error(`PUT empleado: ${resPut.status} ${resPut.statusText} – ${detalle}`);
        }

        alert("Empleado actualizado correctamente");
        cargarSeccion('empleados');
    } catch (err) {
        console.error("Error al actualizar empleado:", err);
        alert("Error al actualizar el empleado");
    }
}


///////////////////////////////////////////////////////////////////////////////////

// Asynchronous function to load user data from an API
async function cargarUsuarios() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const respuesta = await fetch('http://localhost:8080/users',{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        })
        
        if (!respuesta.ok) {
            const errorData = await respuesta.json();  // Intentar obtener los detalles del error
            throw new Error(`Error al obtener los usuarios: ${errorData.message || 'Sin detalles'}`);
        }
        const usuarios = await respuesta.json();

        // Verifica que el contenedor exista en el DOM
        const listaUsuariosContainer = document.getElementById('lista-usuarios');
        if (!listaUsuariosContainer) {
            console.error("Elemento 'lista-usuarios' no encontrado en el DOM.");
            return;
        }

        // Si ya existe la tabla, solo actualizamos el tbody
        const tablaBody = document.getElementById('tablaUsuariosBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasUsuarios(usuarios);
            return;
        }

        // Si la tabla no existe, creamos la estructura completa
        listaUsuariosContainer.innerHTML = `
            <button class="btn-agregar-usuario" onclick="mostrarFormularioAgregarUsuario()"> Agregar Usuario</button>
            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <input type="text" id="inputBusquedaUser" placeholder="Buscar usuario..." oninput="buscarUsuario()">
                    <select id="filtroBusquedaUser" onchange="buscarUsuario()">
                        <option value="id">ID</option>
                        <option value="email">Email</option>
                    </select>
                </div>
            </div>
            <table class="tabla-users">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Tipo de Usuario</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="tablaUsuariosBody">
                    ${generarFilasUsuarios(usuarios)}
                </tbody>
            </table>
        `;
    } catch (error) {
        const listaUsuariosContainer = document.getElementById('lista-usuarios');
        if (listaUsuariosContainer) {
            listaUsuariosContainer.innerHTML = `<p>Oops... Ha ocurrido un error al cargar los usuarios: ${error.message}</p>`;
        } else {
            console.error("Elemento 'lista-usuarios' no encontrado al mostrar error:", error);
        }
    }
}

// Función para generar las filas de la tabla de usuarios
function generarFilasUsuarios(usuarios) {
    return usuarios.map(usuario => `
        <tr onclick="mostrarDetalleUsuario(${usuario.id})">
            <td>${usuario.id}</td>
            <td>${usuario.email}</td>
            <td>
              ${usuario.user_type == 1
                  ? 'Administrador'
                  : usuario.user_type == 2
                    ? 'Inventario'
                    : usuario.user_type == 3
                      ? 'Web'
                      : usuario.user_type}
            </td>
            <td>
              ${usuario.user_state == 1
                  ? 'Activo'
                  : usuario.user_state == 2
                    ? 'Inactivo'
                    : usuario.user_state == 3
                      ? 'Fuera de servicio'
                      : usuario.user_state}
            </td>
        </tr>
    `).join('');
}

// Función para mostrar el formulario de agregar usuario
function mostrarFormularioAgregarUsuario() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = `
        <div class="detalle-usuario-container">
            <button class="btn-retorno" onclick="cargarSeccion('usuarios')"><</button>
            <form id="form-usuario" onsubmit="guardarUsuario(event)">
                <div class="campo">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                <div class="campo">
                    <label for="password">Password:</label>
                    <input type="password" id="password" required>
                </div>
                <div class="campo">
                    <label for="userTypeID">Tipo de usuario:</label>
                    <select id="userTypeID" required>
                        <option value="1">Administrador</option>
                        <option value="2">Inventario</option>
                        <option value="3">Web</option>
                    </select>
                </div>
                <div class="campo">
                    <label for="userStateID">Estado de usuario:</label>
                    <select id="userStateID" required>
                        <option value="1">Activo</option>
                    </select>
                </div>
                <button type="submit" class="btn-guardar-usuario">Guardar Usuario</button>
            </form>
        </div>
    `;
}

// Función para guardar un nuevo usuario (envía datos vía POST)
async function guardarUsuario(event) {
    event.preventDefault();
    const userEmail   = sessionStorage.getItem("userEmail");

    // 1) Recogemos los valores del formulario
    const email       = document.getElementById('email').value.trim();
    const password    = document.getElementById('password').value;
    const userTypeID  = parseInt(document.getElementById('userTypeID').value);
    const userStateID = parseInt(document.getElementById('userStateID').value);

    // 2) Creamos el objeto para el POST inicial
    const nuevoUsuario = { email, password, user_type: userTypeID, user_state: userStateID };

    try {
        // 3) POST /users
        const resPost = await fetch('http://localhost:8080/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Username': userEmail
            },
            body: JSON.stringify(nuevoUsuario)
        });
        if (!resPost.ok) {
            const detalle = await resPost.text();
            throw new Error(`POST usuario: ${resPost.status} ${resPost.statusText} – ${detalle}`);
        }

        cargarUsuarios();

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}
// Función para mostrar el detalle de un usuario y permitir su edición
async function mostrarDetalleUsuario(userId) {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const res = await fetch(`http://localhost:8080/users/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Username': userEmail
            }
        });
        if (!res.ok) throw new Error('Error al cargar el usuario');
        const u = await res.json();

        document.getElementById('contenido').innerHTML = `
            <div class="detalle-usuario-container">
                <button class="btn-retorno" onclick="cargarSeccion('usuarios')">&lt;</button>
                <h1>Detalles del Usuario</h1>
                <form id="form-usuario" onsubmit="actualizarUsuario(event, ${u.id})">
                    <div class="campo">
                        <label>ID:</label>
                        <div class="campo-no-editable">${u.id}</div>
                    </div>
                    <div class="campo">
                        <label for="email">Email:</label>
                        <input type="email" id="email" value="${u.email}" required>
                    </div>
                    <div class="campo">
                        <label for="password">Password:</label>
                        <input type="password" id="password" placeholder="Dejar en blanco para no cambiar">
                    </div>
                    <div class="campo">
                        <label for="userTypeID">Tipo de usuario:</label>
                        <select id="userTypeID" required>
                            <option value="1" ${u.user_type == 1 ? 'selected' : ''}>Usuario Administrador</option>
                            <option value="2" ${u.user_type == 2 ? 'selected' : ''}>Usuario de inventario</option>
                            <option value="3" ${u.user_type == 3 ? 'selected' : ''}>Usuario Web</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="userStateID">Estado de usuario:</label>
                        <select id="userStateID" required>
                            <option value="1" ${u.user_state == 1 ? 'selected' : ''}>Activo</option>
                            <option value="2" ${u.user_state == 2 ? 'selected' : ''}>Inactivo</option>
                            <option value="3" ${u.user_state == 3 ? 'selected' : ''}>Fuera de servicio</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-actualizar">Actualizar Usuario</button>
                </form>
            </div>
        `;
    } catch (error) {
        console.error(error);
        alert(`Error al cargar el usuario: ${error.message}`);
    }
}

// Función para actualizar un usuario (envía datos vía PUT o PATCH)
async function actualizarUsuario(event, userId) {
    event.preventDefault();
    const userEmail   = sessionStorage.getItem("userEmail");
    const email       = document.getElementById('email').value.trim();
    const password    = document.getElementById('password').value;
    const userTypeID  = parseInt(document.getElementById('userTypeID').value, 10);
    const userStateID = parseInt(document.getElementById('userStateID').value, 10);

    // 1) Preparamos el cuerpo para el PUT (sin estado)
    const bodyPut = { email };
    if (password) bodyPut.password = password;
    bodyPut.user_type = userTypeID;

    // 2) Ejecutamos el PUT /users/:id
    try {
        const resPut = await fetch(`http://localhost:8080/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Username': userEmail
            },
            body: JSON.stringify(bodyPut)
        });
        if (!resPut.ok) {
            const detalle = await resPut.text();
            throw new Error(`PUT usuario: ${resPut.status} ${resPut.statusText} – ${detalle}`);
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
        return; // Salimos sin tocar el estado
    }

    // 3) Ahora actualizamos SOLO el estado con PATCH /users/:id/state
    try {
        const resPatch = await fetch(`http://localhost:8080/users/${userId}/state`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Username': userEmail
            },
            body: JSON.stringify({ user_state: userStateID })
        });
        if (!resPatch.ok) {
            const detalle = await resPatch.text();
            throw new Error(`PATCH estado: ${resPatch.status} ${resPatch.statusText} – ${detalle}`);
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
        return;
    }

    // 4) Si todo salió bien, recargamos la lista
    cargarUsuarios();
}

// Ejemplo de función para búsqueda dinámica de usuarios (opcional)
async function buscarUsuario() {
    const texto = document.getElementById('inputBusquedaUser').value.trim();
    const filtro = document.getElementById('filtroBusquedaUser').value;
    const tablaBody = document.getElementById('tablaUsuariosBody');
    const userEmail = sessionStorage.getItem("userEmail");

    if (!texto) {
        return cargarUsuarios();
    }

    let url;
    if (filtro === "id") {
        url = `http://localhost:8080/users/searchByID?id=${encodeURIComponent(texto)}`;
    } else {  // email
        url = `http://localhost:8080/users/searchByEmail?email=${encodeURIComponent(texto)}`;
    }

    try {
        const res = await fetch(url, { headers: { 'Username': userEmail } });
        if (!res.ok) throw new Error('Error en la búsqueda');

        const datos = await res.json();
        // por si el endpoint devuelve un solo objeto cuando filtras por ID
        const array = Array.isArray(datos) ? datos : [datos];

        if (array.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="4">No se encontraron resultados</td></tr>`;
        } else {
            tablaBody.innerHTML = generarFilasUsuarios(array);
        }
    } catch (e) {
        console.error("Error en la búsqueda de usuarios:", e);
        tablaBody.innerHTML = `<tr><td colspan="4">No se encontraron resultados</td></tr>`;
    }
}

// Llama cargarUsuarios cuando la página se carga
document.addEventListener('DOMContentLoaded', cargarUsuarios);



// Function to Generate PDF of Inventory Report
async function generarPDFReporteInventario() {
    try {
        // Get the user's email stored in sessionStorage
        const userEmail = sessionStorage.getItem("userEmail");

        // Get the items
        const respuestaItems = await fetch("http://localhost:8080/items", {
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
        const respuestaTipos = await fetch("http://localhost:8080/item-types", {
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
        urlBusqueda = `http://localhost:8080/items/searchById?id=${encodeURIComponent(textoBusqueda)}`;
    } else {
        urlBusqueda = `http://localhost:8080/items/searchByName?name=${encodeURIComponent(textoBusqueda)}`;
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
        tablaBody.innerHTML = generarFilasTablaUsuario(itemsArray);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        tablaBody.innerHTML = `<tr><td colspan="3">No se encontraron resultados</td></tr>`;
    }
}


// Function to load all items in the table
async function cargarItems() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const respuesta = await fetch('http://localhost:8080/items', {
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

        // Loads the table interface even if there are no items
        document.getElementById('lista-items').innerHTML = `
            <button class="btn-agregar-item" onclick="mostrarFormularioAgregarItem()"> + Agregar ítem 🚗</button>
            <button class="btn-agregar-tipo-item" onclick="generarPDFReporteInventario()">Generar Reporte (PDF) 📄</button>

            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <select id="filtroBusqueda" onchange="buscarItem()">
                        <option value="id">ID</option>
                        <option value="name">Nombre</option>
                    </select>
                    <input type="text" id="inputBusqueda" placeholder="Buscar ítem..." oninput="buscarItem()">
                </div>
            </div>

            <table class="tabla-items">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="tablaItemsBody">
                    ${generarFilasTabla(items)}
                </tbody>
            </table>
        `;
    } catch (error) {
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
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="tablaItemsBody">
                    <tr><td colspan="4">No hay ítems disponibles</td></tr>
                </tbody>
            </table>
        `;
    }
}

// Function to dynamically generate the rows of the items table
function generarFilasTabla(items) {
    if (!items || items.length === 0) {
        return `<tr><td colspan="3">No hay ítems disponibles</td></tr>`;
    }

    return items.map(item => `
        <tr class="fila-item" onclick="mostrarDetalleItem(${item.id})">
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${Number(item.stock).toLocaleString("es-CO")}</td>
            <td>
                <div class="estado-circulo ${item.item_state ? 'activo' : 'inactivo'}"></div>
            </td>
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
            fetchData(`http://localhost:8080/items/${id}`, 'Error al cargar el ítem'),
            fetchData('http://localhost:8080/item-types', 'Error al cargar los tipos de ítem'),
            fetchData(`http://localhost:8080/historical-item-prices/${id}`, 'Error al cargar el historial de precios')
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
                                <input type="text" id="nombre" maxlength="50" value="${item.name}" required>
                            </div>
                            <div class="campo">
                                <label for="stock">Stock:</label>
                                <input type="text" id="stock" value="${item.stock}" required>
                            </div>
                        </div>

                        <div class="columna">
                            <div class="campo">
                                <label for="precioCompra">Precio de compra:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ </span>
                                    <input type="text" id="precioCompra" value="${item.purchase_price}" required>
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
                                    <span class="prefijo">COP $ </span>
                                    <input type="text" id="precioVenta" value="${item.selling_price}" required>
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
                                    <th>Precio (COP)</th>
                                    <th>Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historial.map(h => `
                                    <tr>
                                        <td>${Number(h.price).toLocaleString("es-CO")}</td>
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

        // Add restrictions to allow only numbers in the specified fields
        function permitirSoloNumeros(event) {
            event.target.value = event.target.value.replace(/\D/g, ''); // Removes any character that is not a number
        }

        // Wait for the DOM to update form elements
        setTimeout(() => {
            document.getElementById("precioCompra").addEventListener("input", permitirSoloNumeros);
            document.getElementById("precioVenta").addEventListener("input", permitirSoloNumeros);
            document.getElementById("stock").addEventListener("input", permitirSoloNumeros);
        }, 0);


        // Function to allow only numbers and format with thousands separators
        function formatearNumero(event) {
            let valor = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
            if (valor) {
                valor = Number(valor).toLocaleString("es-CO"); // Apply Colombian format
            }
            event.target.value = valor;
        }

        // Apply formatting to price and stock fields
        setTimeout(() => {
            document.getElementById("precioCompra").addEventListener("input", formatearNumero);
            document.getElementById("precioVenta").addEventListener("input", formatearNumero);
            document.getElementById("stock").addEventListener("input", formatearNumero);

            // Restore formatting when the page loads
            document.getElementById("precioCompra").value = Number(document.getElementById("precioCompra").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
            document.getElementById("precioVenta").value = Number(document.getElementById("precioVenta").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
            document.getElementById("stock").value = Number(document.getElementById("stock").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
        }, 0);

            // Function to charge additional expenses when the section is displayed
            window.toggleGastos = async function (itemId) {
                const gastosContainer = document.getElementById('gastos-container');
                const icono = document.getElementById('toggle-gastos-icon');

                if (gastosContainer.classList.contains('oculto')) {
                    try {
                        const respuesta = await fetch('http://localhost:8080/additional-expenses', {
                            headers: { 'Username': userEmail }
                        });
    
                        if (!respuesta.ok) throw new Error('Error al cargar los gastos adicionales');

                        const gastosAdicionales = await respuesta.json();
                        const gastosFiltrados = gastosAdicionales.filter(gasto => gasto.item_id === itemId);

                        gastosContainer.innerHTML = gastosFiltrados.length > 0
                            ? `<table class="tabla-gastos">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Unidad</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${gastosFiltrados.map(gasto => `
                                        <tr onclick="mostrarFormularioEditarGasto(${gasto.id}, ${itemId})" style="cursor: pointer;">
                                            <td>${gasto.name}</td>
                                            <td>COP ($)</td>
                                            <td>${Number(gasto.expense).toLocaleString("es-CO")}</td>
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
        const tiposDeItem = await fetch('http://localhost:8080/item-types', {
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
                                <input type="text" id="nombre" maxlength="50" required>
                            </div>
                            <div class="campo">
                                <label for="stock">Stock:</label>
                                <input type="text" id="stock" required>
                            </div>
                        </div>

                        <!-- Second column: Purchase Price and State -->
                        <div class="columna">
                            <div class="campo">
                                <label for="precioCompra">Precio de compra:</label>
                                <div class="campo-moneda">
                                    <span class="prefijo">COP $ </span>
                                    <input type="text" id="precioCompra" required>
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
                                    <span class="prefijo">COP $ </span>
                                    <input type="text" id="precioVenta" required>
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
                            <textarea id="descripcion" maxlength="280" required style="resize: none;"></textarea>
                        </div>
                    </div>

                    <!-- Submit button to save the item -->
                    <button type="submit" class="btn-actualizar">Guardar Ítem ✅</button>
                </form>
            </div>
        `;

        // Add restrictions to allow only numbers in the specified fields
        function permitirSoloNumeros(event) {
            event.target.value = event.target.value.replace(/\D/g, ''); // Removes any character that is not a number
        }

        // Wait for the DOM to update form elements
        setTimeout(() => {
            document.getElementById("precioCompra").addEventListener("input", permitirSoloNumeros);
            document.getElementById("precioVenta").addEventListener("input", permitirSoloNumeros);
            document.getElementById("stock").addEventListener("input", permitirSoloNumeros);
        }, 0);


        // Function to allow only numbers and format with thousands separators
        function formatearNumero(event) {
            let valor = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
            if (valor) {
                valor = Number(valor).toLocaleString("es-CO"); // Apply Colombian format
            }
            event.target.value = valor;
        }

        // Apply formatting to price and stock fields
        setTimeout(() => {
            document.getElementById("precioCompra").addEventListener("input", formatearNumero);
            document.getElementById("precioVenta").addEventListener("input", formatearNumero);
            document.getElementById("stock").addEventListener("input", formatearNumero);

            // Restore formatting when the page loads
            document.getElementById("precioCompra").value = Number(document.getElementById("precioCompra").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
            document.getElementById("precioVenta").value = Number(document.getElementById("precioVenta").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
            document.getElementById("stock").value = Number(document.getElementById("stock").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
        }, 0);    

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
    const stock = parseFloat(document.getElementById('stock').value.replace(/\./g, '').replace(',', '.'));
    const purchasePrice = parseFloat(document.getElementById('precioCompra').value.replace(/\./g, '').replace(',', '.'));
    const sellingPrice = parseFloat(document.getElementById('precioVenta').value.replace(/\./g, '').replace(',', '.'));
    const descripcion = document.getElementById('descripcion').value.trim();

    // Validations
    if (nombre === '') {
        alert('Error: El nombre del ítem no puede estar vacío.');
        return;
    }

    if (descripcion === '') {
        alert('Error: La descripción del ítem no puede estar vacía.');
        return;
    }

    if (stock < 0 || purchasePrice < 0 || sellingPrice < 0) {
        alert('Error: El stock, el precio de compra y el precio de venta no pueden ser negativos.');
        return;
    }

    if (stock > 10000000) {
        alert('Error: Valor de stock inválido.');
        return;
    }
    
    if (purchasePrice > 9999999999999 || purchasePrice === 0) {
        alert('Error: Precio de compra inválido.');
        return;
    }

    if (sellingPrice > 9999999999999 || sellingPrice === 0) {
        alert('Error: Precio de venta inválido.');
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
        description: descripcion
    };

    try {
        // Sends the POST request to the backend
        const respuesta = await fetch('http://localhost:8080/items', {
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
                    <input type="text" id="valorGasto" required>
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

        // Add restrictions to allow only numbers in the specified fields
        function permitirSoloNumeros(event) {
            event.target.value = event.target.value.replace(/\D/g, ''); // Removes any character that is not a number
        }

        // Wait for the DOM to update form elements
        setTimeout(() => {
            document.getElementById("valorGasto").addEventListener("input", permitirSoloNumeros);
        }, 0);


        // Function to allow only numbers and format with thousands separators
        function formatearNumero(event) {
            let valor = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
            if (valor) {
                valor = Number(valor).toLocaleString("es-CO"); // Apply Colombian format
            }
            event.target.value = valor;
        }

        // Apply formatting to price and stock fields
        setTimeout(() => {
            document.getElementById("valorGasto").addEventListener("input", formatearNumero);

            // Restore formatting when the page loads
            document.getElementById("valorGasto").value = Number(document.getElementById("valorGasto").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
        }, 0);       
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
        fetch(`http://localhost:8080/additional-expenses/${gastoId}`, {
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
                            <input type="text" id="valorGasto" value="${gasto.expense}" required>
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

        // Add restrictions to allow only numbers in the specified fields
        function permitirSoloNumeros(event) {
            event.target.value = event.target.value.replace(/\D/g, ''); // Removes any character that is not a number
        }

        // Wait for the DOM to update form elements
        setTimeout(() => {
            document.getElementById("valorGasto").addEventListener("input", permitirSoloNumeros);
        }, 0);

        // Function to allow only numbers and format with thousands separators
        function formatearNumero(event) {
            let valor = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
            if (valor) {
                valor = Number(valor).toLocaleString("es-CO"); // Apply Colombian format
            }
            event.target.value = valor;
        }

        // Apply formatting to price and stock fields
        setTimeout(() => {
            document.getElementById("valorGasto").addEventListener("input", formatearNumero);

            // Restore formatting when the page loads
            document.getElementById("valorGasto").value = Number(document.getElementById("valorGasto").value.replace(/\D/g, '') || 0).toLocaleString("es-CO");
        }, 0);               
            
        })
        .catch(error => {
            console.error(error);
            alert("Error al cargar datos de gastos adicionales.");
        });

}

// Function to update an additional expense
async function actualizarGastoAdicional(event, gastoId) {
    const userEmail = sessionStorage.getItem("userEmail")

    event.preventDefault(); // Prevents the default behavior of the form

    // Gets form elements and input values
    const form = document.getElementById('form-gasto');
    const nombre = document.getElementById('nombreGasto').value.trim();
    const valor = parseFloat(document.getElementById('valorGasto').value.replace(/\./g, '').replace(',', '.'));
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
        const respuesta = await fetch(`http://localhost:8080/additional-expenses/${gastoId}`, {
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
        const respuesta = await fetch(`http://localhost:8080/additional-expenses/${id}`, {
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
    const valor = parseFloat(document.getElementById('valorGasto').value.replace(/\./g, '').replace(',', '.'));
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
    fetch('http://localhost:8080/additional-expenses', {
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

    // Gets the values ​​of the form fields
    const nombre = document.getElementById('nombre').value.trim();
    const stock = parseFloat(document.getElementById('stock').value.replace(/\./g, '').replace(',', '.'));
    const purchasePrice = parseFloat(document.getElementById('precioCompra').value.replace(/\./g, '').replace(',', '.'));
    const sellingPrice = parseFloat(document.getElementById('precioVenta').value.replace(/\./g, '').replace(',', '.'));
    const tipoItemSeleccionado = document.getElementById('tipoItem');
    const item_type_id = parseInt(tipoItemSeleccionado.options[tipoItemSeleccionado.selectedIndex].getAttribute('data-id'));
    const descripcion = document.getElementById('descripcion').value.trim();

    // Validations
    if (nombre === '') {
        alert('Error: El nombre del ítem no puede estar vacío.');
        return;
    }

    if (descripcion === '') {
        alert('Error: La descripción del ítem no puede estar vacía.');
        return;
    }

    if (stock < 0 || purchasePrice < 0 || sellingPrice < 0) {
        alert('Error: El stock, el precio de compra y el precio de venta no pueden ser negativos.');
        return;
    }

    if (stock > 10000000) {
        alert('Error: Valor de stock inválido.');
        return;
    }
    
    if (purchasePrice > 9999999999999 || purchasePrice === 0) {
        alert('Error: Precio de compra inválido.');
        return;
    }

    if (sellingPrice > 9999999999999 || sellingPrice === 0) {
        alert('Error: Precio de venta inválido.');
        return;
    }

    if (sellingPrice <= purchasePrice) {
        alert('Error: El precio de venta debe ser mayor que el precio de compra.');
        return;
    }

    // Build the object with the updated data
    const datosActualizados = {
        name: nombre,
        description: descripcion,
        stock: stock,
        selling_price: sellingPrice,
        purchase_price: purchasePrice,
        item_state: document.getElementById('estado').value === "true" ? true : false,
        item_type_id: item_type_id
    };

    console.log(datosActualizados);

    try {
        const userEmail = sessionStorage.getItem("userEmail");

        // Sends the PUT request to the backend
        const respuesta = await fetch(`http://localhost:8080/items/${id}`, {
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
        // Make a GET request to the Comments API
        const respuesta = await fetch('http://localhost:8080/comments', {
            headers: {
                'Username': userEmail
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener los comentarios');

        // Converts the response to JSON format
        const comentarios = await respuesta.json();

        // If there are no comments, display the appropriate message
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = `
                <p class="mensaje-vacio">📭 La bandeja de comentarios se encuentra vacía.</p>
            `;
            return;
        }

        // Sort comments by ID in descending order (most recent first)
        comentarios.sort((a, b) => b.id - a.id);

        // Renders the list of comments in inbox format
        listaComentarios.innerHTML = comentarios.map(comentario => `
            <div class="comentario-preview" onclick="mostrarDetalleComentario(${comentario.id})">
                <strong>${comentario.name} ${comentario.last_name}</strong> - ${comentario.email}
                <p>${comentario.comment.substring(0, 80)}...</p> <!-- Muestra los primeros 80 caracteres -->
            </div>
        `).join('');

    } catch (error) {
        console.error("Error al cargar comentarios:", error);

        // In case of error, it simply shows the empty tray instead of an error message
        listaComentarios.innerHTML = `
            <p class="mensaje-vacio">📭 La bandeja de comentarios se encuentra vacía.</p>
        `;
    }
}

// Function to display the full details of a comment
async function mostrarDetalleComentario(id) {
    const userEmail = sessionStorage.getItem("userEmail");
    try {
        // Fetch the specific comment by its ID
        const respuesta = await fetch(`http://localhost:8080/comments/${id}`, {
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
                    <p><strong>Teléfono:</strong> ${comentario.phone || 'No Digitado'}</p>

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

// Function to search for a client according to the selected filter
async function buscarCliente() {
    const textoBusqueda = document.getElementById('inputBusquedaClientes').value.trim();
    const filtro = document.getElementById('filtroBusquedaClientes').value;
    const tablaBody = document.getElementById('tablaClientesBody');

    const userEmail = sessionStorage.getItem("userEmail");

    // If the field is empty, reload all clients
    if (textoBusqueda === '') {
        cargarClientes();
        return;
    }

    // Build the URL based on the selected filter
    let urlBusqueda;
    if (filtro === "id") {
        urlBusqueda = `http://localhost:8080/customers/customerID/${encodeURIComponent(textoBusqueda)}`;
    } else if (filtro === "lastName") {  // Ahora busca por apellido
        urlBusqueda = `http://localhost:8080/customers/searchByLastName?lastName=${encodeURIComponent(textoBusqueda)}`;
    } else {
        urlBusqueda = `http://localhost:8080/customers/email/${encodeURIComponent(textoBusqueda)}`;
    }

    try {
        const [respuestaClientes, respuestaTipos] = await Promise.all([
            fetch(urlBusqueda, { headers: { 'Username': userEmail } }),
            fetch('http://localhost:8080/identifier-types', { headers: { 'Username': userEmail } })
        ]);

        if (!respuestaClientes.ok || !respuestaTipos.ok) throw new Error('Error en la búsqueda');

        const clientesEncontrados = await respuestaClientes.json();
        const tiposIdentificadores = await respuestaTipos.json();

        // Convert to array if the result is a single object (search by Email or ID)
        const clientesArray = Array.isArray(clientesEncontrados) ? clientesEncontrados : [clientesEncontrados];

        // Create the identifier type map
        const mapaTiposIdentificadores = {};
        tiposIdentificadores.forEach(tipo => {
            mapaTiposIdentificadores[tipo.id] = tipo.name;
        });

        tablaBody.innerHTML = generarFilasTablaClientes(clientesArray, mapaTiposIdentificadores);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        tablaBody.innerHTML = `<tr><td colspan="6">No se encontraron resultados</td></tr>`;
    }
}

// Function to load all customers into the table
async function cargarClientes() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        // Obtener clientes
        const respuestaClientes = await fetch('http://localhost:8080/customers', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuestaClientes.ok) throw new Error('Error al obtener los clientes');
        const clientes = await respuestaClientes.json();

        // Get identifier types with the "Username" header
        const respuestaTipos = await fetch('http://localhost:8080/identifier-types', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuestaTipos.ok) throw new Error('Error al obtener los tipos de identificador');
        const tiposIdentificadores = await respuestaTipos.json();

        // Create a map (dictionary) to quickly access the identifier name by its ID
        const mapaTiposIdentificadores = {};
        tiposIdentificadores.forEach(tipo => {
            mapaTiposIdentificadores[tipo.id] = tipo.name;
        });

        const tablaBody = document.getElementById('tablaClientesBody');
        if (tablaBody) {
            tablaBody.innerHTML = generarFilasTablaClientes(clientes, mapaTiposIdentificadores);
            return;
        }

        document.getElementById('lista-clientes').innerHTML = `
            <button class="btn-agregar-cliente" onclick="mostrarFormularioAgregarCliente()">+ Agregar Cliente 🧑</button>

            <div class="barra-busqueda">
                <div class="busqueda-container">
                    <select id="filtroBusquedaClientes" onchange="buscarCliente()">
                        <option value="id">No. ID</option>
                        <option value="lastName">Apellidos / R.S.</option> 
                        <option value="email">Email</option>
                    </select>
                    <input type="text" id="inputBusquedaClientes" placeholder="Buscar cliente..." oninput="buscarCliente()">
                </div>
            </div>

            <table class="tabla-clientes">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Tipo de ID</th>
                        <th>Número de ID</th>
                        <th>Email</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="tablaClientesBody">
                    ${generarFilasTablaClientes(clientes, mapaTiposIdentificadores)}
                </tbody>
            </table>
        `;

    } catch (error) {
        document.getElementById('lista-clientes').innerHTML = `<p>Oops... Ha ocurrido un error</p>`;
    }
}

function generarFilasTablaClientes(clientes, mapaTiposIdentificadores) {
    if (clientes.length === 0) {
        return `<tr><td colspan="6">No se encontraron resultados</td></tr>`;
    }

    return clientes.map(cliente => `
        <tr class="fila-cliente" onclick="mostrarDetalleCliente(${cliente.id})">
            <td>${cliente.id}</td>
            <td>${cliente.customerName} ${cliente.lastName}</td>  
            <td>${mapaTiposIdentificadores[cliente.identifierTypeId] || 'Desconocido'}</td>  
            <td>${cliente.customerId}</td>  
            <td>${cliente.email}</td>
            <td>
                <div class="estado-circulo ${cliente.customerState ? 'activo' : 'inactivo'}"></div>
            </td>
        </tr>
    `).join('');
}

async function mostrarDetalleCliente(customerId) {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        // Obtain customer data and identification types
        const [cliente, tiposDeIdentificacion] = await Promise.all([
            fetch(`http://localhost:8080/customers/${customerId}`, {
                headers: { 'Username': userEmail }
            }).then(res => {
                if (!res.ok) throw new Error('Error al cargar los datos del cliente');
                return res.json();
            }),
            fetch('http://localhost:8080/identifier-types', {
                headers: { 'Username': userEmail }
            }).then(res => {
                if (!res.ok) throw new Error('Error al cargar los tipos de identificación');
                return res.json();
            })
        ]);

        // Building the detail form
        const contenido = document.getElementById('contenido');
        contenido.innerHTML = `
            <div class="detalle-item-container">
                <button class="btn-retorno" onclick="cargarSeccion('clientes')"><</button>
                <h1>Detalles del Cliente</h1>

                <form id="form-detalle-cliente" onsubmit="actualizarCliente(event, '${cliente.id}')">
                    <div class="detalle-grid">
                        <div class="columna">
                            <div class="campo">
                                <label for="tipoPersona">Tipo de Persona:</label>
                                <select id="tipoPersona" disabled>
                                    <option value="Natural" ${cliente.isBusiness ? '' : 'selected'}>Natural</option>
                                    <option value="Juridica" ${cliente.isBusiness ? 'selected' : ''}>Jurídica</option>
                                </select>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="tipoIdentificacion">Tipo de Identificación:</label>
                                <select id="tipoIdentificacion" disabled>
                                    ${tiposDeIdentificacion.map(tipo => `
                                        <option value="${tipo.id}" ${tipo.id == cliente.identifierTypeId ? 'selected' : ''}>
                                            ${tipo.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Campos para Persona Natural -->
                        <div id="campoNombres" class="columna" style="display: ${cliente.isBusiness ? 'none' : 'block'};">
                            <div class="campo">
                                <label for="nombres">Nombres:</label>
                                <input type="text" id="nombres" value="${cliente.customerName || ''}" required>
                            </div>
                        </div>
                        <div id="campoApellidos" class="columna" style="display: ${cliente.isBusiness ? 'none' : 'block'};">
                            <div class="campo">
                                <label for="apellidos">Apellidos:</label>
                                <input type="text" id="apellidos" value="${cliente.lastName || ''}" required>
                            </div>
                        </div>

                        <!-- Campo para Persona Jurídica -->
                        <div id="campoRazonSocial" class="campo campo-doble" style="display: ${cliente.isBusiness ? 'block' : 'none'};">
                            <div class="campo">
                                <label for="razonSocial">Razón Social:</label>
                                <input type="text" id="razonSocial" value="${cliente.lastName || ''}">
                            </div>
                        </div>

                        <div class="columna">
                            <div class="campo">
                                <label for="telefono">Teléfono:</label>
                                <input type="text" id="telefono" value="${cliente.phoneNumbers || ''}" required>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="numeroIdentificacion">Número de Identificación:</label>
                                <input type="text" id="numeroIdentificacion" value="${cliente.customerId}" required>
                            </div>
                        </div>

                        <div class="columna">
                            <div class="campo">
                                <label for="email">Email:</label>
                                <input type="email" id="email" value="${cliente.email || ''}" required>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="estadoCliente">Estado del Cliente:</label>
                                <select id="estadoCliente" required>
                                    <option value="true" ${cliente.customerState ? 'selected' : ''}>Activo</option>
                                    <option value="false" ${!cliente.customerState ? 'selected' : ''}>Desactivado</option>
                                </select>
                            </div>
                        </div>

                        <div class="campo campo-doble">
                            <label for="direccion">Dirección:</label>
                            <input type="text" id="direccion" value="${cliente.address || ''}" required>
                        </div>
                    </div>

                    <button type="submit" class="btn-actualizar">Actualizar Cliente 🔄</button>
                </form>
            </div>
        `;

    } catch (error) {
        console.error(error);
        alert(`Error al cargar los detalles del cliente: ${error.message}`);
    }
}

// Function to update a client with additional validations
async function actualizarCliente(event, id) {
    event.preventDefault(); // Avoid the default behavior of the form

    // Confirm if the user really wants to update the client
    if (!confirm("¿Está seguro de que desea actualizar este cliente?")) return;

    // Get the values ​​of the form fields
    const tipoPersona = document.getElementById('tipoPersona').value;
    const nombres = document.getElementById('nombres')?.value.trim();
    const apellidos = document.getElementById('apellidos')?.value.trim();
    const razonSocial = document.getElementById('razonSocial')?.value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const tipoIdentificacion = document.getElementById('tipoIdentificacion').value.trim();
    const numeroIdentificacion = document.getElementById('numeroIdentificacion').value.trim();
    const email = document.getElementById('email').value.trim();
    const estadoCliente = document.getElementById('estadoCliente').value === 'true';
    const direccion = document.getElementById('direccion').value.trim();

    // Validations
    if (tipoPersona === "Natural" && (!nombres || !apellidos)) {
        alert('Error: Los nombres y apellidos son obligatorios para una persona natural.');
        return;
    }
    
    if (tipoPersona === "Juridica" && !razonSocial) {
        alert('Error: La razón social es obligatoria para una persona jurídica.');
        return;
    }

    if (!telefono || !numeroIdentificacion || !email || !direccion) {
        alert('Error: Todos los campos son obligatorios.');
        return;
    }

    // Building the object with the updated data
    const datosActualizados = {
        customerId: numeroIdentificacion,
        isBusiness: tipoPersona === "Juridica",
        customerName: tipoPersona === "Natural" ? nombres : "*",
        lastName: tipoPersona === "Natural" ? apellidos : razonSocial, 
        phoneNumbers: telefono,
        email: email,
        customerState: estadoCliente,
        address: direccion,
        identifierTypeId: parseInt(tipoIdentificacion)
    };

    try {
        const userEmail = sessionStorage.getItem("userEmail");

        // Enviar la solicitud PUT al backend
        const respuesta = await fetch(`http://localhost:8080/customers/${id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Username': userEmail },
            body: JSON.stringify(datosActualizados)
        });
        

        // Check if the answer is correct
        if (!respuesta.ok) {
            const errorMensaje = await respuesta.text();
            throw new Error(`Error al actualizar el cliente: ${errorMensaje}`);
        }

        // Display success message and reload the customer section
        alert('¡Cliente actualizado con éxito!');
        cargarSeccion('clientes');
    } catch (error) {
        alert(`Error al actualizar el cliente: ${error.message}`);
    }
}

let tiposDeIdentificacionOriginales = []; // It will store the original list of ID types

async function mostrarFormularioAgregarCliente() {
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        // Get ID types from the backend
        const tiposDeIdentificacion = await fetch('http://localhost:8080/identifier-types', {
            headers: { 'Username': userEmail }
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar los tipos de identificación');
            return res.json();
        });

        // Save the original list of ID types
        tiposDeIdentificacionOriginales = tiposDeIdentificacion;

        // Identify the ID of the "NIT" identification type
        const nitType = tiposDeIdentificacion.find(tipo => tipo.name === "NIT");
        const nitId = nitType ? nitType.id : null;

        // Building the form
        const contenido = document.getElementById('contenido');
        contenido.innerHTML = `
            <div class="detalle-item-container">
                <button class="btn-retorno" onclick="cargarSeccion('clientes')"><</button>
                <h1>Agregar Nuevo Cliente</h1>

                <form id="form-agregar-cliente" onsubmit="guardarNuevoCliente(event)">
                    <div class="detalle-grid">
                        <!-- Primera fila: Tipo de Persona y Tipo de Identificación -->
                        <div class="columna">
                            <div class="campo">
                                <label for="tipoPersona">Tipo de Persona:</label>
                                <select id="tipoPersona" required onchange="actualizarFormulario(${nitId})">
                                    <option value="Natural">Natural</option>
                                    <option value="Juridica">Jurídica</option>
                                </select>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="tipoIdentificacion">Tipo de Identificación:</label>
                                <select id="tipoIdentificacion" required>
                                    ${tiposDeIdentificacion
                                        .filter(tipo => tipo.id !== nitId) // Inicialmente excluye "NIT"
                                        .map(tipo => `<option value="${tipo.id}">${tipo.name}</option>`)
                                        .join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Segunda fila: Nombres y Apellidos (Natural) o Razón Social (Jurídica) -->
                        <div id="campoNombres" class="columna">
                            <div class="campo">
                                <label for="nombres">Nombres:</label>
                                <input type="text" id="nombres" name="nombres" maxlength="40">
                            </div>
                        </div>
                        <div id="campoApellidos" class="columna">
                            <div class="campo">
                                <label for="apellidos">Apellidos:</label>
                                <input type="text" id="apellidos" name="apellidos" maxlength="40">
                            </div>
                        </div>
                        <div id="campoRazonSocial" class="campo campo-doble" style="display: none;">
                            <div class="campo">
                                <label for="razonSocial">Razón Social:</label>
                                <input type="text" id="razonSocial" name="razonSocial" maxlength="70">
                            </div>
                        </div>

                        <!-- Tercera fila: Teléfono y Número de Identificación -->
                        <div class="columna">
                            <div class="campo">
                                <label for="telefono">Teléfono:</label>
                                <input type="text" id="telefono" name="telefono" maxlength="10" required>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="numeroIdentificacion">Número de Identificación:</label>
                                <input type="text" id="numeroIdentificacion" name="numeroIdentificacion" maxlength="12" required>
                            </div>
                        </div>

                        <!-- Cuarta fila: Email y Estado del Cliente -->
                        <div class="columna">
                            <div class="campo">
                                <label for="email">Email:</label>
                                <input type="email" id="email" name="email" maxlength="70" required>
                            </div>
                        </div>
                        <div class="columna">
                            <div class="campo">
                                <label for="estadoCliente">Estado del Cliente:</label>
                                <select id="estadoCliente" required>
                                    <option value="true">Activo</option>
                                    <option value="false">Desactivado</option>
                                </select>
                            </div>
                        </div>

                        <!-- Quinta fila: Dirección -->
                        <div class="campo campo-doble">
                            <label for="direccion">Dirección:</label>
                            <input type="text" id="direccion" name="direccion" maxlength="120" required>
                        </div>
                    </div>

                    <!-- Botón para guardar el cliente -->
                    <button type="submit" class="btn-actualizar">Guardar Cliente ✅</button>
                </form>
            </div>
        `;

        const telefonoInput = document.getElementById('telefono');

        // Check if the input element exists in the DOM
        if (telefonoInput) {
            // Add an event listener to the 'keydown' event (when a key is pressed)
            telefonoInput.addEventListener('keydown', (event) => {
                // Allow only numeric characters [0-9] and essential control keys (backspace, delete, arrow keys, tab)
                if (
                    !/[0-9]/.test(event.key) && // Ensure the key is a digit (0-9)
                    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key) // Allow specific control keys
                ) {
                    event.preventDefault(); // Block any other key press
                }
            });
        }

        // Select the email field
        const emailInput = document.getElementById('email');

        // Checks if the field exists in the DOM
        if (emailInput) {
                // Listen for the keydown event
                emailInput.addEventListener('keydown', (event) => {
                    if (event.key === ' ') {
                        event.preventDefault(); // Lock the space bar
                }
            });
        }        

        // Select the input element with the ID 'numeroIdentificacion'
        const InputId = document.getElementById('numeroIdentificacion');

        // Check if the input element exists in the DOM
        if (InputId) {
            InputId.addEventListener('keydown', (event) => {
                const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

                // Block if not an allowed number or key
                if (
                    !/[0-9]/.test(event.key) &&
                    !allowedKeys.includes(event.key)
                ) {
                    event.preventDefault();
                    return;
                }

                // Prevent entry of more than 12 digits (except control keys)
                const currentValue = InputId.value;
                const isControlKey = allowedKeys.includes(event.key);
                const selectionStart = InputId.selectionStart;
                const selectionEnd = InputId.selectionEnd;
                const willAddDigit = /[0-9]/.test(event.key);

                if (
                    willAddDigit &&
                    currentValue.length >= 12 &&
                    selectionStart === selectionEnd // You are not selecting text
                ) {
                    event.preventDefault();
                }
            });
        }

    } catch (error) {
        console.error(error);
        alert(`Error al cargar el formulario: ${error.message}`);
    }
}

// Function to update the form according to the type of person
function actualizarFormulario(nitId) {
    const tipoPersona = document.getElementById("tipoPersona").value;
    const tipoIdentificacion = document.getElementById("tipoIdentificacion");
    const campoNombres = document.getElementById("campoNombres");
    const campoApellidos = document.getElementById("campoApellidos");
    const campoRazonSocial = document.getElementById("campoRazonSocial");

    if (tipoPersona === "Juridica") {
        // Block "NIT" and hide first and last name fields
        tipoIdentificacion.innerHTML = `<option value="${nitId}">NIT</option>`;
        tipoIdentificacion.disabled = true;

        campoNombres.style.display = "none";
        campoApellidos.style.display = "none";
        campoRazonSocial.style.display = "block";
    } else {
        // Restore original options without "NIT"
        tipoIdentificacion.innerHTML = tiposDeIdentificacionOriginales
            .filter(tipo => tipo.id !== nitId)
            .map(tipo => `<option value="${tipo.id}">${tipo.name}</option>`)
            .join('');

        tipoIdentificacion.disabled = false;

        campoNombres.style.display = "block";
        campoApellidos.style.display = "block";
        campoRazonSocial.style.display = "none";
    }
}

// Function to save the new client
async function guardarNuevoCliente(event) {
    event.preventDefault();
    const userEmail = sessionStorage.getItem("userEmail");

    // Gets the values ​​from the form and trims them to avoid empty spaces
    const tipoPersona = document.getElementById("tipoPersona").value.trim();
    const tipoIdentificacion = document.getElementById("tipoIdentificacion").value.trim();
    const numeroIdentificacion = document.getElementById("numeroIdentificacion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const estadoCliente = document.getElementById("estadoCliente").value === "true";
    const direccion = document.getElementById("direccion").value.trim();

    // General validations
    if (numeroIdentificacion === ''  || numeroIdentificacion === null ) {
        alert("Error: El número de identificación no puede estar vacío.");
        return;
    }
    
    if (!/^\d{10}$/.test(telefono)) {
        alert("Ingrese un número telefónico válido");
        return;
    }

    if (email === '') {
        alert("Error: El correo electrónico no puede estar vacío.");
        return;
    }
    if (direccion === '') {
        alert("Error: La dirección no puede estar vacía.");
        return;
    }

    // Build the object with the client data
    let customerData = {
        customerId: numeroIdentificacion,
        identifierTypeId: parseInt(tipoIdentificacion),
        phoneNumbers: telefono,
        email: email,
        customerState: estadoCliente,
        address: direccion,
        isBusiness: tipoPersona === "Juridica", 
        customerName: "",
        lastName: ""
    };

    // Specific validations according to the type of person
    if (tipoPersona === "Natural") {
        const nombres = document.getElementById("nombres").value.trim();
        const apellidos = document.getElementById("apellidos").value.trim();

        if (nombres === '') {
            alert("Error: El nombre no puede estar vacío.");
            return;
        }
        if (apellidos === '') {
            alert("Error: El apellido no puede estar vacío.");
            return;
        }

        customerData.customerName = nombres;
        customerData.lastName = apellidos;
    } else {
        const razonSocial = document.getElementById("razonSocial").value.trim();
        
        if (!razonSocial) {
            alert("Error: La razón social no puede estar vacía.");
            return;
        }

        customerData.customerName = "*";  
        customerData.lastName = razonSocial;
    }

    try {
        const response = await fetch('http://localhost:8080/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Username': userEmail },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el cliente');
        }

        alert("Cliente guardado con éxito");
        cargarSeccion('clientes');
    } catch (error) {
        alert("Error al guardar el cliente: " + error.message);
    }
}

let semanaActualOffset = 0; // Control the movement in weeks

// Function to load appointments into the calendar
async function cargarCitas(offset = 0) {
    semanaActualOffset += offset;

    const contenedorCalendario = document.getElementById('calendario-semanal');

    // Check if the button already exists before deleting everything
    const botonPrevio = document.querySelector("#boton-reporte");
    if (botonPrevio) botonPrevio.remove();

    const botonPrevioBuscar = document.querySelector("#boton-buscar");
    if (botonPrevioBuscar) botonPrevioBuscar.remove();
    
    // CLEAN before inserting the button
    contenedorCalendario.innerHTML = "";
    
    // Create button and add it just before
    const botonReporte = document.createElement("button");
    botonReporte.id = "boton-reporte";
    botonReporte.textContent = "Generar Reporte (PDF) 📄";
    botonReporte.classList.add("boton-reporte");
    contenedorCalendario.parentNode.insertBefore(botonReporte, contenedorCalendario);

    const botonBuscar = document.createElement("button");
    botonBuscar.id = "boton-buscar";
    botonBuscar.textContent = "Buscar Cita 🔍";
    botonBuscar.classList.add("boton-reporte"); // Usa mismo estilo, o crea una clase diferente si deseas
    botonBuscar.onclick = () => abrirModalBuscarCita();
    contenedorCalendario.parentNode.insertBefore(botonBuscar, contenedorCalendario);
    

    const diasSemana = ["Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb.", "Dom."];
    const hoy = new Date();

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - hoy.getDay() + 1 + semanaActualOffset * 7);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const diasEnPantalla = [];
    for (let i = 0; i < 7; i++) {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        diasEnPantalla.push(dia);
    }

    // Create header with arrows and date range
    const encabezado = document.createElement("div");
    encabezado.classList.add("encabezado-semana");

    const flechaIzquierda = document.createElement("span");
    flechaIzquierda.classList.add("flecha-navegacion");
    flechaIzquierda.textContent = "<";
    flechaIzquierda.onclick = () => cargarCitas(-1);

    const flechaDerecha = document.createElement("span");
    flechaDerecha.classList.add("flecha-navegacion");
    flechaDerecha.textContent = ">";
    flechaDerecha.onclick = () => cargarCitas(1);

    const tituloSemana = document.createElement("span");
    const opcionesFecha = { day: "numeric", month: "long" };
    const rango = `${lunes.toLocaleDateString("es-CO", opcionesFecha)} - ${domingo.toLocaleDateString("es-CO", opcionesFecha)} de ${domingo.getFullYear()}`;
    tituloSemana.textContent = rango;
    tituloSemana.classList.add("titulo-semana");

    encabezado.appendChild(flechaIzquierda);
    encabezado.appendChild(tituloSemana);
    encabezado.appendChild(flechaDerecha);
    contenedorCalendario.appendChild(encabezado);

    // Create table
    const tabla = document.createElement("table");
    tabla.classList.add("tabla-calendario");

    // Head
    const thead = document.createElement("thead");
    const filaCabecera = document.createElement("tr");

    const thHora = document.createElement("th");
    thHora.textContent = "Hora";
    filaCabecera.appendChild(thHora);

    for (let i = 0; i < 7; i++) {
        const dia = diasEnPantalla[i];
        const th = document.createElement("th");
        th.textContent = `${diasSemana[i]} ${dia.toLocaleDateString("es-CO", opcionesFecha)}`;
        filaCabecera.appendChild(th);
    }

    thead.appendChild(filaCabecera);
    tabla.appendChild(thead);

    // Table body with hours
    const tbody = document.createElement("tbody");

    for (let h = 9; h <= 17; h++) {
        const fila = document.createElement("tr");

        const celdaHora = document.createElement("td");
        celdaHora.textContent = `${h.toString().padStart(2, '0')}:00`;
        fila.appendChild(celdaHora);

        for (let i = 0; i < 7; i++) {
            const celda = document.createElement("td");
            celda.classList.add("celda-calendario");
            celda.dataset.dia = i;
            celda.dataset.hora = h;
            fila.appendChild(celda);
        }

        tbody.appendChild(fila);
    }

    tabla.appendChild(tbody);
    contenedorCalendario.appendChild(tabla);

    // Query API and position appointments
    try {
        const userEmail = sessionStorage.getItem("userEmail");

        const respuesta = await fetch('http://localhost:8080/appointments', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail 
            }
        });

        const citas = await respuesta.json();

        citas.forEach(cita => {
            const fechaCita = new Date(cita.dateTime);
            const hora = new Date(fechaCita.getTime() + fechaCita.getTimezoneOffset() * 60000).getHours();

            const diaIndex = diasEnPantalla.findIndex(d =>
                d.getFullYear() === fechaCita.getFullYear() &&
                d.getMonth() === fechaCita.getMonth() &&
                d.getDate() === fechaCita.getDate()
            );

            if (hora >= 9 && hora <= 17 && diaIndex !== -1) {
                const celda = document.querySelector(`.celda-calendario[data-dia='${diaIndex}'][data-hora='${hora}']`);
                if (celda) {
                    const divCita = document.createElement("div");
                    divCita.textContent = `${cita.customerName} ${cita.lastName}`;
                    divCita.classList.add("bloque-cita");

                    if (cita.state === true) {
                        divCita.classList.add("estado-true");
                    } else {
                        divCita.classList.add("estado-false");
                    }

                    celda.appendChild(divCita);
                    divCita.dataset.citaId = cita.id;
                    divCita.onclick = mostrarDetalleCita;

                }
            }
        });

    } catch (error) {
        console.error("Error al cargar las citas:", error);
        alert("No se pudieron cargar las citas.");
    }
}



////////////////////////////////

function abrirModalBuscarCita() {
    // Si no existe el modal, créalo
    if (!document.getElementById("popup-busqueda-cita")) {
        crearModalBusquedaCita(); // Esto también agrega la lógica
    }

    // Mostrar el modal y limpiar contenido previo
    const popup = document.getElementById("popup-busqueda-cita");
    const input = document.getElementById("input-id-cita");
    const detalle = document.getElementById("detalle-cita-busqueda");

    input.value = "";
    detalle.innerHTML = generarTextoCitaNoIdentificada();
    popup.classList.remove("oculto");
}

function crearModalBusquedaCita() {
    const modalHTML = `
        <div id="popup-busqueda-cita" class="popup-cita oculto">
            <div class="popup-bucar-cita-contenido">
                <h3 class="busqueda-cita-id">Búsqueda de Cita por ID</h3>
                <span id="cerrar-popup-busqueda" class="cerrar-popup-buscar-cita">&times;</span>
                <!-- Contenedor para la barra de búsqueda y el "ID" -->
                <div class="contenedor-busqueda-id">
                    <input type="text" id="input-id-cita" placeholder="Ingrese ID de la cita..." class="barra-busqueda-id" />
                    <span class="id-cuadrado">ID</span>
                </div>
                <div id="detalle-cita-busqueda">
                    ${generarTextoCitaNoIdentificada()}
                </div>
            </div>
        </div>
    `;

    const divContenedor = document.createElement("div");
    divContenedor.innerHTML = modalHTML;
    document.body.appendChild(divContenedor);

    const inputID = document.getElementById("input-id-cita");
    inputID.addEventListener("input", (e) => {
        // Eliminar caracteres no numéricos
        inputID.value = inputID.value.replace(/\D/g, ''); // \D elimina todo lo que no es un dígito
    });

    agregarLogicaBusquedaPorID();
}

function generarTextoCitaNoIdentificada() {
    return `
        <p><strong>Nombre:</strong> Cita no identificada</p>
        <p><strong>Tipo de Persona:</strong> Cita no identificada</p>
        <p><strong>Correo Electrónico:</strong> Cita no identificada</p>
        <p><strong>Fecha y Hora:</strong> Cita no identificada</p>
        <p><strong>Dirección:</strong> Cita no identificada</p>
        <p><strong>Teléfono:</strong> Cita no identificada</p>
        <p><strong>Estado de Cita:</strong> Cita no identificada</p>
    `;
}

function agregarLogicaBusquedaPorID() {
    const popupBusqueda = document.getElementById("popup-busqueda-cita");
    const cerrarBtn = document.getElementById("cerrar-popup-busqueda");
    const inputID = document.getElementById("input-id-cita");
    const detalleBusqueda = document.getElementById("detalle-cita-busqueda");

    cerrarBtn.onclick = () => {
        popupBusqueda.classList.add("oculto");
    };

    inputID.addEventListener("input", async () => {
        const id = inputID.value.trim();
        if (id === "") {
            detalleBusqueda.innerHTML = generarTextoCitaNoIdentificada();
            return;
        }

        try {
            const userEmail = sessionStorage.getItem("userEmail");
            const response = await fetch(`http://localhost:8080/appointments/searchByID?id=${id}`, {
                method: 'GET',
                headers: {
                    "Username": userEmail
                }
            });

            if (!response.ok) {
                detalleBusqueda.innerHTML = generarTextoCitaNoIdentificada();
                return;
            }

            const data = await response.json();
            const cita = Array.isArray(data) ? data[0] : data;

            if (!cita) {
                detalleBusqueda.innerHTML = generarTextoCitaNoIdentificada();
                return;
            }

            const date = new Date(cita.dateTime);
            const dia = String(date.getUTCDate()).padStart(2, '0');
            const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
            const año = date.getUTCFullYear();
            const horas = String(date.getUTCHours()).padStart(2, '0');
            const minutos = String(date.getUTCMinutes()).padStart(2, '0');
            const fechaFormateada = `${dia}-${mes}-${año} ${horas}:${minutos}`;
            const etiquetaNombre = cita.isBusiness ? "Razón Social" : "Nombre Completo";

            detalleBusqueda.innerHTML = `
                <p><strong>${etiquetaNombre}:</strong> ${cita.customerName || ""} ${cita.lastName || ""}</p>
                <p><strong>Tipo de Persona:</strong> ${cita.isBusiness ? "Jurídica" : "Natural"}</p>
                <p><strong>Correo Electrónico:</strong> ${cita.email || "No registrado"}</p>
                <p><strong>Fecha y Hora:</strong> ${fechaFormateada}</p>
                <p><strong>Dirección:</strong> ${cita.address || "No registrada"}</p>
                <p><strong>Teléfono:</strong> ${Array.isArray(cita.phoneNumbers) ? cita.phoneNumbers.join(", ") : cita.phoneNumbers || "No disponibles"}</p>
                <p><strong>Estado de Cita:</strong> ${cita.state ? "Pendiente Agendada" : "Pasada"}</p>
            `;
        } catch (error) {
            console.error("Error al buscar cita:", error);
            detalleBusqueda.innerHTML = generarTextoCitaNoIdentificada();
        }
    });
}


///////////////////////////////






// Function to display details of an appointment
async function mostrarDetalleCita(event) {
    const citaId = event.currentTarget.dataset.citaId;
    const userEmail = sessionStorage.getItem("userEmail");

    try {
        const respuesta = await fetch(`http://localhost:8080/appointments/searchByID?id=${citaId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail 
            }
        });

        if (!respuesta.ok) throw new Error("No se pudo obtener la información de la cita");

        const cita = await respuesta.json();

        console.log("Respuesta de la API:", cita);

        const citaReal = Array.isArray(cita) ? cita[0] : cita;

        mostrarPopUpCita(citaReal);

    } catch (error) {
        console.error("Error al obtener detalles de la cita:", error);
        alert("No se pudo obtener la información de la cita.");
    }
}

// Function to display pop-up with appointment details
function mostrarPopUpCita(cita) {
    const detalleDiv = document.getElementById("detalle-cita");
    const popup = document.getElementById("popup-cita");

    if (!cita) {
        detalleDiv.innerHTML = "<p>Error al mostrar detalles de la cita.</p>";
        return;
    }

    // Format the date and time correctly with UTC time
    const date = new Date(cita.dateTime);
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const año = date.getUTCFullYear();
    const horas = String(date.getUTCHours()).padStart(2, '0');
    const minutos = String(date.getUTCMinutes()).padStart(2, '0');
    const fechaFormateada = `${dia}-${mes}-${año} ${horas}:${minutos}`;

    // Change label if it is a company
    const etiquetaNombre = cita.isBusiness ? "Razón Social" : "Nombre Completo";

    detalleDiv.innerHTML = `
        <h3 class="detalles-cita-seleccionada">Detalles de Cita: </h3>
        <p><strong>${etiquetaNombre}:</strong> ${cita.customerName || ""} ${cita.lastName || ""}</p>
        <p><strong>Tipo de Persona:</strong> ${cita.isBusiness ? "Jurídica" : "Natural"}</p>
        <p><strong>Correo Electrónico:</strong> ${cita.email || "No registrado"}</p>
        <p><strong>Fecha y Hora:</strong> ${fechaFormateada}</p>
        <p><strong>Dirección:</strong> ${cita.address || "No registrada"}</p>
        <p><strong>Teléfono:</strong> ${Array.isArray(cita.phoneNumbers) ? cita.phoneNumbers.join(", ") : cita.phoneNumbers || "No disponibles"}</p>
        <p><strong>Estado de Cita:</strong> <span id="estado-cita-texto">${cita.state ? "Pendiente Agendada" : "Pasada"}</span></p>
        <div class="contenedor-botones-modal">
            <button id="cambiar-estado" class="btn-generar-reporte">Cambiar Estado 🔄</button>
            <button id="cancelar-cita" class="btn-cancelar-reporte">Cancelar Cita ❌</button>
        </div>        
    `;

    popup.classList.remove("oculto");

    document.getElementById("cerrar-popup").onclick = () => {
        popup.classList.add("oculto");
    };

    // Event to change the appointment status
    document.getElementById("cambiar-estado").onclick = async () => {
        const nuevoEstado = !cita.state;
        const nombreNuevoEstado = nuevoEstado ? "Pendiente Agendada" : "Pasada";
    
        const confirmacion = confirm(`¿Confirma el cambio de estado de esta cita a "${nombreNuevoEstado}"?`);
    
        if (!confirmacion) return;
    
        try {
            const userEmail = sessionStorage.getItem("userEmail");
            const response = await fetch(`http://localhost:8080/appointments/${cita.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Username": userEmail
                },
                body: JSON.stringify({
                    ...cita,
                    state: nuevoEstado
                })
            });
    
            if (!response.ok) throw new Error("Error al actualizar estado");
    
            // Locally updates the status in the modal
            cita.state = nuevoEstado;
            document.getElementById("estado-cita-texto").textContent = nombreNuevoEstado;
            cargarCitas(0);
        } catch (error) {
            alert("No se pudo cambiar el estado de la cita.");
            console.error(error);
        }
    };

    document.getElementById("cancelar-cita").onclick = async () => {
        const confirmacion = confirm("¿Está seguro de que desea cancelar (eliminar) esta cita?");
        if (!confirmacion) return;
    
        try {
            const userEmail = sessionStorage.getItem("userEmail");
            const response = await fetch(`http://localhost:8080/appointments/deleteAppointment/${cita.id}`, {
                method: "DELETE",
                headers: {
                    "Username": userEmail
                }
            });
    
            if (!response.ok) throw new Error("Error al eliminar cita");
    
            alert("Cita cancelada (eliminada) exitosamente.");
            popup.classList.add("oculto");
            cargarCitas(0);  // Refresca la lista
        } catch (error) {
            alert("No se pudo cancelar (eliminar) esta cita.");
            console.error(error);
        }
    };
}

// Function to draw the header (text and logo) for the PDF report of appointments
function dibujarEncabezado(doc, pageWidth, img) {
    const headerHeight = 25;

    doc.setFillColor(0, 0, 0);
    doc.rect(0, 10, pageWidth, headerHeight, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTES BGA - Matriz", 15, 20);

    const imgWidth = 60;
    const imgHeight = 15;
    const imgX = pageWidth - imgWidth - 15;
    const imgY = 13;
    doc.addImage(img, "PNG", imgX, imgY, imgWidth, imgHeight);
}

async function generarPDFReporteCitas(fechaInicio, fechaFin) {
    try {
        const userEmail = sessionStorage.getItem("userEmail");

        const respuesta = await fetch("http://localhost:8080/appointments", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!respuesta.ok) throw new Error("Error al obtener las citas");

        const citas = await respuesta.json();

        const citasFiltradas = citas.filter(cita => {
            const fechaCita = new Date(cita.dateTime);
            return fechaCita >= fechaInicio && fechaCita <= fechaFin;
        });

        if (citasFiltradas.length === 0) {
            alert("No hay citas dentro del rango seleccionado.");
            return;
        }

        const activas = citasFiltradas.filter(c => c.state === true).length;
        const vencidas = citasFiltradas.filter(c => c.state === false).length;
        const total = citasFiltradas.length;

        const ctx = document.getElementById("graficoCitas").getContext("2d");

        if (window.graficoCitasInstance) window.graficoCitasInstance.destroy();

        window.graficoCitasInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Activas / Próximas", "Vencidas / Atendidas"],
                datasets: [{
                    data: [activas, vencidas],
                    backgroundColor: ["#36A2EB", "#FF6384"]
                }]
            },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    datalabels: {
                        color: '#fff',
                        formatter: (value, context) => {
                            const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / sum) * 100).toFixed(1) + "%";
                            return percentage;
                        },
                        font: {
                            weight: 'bold',
                            size: 12
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", format: "letter" });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Cargar imagen del logo antes de continuar
        const imageUrl = "assets/images/logo_totes.png";
        const img = new Image();
        img.src = imageUrl;

        await new Promise(resolve => {
            img.onload = () => resolve();
        });

        // Encabezado en la primera página
        dibujarEncabezado(doc, pageWidth, img);

        let y = 45;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Reporte de Citas por Estado", pageWidth / 2, y, { align: "center" });

        y += 10;
        doc.setFontSize(10);
        const fechaGeneracion = new Date().toLocaleString("es-CO");
        doc.text(`Este reporte fue generado el: ${fechaGeneracion}`, 15, y);
        y += 8;
        doc.text(`Rango de fechas: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`, 15, y);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.text(`Total de citas encontradas: ${total}`, 15, y);
        y += 7;
        doc.text(`Citas activas / próximas (color azul): ${activas}`, 15, y);
        y += 7;
        doc.text(`Citas vencidas / atendidas (color rojo): ${vencidas}`, 15, y);
        y += 10;

        const graficoCanvas = document.getElementById("graficoCitas");
        const graficoDataUrl = graficoCanvas.toDataURL("image/png");
        doc.addImage(graficoDataUrl, "PNG", 40, y, 130, 120);

        // Obtener tipos de identificación
        const tiposRespuesta = await fetch("http://localhost:8080/identifier-types", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Username": userEmail
            }
        });

        if (!tiposRespuesta.ok) throw new Error("Error al obtener los tipos de identificación");

        const tiposIdentificacion = await tiposRespuesta.json();

        // Crear un mapa ID => Nombre
        const mapaTiposIdentificacion = {};
        tiposIdentificacion.forEach(tipo => {
            mapaTiposIdentificacion[tipo.id] = tipo.name;
        });

        // ---------------- One sheet for each appointment ----------------
        for (const cita of citasFiltradas) {
            doc.addPage();
            dibujarEncabezado(doc, pageWidth, img); // Draw header on each new page

            let yDetalle = 45;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Detalle de Cita", pageWidth / 2, yDetalle, { align: "center" });

            yDetalle += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const tipoPersona = cita.isBusiness ? "Jurídica" : "Natural";
            const nombreCompleto = `${cita.customerName} ${cita.lastName}`.trim();
            const nombreTipoIdentificacion = mapaTiposIdentificacion[cita.identifierTypeId] || "Desconocido";
            
            const detalles = [
                ["ID de Cita:", cita.id?.toString() || "N/A"],
                ["Tipo Persona:", tipoPersona],
                ...(tipoPersona === "Natural"
                    ? [["Nombre Completo:", nombreCompleto]]
                    : [["Razón Social:", cita.lastName || "N/A"]]
                ),
                ["Tipo de Identificación:", nombreTipoIdentificacion],
                ["Número de Identificación:", cita.customerId?.toString() || "N/A"],
                ["Correo:", cita.email || "N/A"],
                ["Teléfono:", cita.phoneNumbers || "N/A"],
                ["Dirección:", cita.address || "N/A"],
                ["Estado:", cita.state ? "Activa / Próxima" : "Vencida / Atendida"],
                ["Fecha y Hora:", new Date(cita.dateTime).toLocaleString("es-CO")]
            ];

            const cuerpoTabla = detalles.map(([campo, valor]) => [campo, valor]);

            doc.autoTable({
                head: [['Campo', 'Valor']],
                body: cuerpoTabla,
                startY: yDetalle,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [0, 0, 0], textColor: 255 },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 120 }
                }
            });
        }

        const fechaHoraColombia = new Intl.DateTimeFormat("es-CO", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(new Date());

        // Format the date and time to be valid in the file name
        const fechaHoraArchivo = fechaHoraColombia
            .replace(/\//g, "-")      // Replace / with -
            .replace(/:/g, "-")       // Replace : with -
            .replace(/\s/g, "_");     // Replace space with _

        doc.save(`reporte_citas_${fechaHoraArchivo}.pdf`);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Error al generar el reporte de citas: " + error.message);
    }
}

///////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
        // Button to open the dates modal
        if (e.target && e.target.id === "boton-reporte") {
            document.getElementById("modal-fechas").style.display = "flex";
        }

        // Button to generate the report
        if (e.target && e.target.id === "confirmar-fechas") {
            const inicio = document.getElementById("fecha-inicio").value;
            const fin = document.getElementById("fecha-fin").value;

            if (!inicio || !fin) {
                alert("Por favor selecciona ambas fechas.");
                return;
            }

            document.getElementById("modal-fechas").style.display = "none";
            const fechaInicio = new Date(`${inicio}T00:00:00`);
            const fechaFin = new Date(`${fin}T23:59:59`);
            generarPDFReporteCitas(fechaInicio, fechaFin);

        }
    });
});


function cerrarModalFechas() {
    document.getElementById("modal-fechas").style.display = "none";
}

//////////////////////////////////////

// logout function
function cerrarSesion() {
    // Clear all sessionStorage information
    sessionStorage.clear();

    alert("¡Sesión cerrada con éxito!");
    window.location.href = "index.html"; // Redirect to the login page
}

// Execute access control when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", controlarAcceso);

