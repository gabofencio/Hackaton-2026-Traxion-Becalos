const toggleBtn = document.getElementById("searchToggle");
const container = document.querySelector(".search-container");
const input = document.getElementById("searchInput");

// Botón para searchbar
toggleBtn.addEventListener("click", () => {
    container.classList.toggle("active");

    if (container.classList.contains("active")) {
        input.focus();
    }
});

function calcularRiesgo(data) {
    let riesgo = 0;
    // servicio de motor
    riesgo += (data.kmSinServicio / 10000) * 20;
    // edad
    riesgo += data.edad * 1.5;
    // conducción
    if (data.conduccion === "agresiva") riesgo += 15;
    // operación
    if (data.carga === "pesada") riesgo += 10;
    // código de falla
    if (data.codigoFalla) riesgo += 30;
    // Ajuste de kilometros por desgaste máximo
    let desgasteMaximo = 40000;
    if (data.carga === "pesada") {
        desgasteMaximo = 30000;
    }
    if (data.conduccion === "agresiva") {
        desgasteMaximo -= 5000;
    }
    // desgaste dinamico
    let porcentajeDeDesgaste = data.kmLlantas / desgasteMaximo;
    if (porcentajeDeDesgaste >= 1) {
        riesgo += 25;
    } else if (porcentajeDeDesgaste > 0.75) {
        riesgo += 15;
    } else if (porcentajeDeDesgaste > 0.5) {
        riesgo += 5;
    }
    return Math.min(Math.round(riesgo), 100);
}

function explicar(data) {
    let razones = [];
    if (data.kmSinServicio > 10000)
        razones.push("Alto kilometraje sin mantenimiento");
    if (data.edad > 5)
        razones.push("Unidad con antigüedad elevada");
    if (data.conduccion === "agresiva")
        razones.push("Conducción agresiva detectada");
    if (data.carga === "pesada")
        razones.push("Condiciones de operación exigentes");
    if (data.codigoFalla)
        razones.push("Código de falla activo");
    if (data.kmLlantas > 30000)
        razones.push("Desgaste elevado en llantas");
    return razones;
}

function accion(riesgo, data) {
    if (data.kmLlantas > 40000) return "Reemplazo inmediato de llantas";
    if (riesgo <= 30) return "Mantener operación normal";
    if (riesgo <= 60) return "Programar revisión";
    return "Intervención inmediata";
}

function evaluarUnidad(data) {
    const riesgo = calcularRiesgo(data);
    const nivel = clasificarRiesgo(riesgo);
    const razones = explicar(data);
    const recomendacion = accion(riesgo, data);

    return {
        riesgo,
        nivel,
        razones,
        recomendacion
    };
}

