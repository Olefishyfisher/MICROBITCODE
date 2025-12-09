let tempSpan = document.getElementById("temp");
let heaterSpan = document.getElementById("heater");
let fanSpan = document.getElementById("fan");
let statusSpan = document.getElementById("status");
let uartChar;

document.getElementById("connect").addEventListener("click", async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [0xFFE0]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(0xFFE0);
        uartChar = await service.getCharacteristic(0xFFE1);
        await uartChar.startNotifications();
        uartChar.addEventListener("characteristicvaluechanged", e => {
            const value = new TextDecoder().decode(e.target.value);
            const parts = value.trim().split(",");
            if (parts.length >= 4) {
                tempSpan.textContent = parts[0];
                heaterSpan.textContent = parts[1];
                fanSpan.textContent = parts[2];
                statusSpan.textContent = parts[3];
            }
        });
        // show admin panel
        document.getElementById("admin").style.display = "block";
    } catch(err) {
        console.error(err);
    }
});

function sendCmd(cmd, val) {
    if (!uartChar) return;
    const line = `${cmd},${val},`;
    uartChar.writeValue(new TextEncoder().encode(line));
}
