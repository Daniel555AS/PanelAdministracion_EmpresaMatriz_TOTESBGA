document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form"); // Ensure that we select the form correctly

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Avoid page reloading

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Por favor, ingresa un correo electrónico empresarial y una contraseña.");
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/user-credential-validation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: email, password: password }) // Send in the body
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error en el inicio de sesión");
                }

                const data = await response.json();
                sessionStorage.setItem("userEmail", email); // Save the email to sessionStorage

                alert("¡Inicio de sesión exitoso!");
                window.location.href = "panel.html"; // Redirect to the panel
            } catch (error) {
                console.error("Error en la solicitud:", error);
                alert(error.message);
            }
        });
    }

    // Verify session in the panel
    if (window.location.pathname.includes("panel.html")) {
        const userEmail = sessionStorage.getItem("userEmail");

        if (!userEmail) {
            alert("Acceso no autorizado. Inicia sesión primero.");
            window.location.href = "login.html";
        } else {
            console.log("Usuario autenticado:", userEmail);
        }
    }
});
