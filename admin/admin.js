console.log("ADMIN CARGADO");

const tabla = document.getElementById("tabla");
const buscar = document.getElementById("buscar");

let editandoId = null;

async function verificarSesion(){

  const { data } = await client.auth.getSession();

  if(!data.session){
    window.location.href = "/admin/login.html";
  }
}

verificarSesion();

async function cargarDatos(texto = "") {

  let query = client
    .from("camisetas")
    .select("*");

  // BUSCADOR
  if(texto.trim() !== ""){

    query = query.ilike(
      "estudiante",
      `%${texto}%`
    );
  }

  const { data, error } = await query;

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if(error){
    return;
  }

  tabla.innerHTML = "";

  data.forEach(item => {

    tabla.innerHTML += `
      <tr>

        <td>${item.estudiante || ""}</td>
        <td>${item.talla || ""}</td>
        <td>${item.numero || ""}</td>
        <td>${item.observacion || ""}</td>

        <td>

          <button onclick="editar(
            ${item.id},
            '${item.estudiante || ""}',
            '${item.talla || ""}',
            '${item.numero || ""}',
            '${item.observacion || ""}'
          )">
            Editar
          </button>

          <button onclick="eliminar(${item.id})">
            Eliminar
          </button>

        </td>

      </tr>
    `;
  });
}

// BUSCADOR EN VIVO
buscar.addEventListener("keyup", (e)=>{

  cargarDatos(e.target.value);

});

async function agregar(){

  const nombre = document.getElementById("nombre").value;
  const talla = document.getElementById("talla").value;
  const numero = document.getElementById("numero").value;
  const observacion = document.getElementById("observacion").value;

  if(editandoId){

    await client
      .from("camisetas")
      .update({
        estudiante:nombre,
        talla:talla,
        numero:numero,
        observacion:observacion
      })
      .eq("id", editandoId);

    editandoId = null;

  }else{

    await client
      .from("camisetas")
      .insert([
        {
          estudiante:nombre,
          talla:talla,
          numero:numero,
          observacion:observacion
        }
      ]);
  }

  limpiarFormulario();

  cargarDatos();
}

function editar(id, nombre, talla, numero, observacion){

  editandoId = id;

  document.getElementById("nombre").value = nombre;
  document.getElementById("talla").value = talla;
  document.getElementById("numero").value = numero;
  document.getElementById("observacion").value = observacion;
}

async function eliminar(id){

  const confirmar = confirm("¿Eliminar registro?");

  if(!confirmar) return;

  await client
    .from("camisetas")
    .delete()
    .eq("id", id);

  cargarDatos();
}

function limpiarFormulario(){

  document.getElementById("nombre").value = "";
  document.getElementById("talla").value = "";
  document.getElementById("numero").value = "";
  document.getElementById("observacion").value = "";
}

cargarDatos();