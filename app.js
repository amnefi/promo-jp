const tabla = document.getElementById("tabla");
const buscar = document.getElementById("buscar");

async function cargarDatos(texto = "") {

    let query = client
        .from("camisetas")
        .select("*");

    if (texto) {

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

    tabla.innerHTML = "";

    data.forEach(item => {

        tabla.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.genero}</td>
        <td>${item.estudiante}</td>
        <td>${item.talla}</td>
        <td>${item.numero}</td>
        <td>${item.observacion}</td>
      </tr>
    `;
    });
}

buscar.addEventListener("keyup", (e) => {

    cargarDatos(e.target.value);

});

cargarDatos();