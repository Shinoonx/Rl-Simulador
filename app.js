// app.js

// --- 1. CONFIGURACIÓN DE LA INTERFAZ ---
const canvas = document.getElementById('red-canvas');
const ctx = canvas.getContext('2d');
const sliderFP = document.getElementById('penalizacion-fp');
const sliderFN = document.getElementById('penalizacion-fn');
const valFP = document.getElementById('val-fp');
const valFN = document.getElementById('val-fn');
const spanPrecision = document.getElementById('precision-text');
const spanRecompensa = document.getElementById('recompensa-text');
const btnReiniciar = document.getElementById('btn-reiniciar');

// --- 2. VARIABLES DEL ENTORNO Y RECOMPENSAS ---
let penFP = parseInt(sliderFP.value);
let penFN = parseInt(sliderFN.value);

sliderFP.addEventListener('input', (e) => { penFP = parseInt(e.target.value); valFP.innerText = e.target.value; });
sliderFN.addEventListener('input', (e) => { penFN = parseInt(e.target.value); valFN.innerText = e.target.value; });

// --- 3. EL CEREBRO DEL AGENTE (Q-LEARNING SIMPLIFICADO) ---
// La Q-Table guarda el "valor" de tomar una acción dado un estado.
// Estados posibles: 'normal', 'ataque'
// Acciones posibles (índices): 0 (Permitir), 1 (Bloquear)
let qTable = {
    'normal': [0, 0], 
    'ataque': [0, 0]
};
let recompensaTotal = 0;
let aciertos = 0;
let totalEvaluados = 0;
const alpha = 0.1; // Tasa de aprendizaje: qué tan rápido actualiza sus conocimientos

function reiniciarAgente() {
    qTable = { 'normal': [0, 0], 'ataque': [0, 0] };
    recompensaTotal = 0;
    aciertos = 0;
    totalEvaluados = 0;
    paquetes = [];
    spanPrecision.innerText = '0%';
    spanRecompensa.innerText = '0';
}
btnReiniciar.addEventListener('click', reiniciarAgente);

// --- 4. PROGRAMACIÓN ORIENTADA A OBJETOS: LOS PAQUETES DE RED ---
let paquetes = [];

class Paquete {
    constructor() {
        this.x = 0; // Nacen en el borde izquierdo (Internet)
        this.y = canvas.height / 2 + (Math.random() * 40 - 20); // Ligera variación en la altura
        this.tipo = Math.random() > 0.7 ? 'ataque' : 'normal'; // 30% probabilidad de ser ataque
        this.velocidad = 2 + Math.random() * 2; // Velocidad aleatoria
        this.estado = 'viajando'; 
        this.color = this.tipo === 'normal' ? '#f1c40f' : '#e74c3c'; // Amarillo: Normal, Rojo: Ataque
    }

    dibujar() {
        if (this.estado === 'bloqueado') return; // Si es bloqueado, desaparece
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    mover() {
        if (this.estado !== 'bloqueado') {
            this.x += this.velocidad;
        }
    }
}

// --- 5. BUCLE PRINCIPAL (EL MOTOR DEL SIMULADOR) ---
function animar() {
    // A. Limpiar y redibujar la infraestructura
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#2ecc71'; // Servidor (Derecha)
    ctx.fillRect(canvas.width - 120, canvas.height / 2 - 40, 80, 80);
    ctx.fillStyle = '#3498db'; // Agente IDS (Centro)
    ctx.fillRect(canvas.width / 2 - 15, canvas.height / 2 - 70, 30, 140);
    
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🌐 Internet', 20, 30);
    ctx.textAlign = 'center';
    ctx.fillText('Agente RL', canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText('Servidor', canvas.width - 80, canvas.height / 2 - 50);

    // B. Generar nuevo tráfico de red aleatoriamente
    if (Math.random() < 0.03) { 
        paquetes.push(new Paquete());
    }

    // C. Procesar cada paquete en la red
    for (let i = paquetes.length - 1; i >= 0; i--) {
        let p = paquetes[i];
        p.mover();
        p.dibujar();

        // D. INTERACCIÓN: El paquete llega al Agente (Centro del Canvas)
        if (p.estado === 'viajando' && p.x >= canvas.width / 2 - 15) {
            let estado = p.tipo;
            let accion;
            
            // Política de decisión (Epsilon-Greedy simplificada)
            // 10% de las veces explora al azar, 90% usa su Q-Table
            if (Math.random() < 0.1) {
                accion = Math.random() < 0.5 ? 0 : 1; 
            } else {
                // Explotación: Elige la acción con mayor valor en su tabla
                accion = qTable[estado][0] > qTable[estado][1] ? 0 : 1;
            }

            // Aplicar la acción
            p.estado = (accion === 1) ? 'bloqueado' : 'permitido';

            // E. ASIGNAR RECOMPENSAS
            let recompensa = 0;
            totalEvaluados++;

            if (estado === 'normal' && accion === 0) {
                recompensa = 1; // Verdadero Negativo: Permite usuario real (Bien)
                aciertos++;
            } else if (estado === 'ataque' && accion === 1) {
                recompensa = 10; // Verdadero Positivo: Bloquea ataque (Excelente)
                aciertos++;
            } else if (estado === 'normal' && accion === 1) {
                recompensa = penFP; // Falso Positivo: Bloquea usuario real (Mal)
            } else if (estado === 'ataque' && accion === 0) {
                recompensa = penFN; // Falso Negativo: Deja pasar ataque (Pésimo)
            }

            // F. ACTUALIZAR EL APRENDIZAJE (Ecuación de Bellman simplificada)
            // Q(estado, accion) = valor_anterior + alpha * (recompensa - valor_anterior)
            qTable[estado][accion] = qTable[estado][accion] + alpha * (recompensa - qTable[estado][accion]);

            // Actualizar interfaz
            recompensaTotal += recompensa;
            spanRecompensa.innerText = recompensaTotal.toFixed(1);
            spanPrecision.innerText = ((aciertos / totalEvaluados) * 100).toFixed(1) + '%';
        }

        // Eliminar paquetes que ya salieron de la pantalla o fueron bloqueados (optimización de memoria)
        if (p.x > canvas.width || p.estado === 'bloqueado') {
            paquetes.splice(i, 1);
        }
    }

    // G. Repetir el bucle en el próximo frame
    requestAnimationFrame(animar);
}

// Iniciar simulación
animar();