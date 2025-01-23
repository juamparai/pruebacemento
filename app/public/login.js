const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.children.email.value;
  const password = e.target.children.password.value;
  
  // Hacer la solicitud al backend
  const res = await fetch("http://localhost:4000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email, password
    })
  });

  // Si la respuesta no es exitosa, mostrar el error
  if (!res.ok) {
    const errorJson = await res.json(); // Obtener el mensaje de error del backend
    mensajeError.textContent = errorJson.message; // Mostrar el mensaje de error
    mensajeError.classList.remove("escondido"); // Asegurarse de que se muestre el mensaje
    return;
  }

  // Si la respuesta es exitosa, redirigir al usuario
  const resJson = await res.json();
  if (resJson.redirect) {
    window.location.href = resJson.redirect;
  }
});
