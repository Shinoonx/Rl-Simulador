const canvas = document.getElementById('red-canvas');
const ctx = canvas.getContext('2d');

const sliderFP = document.getElementById('penalizacion-fp');
const sliderFN = document.getElementById('penalizacion-fn');
const valFP = document.getElementById('val-fp');
const valFN = document.getElementById('val-fn');

const sliderAlpha = document.getElementById('tasa-alpha');
const sliderEpsilon = document.getElementById('tasa-epsilon');
const valAlpha = document.getElementById('val-alpha');
const valEpsilon = document.getElementById('val-epsilon');

const cellNorm0 = document.getElementById('q-norm-0');
const cellNorm1 = document.getElementById('q-norm-1');
const cellAtk0 = document.getElementById('q-atk-0');
const cellAtk1 = document.getElementById('q-atk-1');

const spanPrecision = document.getElementById('precision-text');
const spanRecompensa = document.getElementById('recompensa-text');
const btnReiniciar = document.getElementById('btn-reiniciar');

let penFP = parseInt(sliderFP.value);
let penFN = parseInt(sliderFN.value);
let alpha = parseFloat(sliderAlpha.value);
let epsilon = parseFloat(sliderEpsilon.value);

sliderFP.addEventListener('input', (e) => { penFP = parseInt(e.target.value); valFP.innerText = e.target.value; });
sliderFN.addEventListener('input', (e) => { penFN = parseInt(e.target.value); valFN.innerText = e.target.value; });
sliderAlpha.addEventListener('input', (e) => { alpha = parseFloat(e.target.value); valAlpha.innerText = alpha.toFixed(2); });
sliderEpsilon.addEventListener('input', (e) => { epsilon = parseFloat(e.target.value); valEpsilon.innerText = epsilon.toFixed(2); });


let qTable = {
    'normal': [0, 0], 
    'ataque': [0, 0]
};
let recompensaTotal = 0;
let aciertos = 0;
let totalEvaluados = 0;

function actualizarTablaHTML() {
    cellNorm0.innerText = qTable['normal'][0].toFixed(2);
    cellNorm1.innerText = qTable['normal'][1].toFixed(2);
    cellAtk0.innerText = qTable['ataque'][0].toFixed(2);
    cellAtk1.innerText = qTable['ataque'][1].toFixed(2);
}

function reiniciarAgente() {
    qTable = { 'normal': [0, 0], 'ataque': [0, 0] };
    recompensaTotal = 0; aciertos = 0; totalEvaluados = 0;
    entidades = [];
    lasers = [];
    spanPrecision.innerText = '0%';
    spanRecompensa.innerText = '0';
    actualizarTablaHTML();
}
btnReiniciar.addEventListener('click', reiniciarAgente);

let entidades = [];
let lasers = []; 

class Entidad {
    constructor() {
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = -20; 
        this.tipo = Math.random() > 0.7 ? 'ataque' : 'normal'; 
        this.velocidad = 1.5 + Math.random() * 2;
        this.estado = 'cayendo'; 
        this.color = this.tipo === 'normal' ? '#34d399' : '#f43f5e'; 
    }

    dibujar() {
        if (this.estado === 'bloqueado' || this.estado === 'absorbido') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        if (this.tipo === 'ataque') {
            ctx.moveTo(0, 10);
            ctx.lineTo(10, -10);
            ctx.lineTo(0, -4);
            ctx.lineTo(-10, -10);
        } else {
            ctx.moveTo(0, -10);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-10, 0);
        }
        
        ctx.fill();
        ctx.restore();
    }

    mover() {
        if (this.estado === 'cayendo' || this.estado === 'permitido') {
            this.y += this.velocidad;
        }
    }
}

function dibujarBase() {
    
    const lineaDeteccionY = canvas.height - 180;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'; 
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, lineaDeteccionY);
    ctx.lineTo(canvas.width, lineaDeteccionY);
    ctx.stroke();
    ctx.setLineDash([]); 
    
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.font = '10px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText('LÍNEA DE DETECCIÓN / RANGO DE RADAR', 10, lineaDeteccionY - 5);

    // 2. ESCUDO BASE (Donde se absorben los datos legítimos)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; 
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();
    
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - 30);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    
    ctx.beginPath();
    ctx.moveTo(0, -35);   
    ctx.lineTo(6, -10);   
    ctx.lineTo(30, 5);    
    ctx.lineTo(15, 15);   
    ctx.lineTo(-15, 15);  
    ctx.lineTo(-30, 5);   
    ctx.lineTo(-6, -10);  
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    dibujarBase();

    
    for (let i = lasers.length - 1; i >= 0; i--) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height - 60); 
        ctx.lineTo(lasers[i].x, lasers[i].y);
        ctx.stroke();
        ctx.shadowBlur = 0; 
        lasers[i].frames--;
        if (lasers[i].frames <= 0) lasers.splice(i, 1);
    }

    if (Math.random() < 0.03) entidades.push(new Entidad());

    const lineaDeteccionY = canvas.height - 180;
    const lineaEscudoY = canvas.height - 40;

    for (let i = entidades.length - 1; i >= 0; i--) {
        let p = entidades[i];
        p.mover();
        p.dibujar();

        
        if (p.estado === 'cayendo' && p.y >= lineaDeteccionY) {
            let estado = p.tipo;
            let accion;
            
            if (Math.random() < epsilon) {
                accion = Math.random() < 0.5 ? 0 : 1; 
            } else {
                accion = qTable[estado][0] > qTable[estado][1] ? 0 : 1;
            }

            // Si intercepta, destruye de inmediato. Si permite, cambia estado a 'permitido' para que siga bajando.
            if (accion === 1) {
                p.estado = 'bloqueado';
                lasers.push({ x: p.x, y: p.y, frames: 8 }); // Laser más prolongado visualmente
            } else {
                p.estado = 'permitido'; 
            }

            let recompensa = 0;
            totalEvaluados++;

            if (estado === 'normal' && accion === 0) { recompensa = 1; aciertos++; } 
            else if (estado === 'ataque' && accion === 1) { recompensa = 10; aciertos++; } 
            else if (estado === 'normal' && accion === 1) { recompensa = penFP; } 
            else if (estado === 'ataque' && accion === 0) { recompensa = penFN; } 

            qTable[estado][accion] = qTable[estado][accion] + alpha * (recompensa - qTable[estado][accion]);

            recompensaTotal += recompensa;
            spanRecompensa.innerText = recompensaTotal.toFixed(1);
            spanPrecision.innerText = ((aciertos / totalEvaluados) * 100).toFixed(1) + '%';
            
            actualizarTablaHTML();
        }

        
        if (p.estado === 'permitido' && p.y >= lineaEscudoY) {
            p.estado = 'absorbido';
        }

        
        if (p.estado === 'bloqueado' || p.estado === 'absorbido' || p.y > canvas.height) {
            entidades.splice(i, 1);
        }
    }
    requestAnimationFrame(animar);
}

animar();