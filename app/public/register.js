document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();  // Evitar el comportamiento por defecto del formulario
  
    // Obtener los valores de los campos
    const user = document.getElementById("user").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    // Validar los campos (opcional, puedes personalizar esta parte)
    if (!user || !email || !password) {
      return showError("Completar todos los campos.");
    }
  
    try {
      // Hacer la solicitud POST al servidor
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user,
          email,
          password,
        }),
      });
  
      const data = await res.json();
      
      // Si la respuesta no es exitosa, mostrar el mensaje de error
      if (!res.ok) {
        if (data.message === "El email ya está registrado"){
          return showError ("El email ya se encuentra registrado.")
        }
        return showError("Error al registrar el usuario. Intente de nuevo.");
      }
  
      // Si hay una redirección, redirigir al usuario
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (error) {
      // Manejo de errores en caso de que falle la solicitud
      showError("Error al conectarse al servidor.");
      console.error(error);
    }
  });
  
  // Función para mostrar el mensaje de error
  function showError(message) {
    const errorElement = document.querySelector(".error");
    errorElement.textContent = message;  // Establecer el mensaje de error
    errorElement.classList.remove("escondido");  // Mostrar el mensaje de error
  }