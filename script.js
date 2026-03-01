const sleep = ms => new Promise(r => setTimeout(r, ms));

// CONTADOR REALISTA DINÁMICO
function iniciarContadorLive() {
    const el = document.getElementById('contador-descargas');
    const min = 1420; const max = 1490;
    let conteo = Math.floor(Math.random() * (max - min + 1)) + min;
    const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    el.innerText = fmt(conteo);

    setInterval(() => {
        const sube = Math.random() > 0.5;
        const variacion = Math.floor(Math.random() * 2) + 1;
        conteo = sube ? conteo + variacion : conteo - variacion;
        if (conteo > max) conteo -= 4; if (conteo < min) conteo += 4;
        el.innerText = fmt(conteo);
    }, 3800);
}

// FUNCIONES DE VENTANA EMERGENTE
function abrirModal(id) { document.getElementById(id).style.display = "block"; }
function cerrarModal(id) { document.getElementById(id).style.display = "none"; }

// PEGAR INTELIGENTE: LIMPIA Y PEGA
async function pegarLink(id) {
    try {
        const input = document.getElementById(id);
        const texto = await navigator.clipboard.readText();
        input.value = ""; 
        input.value = texto;
        const guia = input.parentElement.querySelector('.arrow-guide');
        if(guia) guia.style.display = "none";
    } catch (e) { alert("⚠️ Dale permiso al portapapeles."); }
}

async function procesarDuo() {
    const inputs = document.querySelectorAll('.video-input');
    const btn = document.getElementById('btnMain');
    const loader = document.getElementById('loader');
    const contenedor = document.getElementById('contenedor-resultados');
    contenedor.innerHTML = ""; 
    btn.disabled = true;
    loader.style.display = "block";
    document.querySelectorAll('.arrow-guide').forEach(g => g.style.display = "none");

    let count = 0;
    for (let input of inputs) {
        const url = input.value.trim();
        if (url && url.includes("tiktok.com")) {
            count++;
            try {
                if (count > 1) await sleep(1000);
                const res = await fetch('https://www.tikwm.com/api/?url=' + url);
                const json = await res.json();
                if (json.code === 0) renderizarTarjeta(json.data, contenedor);
            } catch (e) { console.error("Error"); }
        }
    }
    loader.style.display = "none";
    btn.disabled = false;
}

function renderizarTarjeta(data, parent) {
    const card = document.createElement('div');
    card.className = "result-card";
    const nombre = data.title ? data.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25) : "tiktok";
    
    card.innerHTML = `
        <img src="${data.author.avatar}" style="width:55px; border-radius:50%; border:2px solid var(--neon-cyan); margin-bottom:10px;">
        <p><strong>@${data.author.unique_id}</strong></p>
        <video controls poster="${data.origin_cover}" playsinline crossorigin="anonymous">
            <source src="${data.play}" type="video/mp4">
        </video>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px;">
            <button onclick="descargarDirecto('${data.play}', '${nombre}_HD.mp4', this)" style="background:var(--neon-cyan); border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; grid-column: 1/3;">📥 DESCARGAR FULL HD</button>
            <button onclick="descargarDirecto('${data.music}', '${nombre}_audio.mp3', this)" style="background:var(--neon-magenta); color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; grid-column: 1/3;">🎵 AUDIO ORIGINAL PRO</button>
        </div>
    `;
    parent.appendChild(card);

    // AMPLIFICADOR DE AUDIO (+40% POTENCIA)
    const video = card.querySelector('video');
    video.onplay = function() {
        if (!video.dataset.boosted) {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(video);
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 1.4; 
            source.connect(gainNode); gainNode.connect(audioCtx.destination);
            video.dataset.boosted = "true";
        }
    };
}

async function descargarDirecto(url, nombre, btn) {
    const original = btn.innerText; btn.innerText = "⏳ BAJANDO...";
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const l = document.createElement('a');
        l.href = window.URL.createObjectURL(blob);
        l.download = nombre; l.click();
    } catch (e) { window.open(url, '_blank'); }
    finally { btn.innerText = original; }
}

function limpiarTodo() {
    document.querySelectorAll('.video-input').forEach(i => i.value = "");
    document.getElementById('contenedor-resultados').innerHTML = "";
    document.querySelectorAll('.arrow-guide').forEach(g => g.style.display = "block");
}

window.onload = iniciarContadorLive;