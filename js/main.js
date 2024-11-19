const mainContent = document.getElementById("main-content");

async function cargarProductos() {
  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error("Error al cargar los productos.");
    const productos = await response.json();
    renderizarInterfaz(productos);
  } catch {
    mostrarError("No se pudieron cargar los productos. Intenta más tarde.");
  }
}

function renderizarInterfaz(productos) {
  mainContent.innerHTML = `
    <div>
      <h2>Productos</h2>
      <div id="productos-container"></div>
      <h3>Tu Carrito de Compra</h3>
      <ul id="carrito-lista"></ul>
      <p id="carrito-vacio">Tu carrito está vacío.</p>
      <p id="total-carrito">Total: $0</p>
      <button id="vaciar-carrito">Vaciar Carrito</button>
      <button id="comprar-btn">Comprar</button>
      <div id="error-message" style="color: red;"></div>
      ${renderizarFormularioCompra()}
      ${renderizarModalConfirmacion()}
    </div>
  `;
  renderizarProductos(productos);
  inicializarEventos(productos);
}

function renderizarProductos(productos) {
  const productosContainer = document.getElementById("productos-container");
  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
      <span>${producto.nombre}</span>
      <span>$${producto.precio}</span>
      <button data-id="${producto.id}">Agregar</button>
    `;
    productosContainer.appendChild(card);
  });
}

function renderizarFormularioCompra() {
  return `
    <div id="formulario-compra" style="display: none;">
      <h3>Formulario de Compra</h3>
      <form id="form-compra">
        <input type="text" id="nombre" placeholder="Nombre" required>
        <input type="text" id="apellido" placeholder="Apellido" required>
        <input type="email" id="email" placeholder="Correo Electrónico" required>
        <input type="tel" id="telefono" placeholder="Teléfono" required>
        <input type="text" id="direccion" placeholder="Dirección" required>
        <button type="submit">Finalizar Compra</button>
      </form>
    </div>
  `;
}

function renderizarModalConfirmacion() {
  return `
    <div id="modal-confirmacion" class="modal">
      <div id="modal-contenido">
        <h3>Confirmación de Pedido</h3>
        <p id="mensaje-confirmacion"></p>
        <button id="cerrar-modal">Cerrar</button>
      </div>
    </div>
  `;
}

function inicializarEventos(productos) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  actualizarCarrito(carrito);

  document.querySelectorAll(".producto-card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = productos.find((p) => p.id === parseInt(btn.dataset.id));
      agregarProductoAlCarrito(producto, carrito);
    });
  });

  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    carrito.length = 0;
    localStorage.removeItem("carrito");
    actualizarCarrito(carrito);
  });

  document.getElementById("comprar-btn").addEventListener("click", () => {
    if (carrito.length === 0) {
      mostrarError("El carrito está vacío. Agrega productos antes de comprar.");
    } else {
      mostrarFormularioCompra(carrito);
    }
  });
}

function agregarProductoAlCarrito(producto, carrito) {
  const item = carrito.find((p) => p.id === producto.id);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarToast(`${producto.nombre} agregado al carrito`);
  actualizarCarrito(carrito);
}

function actualizarCarrito(carrito) {
  const carritoLista = document.getElementById("carrito-lista");
  const carritoVacio = document.getElementById("carrito-vacio");
  const totalCarrito = document.getElementById("total-carrito");

  carritoLista.innerHTML = "";
  carritoVacio.style.display = carrito.length ? "none" : "block";

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  totalCarrito.textContent = `Total: $${total.toFixed(2)}`;

  carrito.forEach((producto) => {
    const item = document.createElement("li");
    item.innerHTML = `
      ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
      <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      eliminarProductoDelCarrito(producto.id, carrito);
    });
    carritoLista.appendChild(item);
  });
}

function eliminarProductoDelCarrito(id, carrito) {
  const index = carrito.findIndex((p) => p.id === id);
  if (index !== -1) {
    const producto = carrito.splice(index, 1)[0];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarToast(`${producto.nombre} eliminado del carrito`);
    actualizarCarrito(carrito);
  }
}

function mostrarFormularioCompra() {
  const formCompra = document.getElementById("formulario-compra");
  formCompra.style.display = "block";
  formCompra.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = ["nombre", "apellido", "email", "telefono", "direccion"].map((id) =>
      document.getElementById(id).value.trim()
    );
    if (datos.some((dato) => !dato)) {
      mostrarError("Completa todos los campos correctamente.");
    } else {
      procesarCompra(...datos);
    }
  });
}

function procesarCompra(nombre, apellido, direccion) {
  localStorage.removeItem("carrito");
  actualizarCarrito([]);
  mostrarConfirmacion(nombre, apellido, direccion);
}

function mostrarConfirmacion(nombre, apellido, direccion) {
  const modal = document.getElementById("modal-confirmacion");
  const mensaje = document.getElementById("mensaje-confirmacion");
  mensaje.textContent = `Gracias por tu compra, ${nombre} ${apellido}. Tu pedido será enviado a ${direccion}.`;
  modal.style.display = "block";

  document.getElementById("cerrar-modal").addEventListener("click", () => {
    modal.style.display = "none";
    cargarProductos();
  });
}

function mostrarError(mensaje) {
  document.getElementById("error-message").textContent = mensaje;
}

function mostrarToast(mensaje) {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

cargarProductos();