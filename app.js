const tabla = document.getElementById("tabla");

const buscar = document.getElementById("buscar");

let dataTable = null;

/* =========================
   CARGAR DATOS
========================= */

async function cargarDatos(texto = "") {

    let query = client
        .from("camisetas")
        .select("*")
        .order("id", { ascending: false });

    if (texto.trim() !== "") {

        query = query.ilike(
            "estudiante",
            `%${texto}%`
        );
    }

    const { data, error } = await query;

    if (error) {

        console.log(error);

        return;
    }

    // destruir tabla anterior

    if (dataTable) {

        dataTable.destroy();

        dataTable = null;
    }

    tabla.innerHTML = "";

    data.forEach(item => {

        tabla.innerHTML += `

        <tr>

            <td>
                ${item.codigo || ""}
            </td>

            <td>
                ${item.genero || ""}
            </td>

            <td>
                ${item.estudiante || ""}
            </td>

            <td>
                ${item.talla || ""}
            </td>

            <td>
                ${item.numero || ""}
            </td>

            <td>
                ${item.observacion || ""}
            </td>

        </tr>
        `;
    });

    // iniciar DataTable

    dataTable = $('#tabla-datos').DataTable({

        responsive: true,

        pageLength: 10,

        language: {

            url:
            'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },

        dom: 'tip'
    });
}

/* =========================
   BUSCADOR PERSONALIZADO
========================= */

buscar.addEventListener("keyup", (e) => {

    if (dataTable) {

        dataTable.search(
            e.target.value
        ).draw();
    }
});

/* =========================
   INICIAR
========================= */

cargarDatos();