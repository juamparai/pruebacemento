document.getElementById("logout").addEventListener("click", () => {
  fetch('/api/logout', {
      method: 'POST',
      credentials: 'include' // Asegura que las cookies se incluyan en la solicitud
  })
  .then(response => response.json())
  .then(data => {
      console.log(data.message); // "Usuario desloggeado"
      document.location.href = "/"; // Redirige al usuario
  })
  .catch(error => console.error('Error al hacer logout:', error));
});