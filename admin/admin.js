const tabla = document.getElementById("tabla");

async function verificarSesion(){

  const { data } = await client.auth.getSession();

  if(!data.session){

    window.location.href = "/";
  }
}

verificarSesion();

async function cargarDatos(){

  const { data } = await client
    .from("camisetas")
    .select("*");

  tabla.innerHTML = "";

  data.forEach(item => {

    tabla.innerHTML += `
      <tr>

        <td>${item.estudiante}</td>
        <td>${item.talla}</td>
        <td>${item.numero}</td>

        <td>

          <button onclick="eliminar(${item.id})">
            Eliminar
          </button>

        </td>

      </tr>
    `;
  });
}

async function agregar(){

  const nombre = document.getElementById("nombre").value;
  const talla = document.getElementById("talla").value;
  const numero = document.getElementById("numero").value;
  const observacion = document.getElementById("observacion").value;

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

  cargarDatos();
}

async function eliminar(id){

  await client
    .from("camisetas")
    .delete()
    .eq("id", id);

  cargarDatos();
}

cargarDatos();