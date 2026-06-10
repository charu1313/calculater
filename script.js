const display = document.getElementById("display");
const expressionPreview = document.getElementById("expression-preview");
const historyList = document.getElementById("history-list");
const statusIndicator = document.getElementById("status-indicator");
const displayContainer = document.querySelector(".display-container");

let isResultDisplayed = false;

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    fetchHistory();
    setupKeyboardListeners();
});

function append(value) {
    // If an error or result is displayed, handle replacement vs appending
    if (isResultDisplayed) {
        if (display.value === "Error") {
            display.value = "";
        }
        
        // If it's an operator, allow chaining. Otherwise clear display.
        const isOperator = ["+", "-", "*", "/", "."].includes(value);
        if (!isOperator) {
            display.value = "";
        }
        isResultDisplayed = false;
    }
    
    // Avoid leading multiple operators or invalid decimals if possible on client side
    display.value += value;
    
    // Auto-scroll display to the right if text overflows
    display.scrollLeft = display.scrollWidth;
}

function clearDisplay() {
    display.value = "";
    expressionPreview.textContent = "";
    isResultDisplayed = false;
    clearErrorStyle();
}

function backspace() {
    if (isResultDisplayed) {
        if (display.value === "Error") {
            display.value = "";
        }
        isResultDisplayed = false;
        return;
    }
    display.value = display.value.slice(0, -1);
}

async function calculate() {
    const expression = display.value.trim();
    if (!expression) return;

    try {
        const response = await fetch(
            "http://localhost:5000/calculate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ expression })
            }
        );

        if (!response.ok) {
            throw new Error("Invalid expression");
        }

        const data = await response.json();
        
        // Update display and preview
        expressionPreview.textContent = `${expression} =`;
        display.value = data.result;
        isResultDisplayed = true;
        
        // Refresh calculation history
        await fetchHistory();
    } catch (error) {
        handleCalculationError();
    }
}

function handleCalculationError() {
    display.value = "Error";
    expressionPreview.textContent = "";
    isResultDisplayed = true;
    
    // Add visual error feedback (shake + red outline)
    displayContainer.classList.add("display-error", "shake");
    
    // Remove classes after animation completes
    setTimeout(() => {
        displayContainer.classList.remove("shake");
    }, 400);
    
    // Keep error background until next input
    display.addEventListener("input", clearErrorStyle, { once: true });
    // Also clear style when clicking any button
    document.querySelectorAll(".btn").forEach(btn => {
        btn.addEventListener("click", clearErrorStyle, { once: true });
    });
}

function clearErrorStyle() {
    displayContainer.classList.remove("display-error");
}

async function fetchHistory() {
    try {
        const response = await fetch("http://localhost:5000/history");
        if (!response.ok) throw new Error();
        
        const history = await response.json();
        renderHistory(history);
        updateStatus(true, history);
    } catch (error) {
        console.error("Failed to load history:", error);
        updateStatus(false);
    }
}

function renderHistory(history) {
    historyList.innerHTML = "";
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<div class="history-placeholder">No history yet</div>';
        return;
    }
    
    history.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.title = "Click to load expression";
        
        // Clean expression for displaying (replace * with × and / with ÷)
        const displayExpr = item.expression
            .replace(/\*/g, " × ")
            .replace(/\//g, " ÷ ")
            .replace(/\+/g, " + ")
            .replace(/\-/g, " - ");
            
        div.innerHTML = `
            <div class="history-expr">${displayExpr}</div>
            <div class="history-res">${item.result}</div>
        `;
        
        // Clicking history loads the expression back to the display
        div.addEventListener("click", () => {
            display.value = item.expression;
            expressionPreview.textContent = "";
            isResultDisplayed = false;
            clearErrorStyle();
        });
        
        historyList.appendChild(div);
    });
}

async function clearHistory() {
    try {
        const response = await fetch("http://localhost:5000/history", {
            method: "DELETE"
        });
        if (response.ok) {
            fetchHistory();
        }
    } catch (error) {
        console.error("Failed to clear history:", error);
    }
}

function updateStatus(isOnline, history = []) {
    if (!isOnline) {
        statusIndicator.textContent = "Offline";
        statusIndicator.classList.remove("connected");
        return;
    }
    
    // Check if MongoDB is used (we check if items contain a MongoDB _id field)
    const isDb = history.some(item => item._id !== undefined);
    
    if (isDb) {
        statusIndicator.textContent = "Cloud Sync";
        statusIndicator.classList.add("connected");
    } else {
        statusIndicator.textContent = "Local Memory";
        statusIndicator.classList.remove("connected");
    }
}

function setupKeyboardListeners() {
    document.addEventListener("keydown", (event) => {
        const key = event.key;
        
        // Numbers and standard math operators
        if (/^[0-9\.\+\-\*\/\(\)]$/.test(key)) {
            event.preventDefault();
            append(key);
        } 
        // Enter or equals calculates
        else if (key === "Enter" || key === "=") {
            event.preventDefault();
            calculate();
        } 
        // Backspace deletes last character
        else if (key === "Backspace") {
            event.preventDefault();
            backspace();
        } 
        // Escape clears
        else if (key === "Escape") {
            event.preventDefault();
            clearDisplay();
        }
    });
}