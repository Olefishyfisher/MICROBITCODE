let tempSpan = document.getElementById("temp");
let heaterSpan = document.getElementById("heater");
let fanSpan = document.getElementById("fan");

document.getElementById("connect").addEventListener("click", async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [0xFFE0]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(0xFFE0);
        const characteristic = await service.getCharacteristic(0xFFE1);

        await characteristic.startNotifications();
        characteristic.addEventListener("characteristicvaluechanged", e => {
            const value = new TextDecoder().decode(e.target.value);
            const parts = value.trim().split(",");
            if (parts.length >= 3) {
                tempSpan.textContent = parts[0];
                heaterSpan.textContent = parts[1];
                fanSpan.textContent = parts[2];
            }
        });
    } catch(err) {
        console.error(err);
    }
});
