let map, rasterMarker;
let currentRasterImage = null;

function initMap() {
    map = L.map('map').setView([53.430127, 14.564802], 13);
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
}

function requestPermissions() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, {timeout:1000});
    }
}

function gotoMyLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        document.getElementById('lat').innerText = lat.toFixed(6);
        document.getElementById('lon').innerText = lon.toFixed(6);
        map.setView([lat, lon], 16);
        if (rasterMarker) map.removeLayer(rasterMarker);
        rasterMarker = L.marker([lat, lon]).addTo(map).bindPopup('Twoja lokalizacja').openPopup();
    });
}

function createSlots() {
    const slots = document.getElementById('slots');
    slots.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.dataset.index = i;
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', onDropToSlot);
        slot.addEventListener('dragenter', () => slot.style.borderColor = '#666');
        slot.addEventListener('dragleave', () => slot.style.borderColor = '');
        slots.appendChild(slot);
    }
}

function onDropToSlot(e) {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    const tile = document.getElementById(tileId);
    const slot = e.currentTarget;

    slot.style.borderColor = "";

    const oldSlot = tile.parentElement;
    if (oldSlot && oldSlot.classList.contains('slot')) {
        oldSlot.classList.remove('correct');
        oldSlot.style.borderColor = "";
    }
    if (slot.firstChild) {
        document.getElementById('stol').appendChild(slot.firstChild);
    }
    slot.appendChild(tile);
    checkTileCorrectness(tile, slot);
    verifyAll();
}

function onDropToStol(e) {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    const tile = document.getElementById(tileId);

    const parentSlot = tile.parentElement;
    if (parentSlot && parentSlot.classList.contains('slot')) {
        parentSlot.classList.remove('correct');
        parentSlot.style.borderColor = "";
    }

    document.getElementById('stol').appendChild(tile);

    verifyAll();
}

function checkTileCorrectness(tile, slot) {
    if (tile.dataset.index === slot.dataset.index) {
        slot.classList.add('correct');
        console.log(`Puzel o indexie ${slot.dataset.index} ułożony poprawnie `);
    } else {
        slot.classList.remove('correct');
    }
}

function verifyAll() {
    const slots = Array.from(document.querySelectorAll('.slot'));
    const allCorrect = slots.every(s => s.firstChild && s.classList.contains('correct'));
    if (allCorrect) {
        document.getElementById('message').innerText = 'PUZZLE UŁOŻONE';
        fireNotification('DONE!!!', { body: 'WSZYSTKIE PUZZLE UŁOŻONE' });
    } else {
        document.getElementById('message').innerText = '';
    }
}

function fireNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

function makeTilesFromCanvas(canvas) {
    const cols = 4, rows = 4;
    const tileW = Math.floor(canvas.width / cols);
    const tileH = Math.floor(canvas.height / rows);
    const stol = document.getElementById('stol');
    stol.innerHTML = '';

    const tiles = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileW;
            tileCanvas.height = tileH;
            const ctx = tileCanvas.getContext('2d');
            ctx.drawImage(canvas, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);

            const img = document.createElement('img');
            img.src = tileCanvas.toDataURL();
            img.id = 'tile-' + idx;
            img.draggable = true;
            img.className = 'tile';
            img.dataset.index = String(idx);
            img.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', img.id);
            });

            tiles.push(img);
        }
    }

    const order = shuffle(Array.from(Array(16).keys()));
    for (let i = 0; i < order.length; i++) {
        stol.appendChild(tiles[order[i]]);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveMapAndCreatePuzzle() {
    leafletImage(map, function(err, canvas) {
        currentRasterImage = canvas;
        makeTilesFromCanvas(canvas);
        createSlots();

        const stol = document.getElementById('stol');
        stol.addEventListener('dragover', e => e.preventDefault());
        stol.addEventListener('drop', onDropToStol);
    });
}

window.addEventListener('load', () => {
    initMap();
    requestPermissions();
    createSlots();
    document.getElementById('btn-loc').addEventListener('click', gotoMyLocation);
    document.getElementById('btn-save').addEventListener('click', saveMapAndCreatePuzzle);
});
