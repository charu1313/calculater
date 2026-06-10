const display = document.getElementById("display");

function append(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = "";
}

async function calculate() {

    const expression = display.value;

    const response = await fetch(
        "http://localhost:5000/calculate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expression
            })
        }
    );

    const data = await response.json();

    display.value = data.result;
}