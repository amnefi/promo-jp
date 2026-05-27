console.log("ADMIN CARGADO");

const tablaBody = document.getElementById("tabla");
const buscar = document.getElementById("buscar");

let editandoId = null;
let dataTable = null;

/* =========================
   VERIFICAR SESION
========================= */

async function verificarSesion() {

  const { data } = await client.auth.getSession();

  if (!data.session) {

    window.location.href = "/admin/login.html";
  }
}

verificarSesion();

/* =========================
   DATATABLE
========================= */

function initDataTable() {

  dataTable = $('#tabla-datos').DataTable({

    destroy: true,

    pageLength: 10,

    responsive: true,

    language: {
      url:
        'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
    },
  });
}

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

    Swal.fire({

      icon: "error",

      title: "Error",

      text: "No se pudieron cargar los datos"

    });

    return;
  }

  // destruir DataTable

  if (dataTable) {

    dataTable.destroy();

    dataTable = null;
  }

  tablaBody.innerHTML = "";

  data.forEach(item => {

    tablaBody.innerHTML += `

      <tr>

  <!-- CODIGO -->
<td class="codigo-registro">

  ${item.codigo || ""}

</td>

  <!-- GENERO -->
  <td>${item.genero || ""}</td>

  <!-- NOMBRE -->
  <td>${item.estudiante || ""}</td>

  <!-- TALLA -->
  <td>${item.talla || ""}</td>

  <!-- NUMERO -->
  <td>${item.numero || ""}</td>

  <!-- OBSERVACION -->
  <td>${item.observacion || ""}</td>

        <td class="acciones-tabla">

          <button
            class="btn-editar"
            onclick='editar(
              ${item.id},
              ${JSON.stringify(item.genero || "")},
              ${JSON.stringify(item.estudiante || "")},
              ${JSON.stringify(item.talla || "")},
              ${JSON.stringify(item.numero || "")},
              ${JSON.stringify(item.observacion || "")}
            )'
          >

            <i class="fa-solid fa-pen"></i>

            Editar

          </button>

          <button
            class="btn-eliminar"
            onclick="eliminar(${item.id})"
          >

            <i class="fa-solid fa-trash"></i>

            Eliminar

          </button>

        </td>

      </tr>
    `;
  });

  initDataTable();
}

/* =========================
   BUSCADOR
========================= */

buscar.addEventListener("keyup", (e) => {

  cargarDatos(e.target.value);
});

/* =========================
   AGREGAR / EDITAR
========================= */

async function agregar() {

  const genero =
    document.getElementById("genero").value;

  const nombre =
    document.getElementById("nombre").value.trim();

  const talla =
    document.getElementById("talla").value.trim();

  const numero =
    document.getElementById("numero").value;

  const observacion =
    document.getElementById("observacion").value;

  // VALIDACION

  if (
    !genero ||
    !nombre ||
    !talla ||
    !numero
  ) {

    Swal.fire({

      icon: "warning",

      title: "Campos incompletos",

      text: "Completa todos los campos"

    });

    return;
  }

  let error = null;

  // EDITAR

  if (editandoId) {

    const respuesta = await client
      .from("camisetas")
      .update({

        genero: genero,

        estudiante: nombre,

        talla: talla,

        numero: numero,

        observacion: observacion

      })
      .eq("id", editandoId);

    error = respuesta.error;

  } else {

    // =========================
    // GENERAR CODIGO
    // =========================

    // Obtener último código registrado

    const { data: ultimoRegistro } = await client
      .from("camisetas")
      .select("codigo")
      .order("id", { ascending: false })
      .limit(1);

    let siguienteNumero = 1;

    // Si ya existen registros

    if (
      ultimoRegistro.length > 0 &&
      ultimoRegistro[0].codigo
    ) {

      // Extraer número
      const ultimoNumero = parseInt(

        ultimoRegistro[0]
          .codigo
          .replace("CAM-", "")

      );

      siguienteNumero = ultimoNumero + 1;
    }

    // Crear código final

    const codigo = `CAM-${String(
      siguienteNumero
    ).padStart(3, "0")}`;

    // =========================
    // INSERTAR
    // =========================

    const respuesta = await client
      .from("camisetas")
      .insert([{

        codigo: codigo,

        genero: genero,

        estudiante: nombre,

        talla: talla,

        numero: numero,

        observacion: observacion

      }]);

    error = respuesta.error;
  }

  if (error) {

    console.log(error);

    Swal.fire({

      icon: "error",

      title: "Error",

      text: "No se pudo guardar"

    });

    return;
  }

  Swal.fire({

    icon: "success",

    title: editandoId
      ? "Registro actualizado"
      : "Registro guardado",

    timer: 1500,

    showConfirmButton: false
  });

  limpiarFormulario();

  editandoId = null;

  await cargarDatos();
}

