const connectBtn = document.getElementById("connectBtn");
const tempEl = document.getElementById("temp");
const heaterEl = document.getElementById("heater");
const fanEl = document.getElementById("fan");
const sampleEl = document.getElementById("sample");

let port;
let reader;

connectBtn.addEventListener("click", async () => {
    try {
        // Request the user to select a serial port (micro:bit)
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        connectBtn.disabled = true;
        connectBtn.textContent = "Connected";
        readLoop();
    } catch (err) {
        console.error("Error connecting to micro:bit:", err);
        alert("Failed to connect to micro:bit. Make sure it's plugged in.");
    }
});

async function readLoop() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) parseData(value.trim());
    }
}

function parseData(line) {
    // Expect micro:bit CSV: TEMP,HEATER,FAN,SAMPLE
    // Example: 88.5,ON,ON,Safe
    const parts = line.split(",");
    if (parts.length < 4) return;

    tempEl.textContent = parseFloat(parts[0]).toFixed(1);
    heaterEl.textContent = parts[1];
    fanEl.textContent = parts[2];
    sampleEl.textContent = parts[3];
}