//lectura de datos y ejecución
function run() {
    const chatBox = document.getElementById("chatBox");
    const data = {
        kmSinServicio: Number(document.getElementById("km").value),
        edad: Number(document.getElementById("edad").value),
        conduccion: document.getElementById("conduccion").value,
        carga: document.getElementById("carga").value,
        codigoFalla: document.getElementById("codigoFalla").value !== "none",
        kmLlantas: Number(document.getElementById("kmLlantas").value)

    };

    const campos = document.querySelectorAll("#chatBody input, #chatBody select");

    for (let campo of campos) {
        if (campo.value === "") {
            alert("Completa todos los campos");
            return;
        }
    }
    const res = evaluarUnidad(data);
    actualizarSemaforo(res.nivel);
    document.getElementById("resultado").innerHTML = `
        <h2 style="color:${colorRiesgo(res.nivel)}">
            Riesgo: ${res.nivel} (${res.riesgo})%
        </h2>
        <p>${res.recomendacion}</p>
        <ul>
            ${res.razones.map(r => `<li>${r}</li>`).join("")}
        </ul>
    `;
    step = 2;

    setTimeout(() => {
        chatBox.innerHTML += `
        <div class="message bot">
            ¿Deseas contactar a un especialista o realizar otro análisis?
        </div>
    `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 2200);
}


// Clasificación de riesgo
function clasificarRiesgo(riesgo) {
    if (riesgo <= 30) return "BAJO";
    if (riesgo <= 60) return "MEDIO";
    return "ALTO";
}

//semaforo de riesgo
function colorRiesgo(nivel) {
    if (nivel === "BAJO") return "green";
    if (nivel === "MEDIO") return "orange";
    return "red";
}
// Semaforo dinamico
function actualizarSemaforo(nivel) {
    const green = document.getElementById("green");
    const orange = document.getElementById("orange");
    const red = document.getElementById("red");

    green.style.opacity = "0.3";
    orange.style.opacity = "0.3";
    red.style.opacity = "0.3";

    if (nivel === "BAJO") {
        green.style.opacity = "1";
    } else if (nivel === "MEDIO") {
        orange.style.opacity = "1";
    } else {
        red.style.opacity = "1";
    }
}


// conversación del chatbot

let step = 0;
function sendMessage() {
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const userText = input.value.trim();
    if (!userText) return;

    // Mensaje del usuario
    chatBox.innerHTML += `<div class="message user">${userText}</div>`;
    input.value = "";

    // Respuesta del asistente
    setTimeout(() => {
        if (step === 0) {
            if (
                userText.toLowerCase().includes("log") ||
                userText.toLowerCase().includes("trans") ||
                userText.toLowerCase().includes("mov")
            ) {
                step = 1;
                chatBox.innerHTML += `<div class="message bot">
        Perfecto, vamos a evaluar tu unidad. Por favor proporciona la siguiente información:
        <div class="chat-form-inline">
                       <div class="form-elements">
                <label for="km">Km sin servicio:</label>
                <input id="km" placeholder="Km sin servicio" type="number">
            </div>
            <div class="form-elements">
                <label for="edad">Años de servicio de unidad:</label>
                <input id="edad" placeholder="años de servicio" type="number">
            </div>
            <div class="form-elements">
                <label for="conduccion">Estilo de conducción del operador:</label>
                <select id="conduccion">
                    <option value="normal">Normal</option>
                    <option value="agresiva">Agresiva</option>
                </select>
            </div>
            <div class="form-elements">
                <label for="carga">Tamaño de carga transportada:</label>
                <select id="carga">
                    <option value="ligera">Ligera</option>
                    <option value="pesada">Pesada</option>
                </select>
            </div>
            <div class="form-elements">
                <label for="kmLlantas">Kilometraje desde el ultimo cambio de llantas:</label>
                <input id="kmLlantas" placeholder="Km en llantas" type="number">
            </div>
            <div class="form-elements">
                <label for="codigoFalla">Código de falla:</label>
                <select id="codigoFalla">
                    <option value="none">ninguno</option>
                    <optgroup label="Motor">
                        <option value="motor">P2133</option>
                        <option value="motor2">P0300</option>
                    </optgroup>
                    <optgroup label="Frenos y Suspensión">
                        <option value="frenado">C1279</option>
                        <option value="frenado2">C1280</option>
                    </optgroup>
                    <optgroup label="Comunicación">
                        <option value="comunicacion">U1203</option>
                        <option value="comunicacion2">U0121</option>
                    </optgroup>
                    <optgroup label="Sensores">
                        <option value="sensorOxigeno">P0135</option>
                        <option value="sensorTemperatura">P0113</option>
                </select>
            </div>
            <button onclick="run()">Evaluar</button>
            <div id="resultado"></div>
        </div>
    </div>`;
                step++;
            } else {
                chatBox.innerHTML += `<div class="message bot">Por favor escribe: Logística, Transporte de Carga o Movilización Urbana</div>`;
            }
        } else if (step === 2) {
            if (userText.toLowerCase().includes("esp")) {
                chatBox.innerHTML += `
        <div class="message bot">
            Te proporciono el siguiente Correo Electronico: <a href="mailto:contacto@traxion.com">contacto@traxion.com</a>
        </div>
    `;
            } else if (userText.toLowerCase().includes("an")) {
                step = 0;
                document.querySelector(".chat-form-inline")?.remove();
                chatBox.innerHTML += `
        <div class="message bot">
            Perfecto, iniciemos un nuevo análisis.<br>
            ¿De qué tipo es tu unidad? (Logística / Transporte / Movilidad)
        </div>
    `;
            } else{
                chatBox.innerHTML += `<div class="message bot">Por favor escribe: Contactar especialista o Realizar otro análisis</div>`;
            }
        }


        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);


}