/* =========================
   EDITAR
========================= */

function editar(
  id,
  genero,
  estudiante,
  talla,
  numero,
  observacion
) {

  editandoId = id;

  document.getElementById("genero").value = genero;

  document.getElementById("nombre").value = estudiante;

  document.getElementById("talla").value = talla;

  document.getElementById("numero").value = numero;

  document.getElementById("observacion").value = observacion;

  // SCROLL BONITO

  window.scrollTo({

    top: 0,

    behavior: "smooth"
  });
}

/* =========================
   ELIMINAR
========================= */

async function eliminar(id) {

  const resultado = await Swal.fire({

    title: "¿Eliminar?",

    text: "No podrás revertirlo",

    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Sí, eliminar",

    cancelButtonText: "Cancelar"
  });

  if (!resultado.isConfirmed) return;

  const { error } = await client
    .from("camisetas")
    .delete()
    .eq("id", id);

  if (error) {

    Swal.fire({

      icon: "error",

      title: "Error al eliminar"
    });

    return;
  }

  Swal.fire({

    icon: "success",

    title: "Registro eliminado",

    timer: 1200,

    showConfirmButton: false
  });

  cargarDatos();
}

/* =========================
   LIMPIAR FORMULARIO
========================= */

function limpiarFormulario() {

  editandoId = null;

  document.getElementById("genero").selectedIndex = 0;

  document.getElementById("nombre").value = "";

  document.getElementById("talla").value = "";

  document.getElementById("numero").value = "";

  document.getElementById("observacion").selectedIndex = 0;
}

/* =========================
   EXPORTAR EXCEL / ODS
========================= */

function obtenerDatosExportacion() {

  const datos =
    $('#tabla-datos').DataTable().rows().data();

  let data = [];

  datos.each(function (row) {

    data.push({

      Codigo: row[0],

      Genero: row[1],

      Nombre: row[2],

      Talla: row[3],

      Numero: row[4],

      Observacion: row[5]
    });
  });

  return data;
}

function exportarExcel() {

  const data = obtenerDatosExportacion();

  const ws =
    XLSX.utils.json_to_sheet(data);

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Camisetas"
  );

  XLSX.writeFile(
    wb,
    "camisetas.xlsx"
  );
}

function exportarODS() {

  const data = obtenerDatosExportacion();

  const ws =
    XLSX.utils.json_to_sheet(data);

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Camisetas"
  );

  XLSX.writeFile(
    wb,
    "camisetas.ods"
  );
}

/* =========================
   EXPORTAR PDF
========================= */

async function exportarPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const datos =
    $('#tabla-datos').DataTable().rows().data();

  let filas = [];

  datos.each(function (row) {

    filas.push([

      row[0],

      row[1],

      row[2],

      row[3],

      row[4],

      row[5]

    ]);
  });

  doc.text(
    "Reporte de Camisetas",
    14,
    15
  );

  doc.autoTable({

    head: [[

      "Código",
      "Genero",
      "Nombre",
      "Talla",
      "Número",
      "Observación"

    ]],

    body: filas,

    startY: 25
  });

  doc.save("camisetas.pdf");
}

/* =========================
   INICIAR
========================= */

cargarDatos();