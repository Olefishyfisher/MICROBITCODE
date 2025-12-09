let tempSpan = document.getElementById("temp");
let heaterSpan = document.getElementById("heater");
let fanSpan = document.getElementById("fan");
let statusSpan = document.getElementById("status");

let port;
let writer, reader;

document.getElementById("connect").addEventListener("click", async () => {
    try {
        // Request a serial port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        // Set up streams
        const textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();

        // Show hidden admin panel
        document.getElementById("admin").style.display = "block";

        // Read loop
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            const parts = value.trim().split(",");
            if (parts.length >= 4) {
                tempSpan.textContent = parts[0];
                heaterSpan.textContent = parts[1];
                fanSpan.textContent = parts[2];
                statusSpan.textContent = parts[3];
            }
        }

    } catch (err) {
        console.error(err);
    }
});

async function sendCmd(cmd, val) {
    if (!writer) return;
    await writer.write(`${cmd},${val},\n`);
}
