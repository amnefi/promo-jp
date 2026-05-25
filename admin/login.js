async function login(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signInWithPassword({

    email,
    password

  });

  if(error){

    alert("Credenciales incorrectas");
    return;
  }

  window.location.href = "/admin";
}