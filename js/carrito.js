let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

const contenedorCarritoVacio = document.querySelector("#carritoVacio");
const contenedorCarritoProductos = document.querySelector("#carritoProductos");
const contenedorCarritoAcciones = document.querySelector("#carritoAcciones");
const contenedorCarritoComprado = document.querySelector("#carritoComprado");
const botonVaciar = document.querySelector("#carritoAccionesVaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carritoAccionesComprar");
let botonesEliminar = document.querySelectorAll(".carritoProductoEliminar");

function cargarProductosCarrito() {
    if (productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disable");
        contenedorCarritoProductos.classList.remove("disable");
        contenedorCarritoAcciones.classList.remove("disable");
        contenedorCarritoComprado.classList.add("disable");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carritoProducto");
            div.innerHTML = `
                <img class="carritoProductoImg" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carritoProductoTitulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carritoProductoCantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carritoProductoPrecio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carritoProductoSubtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carritoProductoEliminar" id="${producto.id}">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            `;
            contenedorCarritoProductos.append(div);
        });

        actualizarBotonesEliminar();
        actualizarTotal();
    } else {
        contenedorCarritoVacio.classList.remove("disable");
        contenedorCarritoProductos.classList.add("disable");
        contenedorCarritoAcciones.classList.add("disable");
        contenedorCarritoComprado.classList.add("disable");
    }
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carritoProductoEliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

    if (index !== -1) {
        productosEnCarrito.splice(index, 1);
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        cargarProductosCarrito();

        Toastify({
            text: "Producto eliminado",
            duration: 2500,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #E7A08A, #8A624F)",
                borderRadius: "2rem",
                textTransform: "uppercase",
                fontSize: ".75rem"
            },
            offset: { x: "1.5rem", y: "1.5rem" }
        }).showToast();
    }
}

botonVaciar.addEventListener("click", vaciarCarrito);

function vaciarCarrito() {
    Swal.fire({
        title: "¿Estás seguro?",
        icon: "question",
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
    }).then(result => {
        if (result.isConfirmed) {
            productosEnCarrito = [];
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
}

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
    contenedorTotal.innerText = `$${totalCalculado}`;
}

const formPedido = document.querySelector("#formClientes");
formPedido.addEventListener("submit", comprarCarrito);

function comprarCarrito(e) {
    e.preventDefault();

    const nombre = document.querySelector("#nombreCliente").value;
    const telefono = document.querySelector("#telefonoCliente").value;
    const direccion = document.querySelector("#direccionCliente").value;
    const metodoPago = document.querySelector("#metodoPago").value;
    const observaciones = document.querySelector("#observaciones").value;

    const numeroWhatsapp = "5492996280373";

    const cantidadTotal = productosEnCarrito.reduce((acc, producto) => {
        return acc + producto.cantidad;
    }, 0);

    const total = productosEnCarrito.reduce((acc, producto) => {
        return acc + producto.precio * producto.cantidad;
    }, 0);

    let descuento = 0;
    let totalFinal = total;

    if (metodoPago === "Efectivo") {
        descuento = total * 0.05;
        totalFinal = total - descuento;
    }

    let mensaje = "*Hola vengo de la web de Choleley, quiero realizar un pedido*.%0A%0A";

    mensaje += `Pedido: *${nombre}*%0A`;
    mensaje += `Teléfono: *${telefono}*%0A`;
    mensaje += `Pago: *${metodoPago}${metodoPago === "Efectivo" ? " (-5%)" : ""}*%0A`;
    mensaje += `Localidad: *${direccion}*%0A`;

    if (observaciones !== "") {
        mensaje += `Observaciones: *${observaciones}*%0A`;
    }

    mensaje += `-------------------------------%0A%0A`;

    productosEnCarrito.forEach(producto => {
        mensaje += `${producto.categoria.nombre.toUpperCase()}%0A`;
        mensaje += `- *${producto.titulo.toUpperCase()}*: `;
        mensaje += `${producto.cantidad} x $${producto.precio} = `;
        mensaje += `*$${producto.precio * producto.cantidad}*%0A%0A`;
    });

    mensaje += `ART.: *${cantidadTotal}*   TOTAL: *$${total}*%0A`;
    mensaje += `-------------------------------%0A`;

    if (metodoPago === "Efectivo") {
        mensaje += `%0A*Efectivo (-5%)* *$-${descuento}*%0A`;
    }

    mensaje += `%0AFINAL A ABONAR: *$${totalFinal}*`;

    const url = `https://wa.me/${numeroWhatsapp}?text=${mensaje}`;

    window.open(url, "_blank");

    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    contenedorCarritoVacio.classList.add("disable");
    contenedorCarritoProductos.classList.add("disable");
    contenedorCarritoAcciones.classList.add("disable");
    contenedorCarritoComprado.classList.remove("disable");

    const formularioCliente = document.querySelector(".formularioCliente");
    formularioCliente.classList.add("disable");
}
