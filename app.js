const tempSpan = document.getElementById("temp");
const heaterSpan = document.getElementById("heater");
const fanSpan = document.getElementById("fan");
const statusSpan = document.getElementById("status");
const alertTone = document.getElementById("alertTone");

let port, writer, reader;

document.getElementById("connect").addEventListener("click", async () => {
    try {
        // Request a USB serial port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        const textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();

        // Show admin panel after connection
        document.getElementById("admin").style.display = "block";

        // Read serial data continuously
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;

            const parts = value.trim().split(",");
            if (parts.length >= 4) {
                const temp = parseFloat(parts[0]);
                const heater = parts[1];
                const fan = parts[2];
                const status = parts[3];

                tempSpan.textContent = temp.toFixed(1);
                heaterSpan.textContent = heater;
                fanSpan.textContent = fan;
                statusSpan.textContent = status;

                // Accessibility & alerts
                if (status.includes("At Risk")) {
                    statusSpan.className = "alert";
                    alertTone.play().catch(() => {});
                } else if (status.includes("Destroyed")) {
                    statusSpan.className = "alert";
                } else {
                    statusSpan.className = "safe";
                }
            }
        }

    } catch (err) {
        console.error(err);
    }
});

// Admin commands to override heater/fan
async function sendCmd(cmd, val) {
    if (!writer) return;
    await writer.write(`${cmd},${val},\n`);
}
