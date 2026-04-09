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
    const data = {
        kmSinServicio: Number(document.getElementById("km").value),
        edad: Number(document.getElementById("edad").value),
        conduccion: document.getElementById("conduccion").value,
        carga: document.getElementById("carga").value,
        codigoFalla: document.getElementById("codigoFalla").value !== "none",
        kmLlantas: Number(document.getElementById("kmLlantas").value)
    };

    const res = evaluarUnidad(data);

    document.getElementById("resultado").innerHTML = `
        <h2 style="color:${colorRiesgo(res.nivel)}">
            Riesgo: ${res.nivel} (${res.riesgo})%
        </h2>
        <p>${res.recomendacion}</p>
        <ul>
            ${res.razones.map(r => `<li>${r}</li>`).join("")}
        </ul>
    `;
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