// calculator_script.js

document.addEventListener('DOMContentLoaded', () => {
const display = document.getElementById('display');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.getElementById('equals');
const clearAllButton = document.getElementById('clear-all');
const clearEntryButton = document.getElementById('clear-entry');
const decimalButton = document.getElementById('decimal');
const historyDisplay = document.getElementById('history-display'); // Added for history
const powerButton = document.getElementById('powerButton'); // New
const sqrtButton = document.getElementById('sqrtButton'); // New
const percentButton = document.getElementById('percentButton'); // New

let calculationHistory = []; // Added for history
let currentOperand = '';
let previousOperand = '';
let operation = undefined;
let shouldResetDisplay = false;
let inErrorState = false; // To track if calculator is in an error state

// Centralized error display function
function displayError(message) {
    currentOperand = message;
    operation = undefined;
    previousOperand = '';
    shouldResetDisplay = true;
    inErrorState = true;
    updateDisplay();
}

// Function to update history display - Added for history
function updateHistoryDisplay() {
    if (!historyDisplay) return; // Guard clause if element not found
    historyDisplay.innerHTML = ''; // Clear current history
    // Display the last 5 entries, or fewer if not that many exist
    const start = Math.max(0, calculationHistory.length - 5);
    for (let i = start; i < calculationHistory.length; i++) {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = calculationHistory[i];
        historyDisplay.appendChild(entryDiv);
    }
    // Scroll to the bottom of the history display
    historyDisplay.scrollTop = historyDisplay.scrollHeight;
}

function updateDisplay() {
    display.value = currentOperand || '0';
}

function appendNumber(number) {
    if (currentOperand === '0' && number !== '.') currentOperand = '';
    if (inErrorState) {
        currentOperand = ''; // Clear error message
        inErrorState = false;
    }
    if (shouldResetDisplay && number !== '.') {
        currentOperand = '';
        shouldResetDisplay = false;
    }

    // If display shows '0' and a number is appended (not '.'), replace '0'
    if (currentOperand === '0' && number !== '.') {
        currentOperand = '';
    }
    
    if (number === '.' && currentOperand.includes('.')) return;

    currentOperand = currentOperand.toString() + number.toString();
}

function chooseOperation(selectedOperation) {
    if (inErrorState && selectedOperation !== 'clearAll' && selectedOperation !== 'clearEntry') { // Allow clear buttons to function
        return; // Don't allow operations if in error state, unless clearing
    }

    // Handle syntax error: operator pressed after another operator with no intermediate number
    // e.g. "5 * +". When '+' is chosen: currentOperand is '', previousOperand is '5', operation is '*'
    if (currentOperand === '' && operation && previousOperand !== '') {
        // Allow changing the operator if no new number has been input yet
        // However, per subtask, "5 * + 3" should be an error or prevented.
        // This implies that "5 * +" itself should be the point of error.
        displayError("Error: Syntax");
        return;
    }
    
    // If currentOperand is empty and it's the start of an expression (no previousOperand yet)
    if (currentOperand === '' && previousOperand === '') {
        if (selectedOperation === '-' || selectedOperation === '+') { // Allow starting with a sign
            currentOperand = selectedOperation;
            shouldResetDisplay = false; 
            inErrorState = false; // Not an error, just starting with a sign
            updateDisplay();
            return;
        }
        // Other operators ( *, / ) are invalid as first input without a number
        // Or if an operator is chosen but currentOperand is empty (e.g. after pressing an operator)
        // This case should ideally be caught by the (currentOperand === '' && operation && previousOperand !== '') above.
        // If we reach here with currentOperand === '', it's likely an invalid sequence.
        displayError("Error: Syntax");
        return;
    }


    if (currentOperand !== '' && previousOperand !== '' && operation) {
        // This case is for changing operator after a full expression is typed e.g. 3 + 4 then user presses *
        // The original code was: operation = selectedOperation; return;
        // This is fine, or we can compute then set new op. Let's stick to changing op.
        operation = selectedOperation;
        return;
    }
    
    // If there's a previous operand, and current one is filled, compute before setting new op.
    // Example: User types "3 + 4" then "*". We should compute "3+4" first.
    if (previousOperand !== '' && currentOperand !== '') {
       compute();
       if (inErrorState) return; // If compute resulted in an error, stop here.
    }

    // Standard operation choice:
    // This part is reached if:
    // 1. currentOperand has a number, previousOperand is empty (e.g. "5" then "*")
    // 2. compute() was just called, and currentOperand now holds the result.
    operation = selectedOperation;
    previousOperand = currentOperand;
    currentOperand = '';
    shouldResetDisplay = false;
    inErrorState = false; // Reset error state as we are proceeding with a valid operation start
}

    function compute() {
        if (inErrorState) return; // Don't compute if already in error state from elsewhere
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (isNaN(prev) || isNaN(current)) {
            // This can happen if user types "5 * =" or just "="
            // It's not necessarily an error to display, just do nothing.
            // However, if an operation is set, and one is NaN, it could be an implicit error.
            if (operation && (isNaN(prev) || isNaN(current))) {
                 displayError("Error: Incomplete"); // More specific error
                 return;
            }
            return; // Silently do nothing if not a clear error
        }

        const initialOperation = operation; // Store the operation before it's cleared
        const initialPrevOperand = previousOperand; // Store previous operand for history

        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    displayError("Error: Div by zero");
                    return;
                }
                computation = prev / current;
                break;
                default:
                    return;
        }
            const result = parseFloat(computation.toFixed(10)).toString();
            // Add to history - Added for history
            const historyEntry = `${initialPrevOperand} ${initialOperation} ${currentOperand} = ${result}`;
            calculationHistory.push(historyEntry);
            if (calculationHistory.length > 5) {
                calculationHistory.shift(); // Keep only the last 5 entries
            }
            updateHistoryDisplay(); // Update history display

            currentOperand = result;
            operation = undefined;
            previousOperand = '';
            shouldResetDisplay = true;
        }

// --- New functions for advanced operations ---

function handleUnaryOperation(opType) {
    if (inErrorState) return;
    if (currentOperand === '') {
        displayError("Error: Missing op"); // Missing operand for unary operation
        return;
    }
    const currentNum = parseFloat(currentOperand);
    if (isNaN(currentNum)) {
        displayError("Error: Invalid num"); // Current operand is not a valid number
        return;
    }

    let result;
    let historyEntryText = '';

    if (opType === 'sqrt') {
        if (currentNum < 0) {
            displayError("Error: Sqrt neg");
            return;
        }
        result = Math.sqrt(currentNum);
        historyEntryText = `√(${currentOperand}) = ${parseFloat(result.toFixed(10)).toString()}`;
    } else if (opType === 'power') {
        result = Math.pow(currentNum, 2);
        historyEntryText = `${currentOperand}² = ${parseFloat(result.toFixed(10)).toString()}`;
    } else {
        return; // Unknown operation
    }

    currentOperand = parseFloat(result.toFixed(10)).toString();
    calculationHistory.push(historyEntryText);
    if (calculationHistory.length > 5) {
        calculationHistory.shift();
    }
    updateHistoryDisplay();
    updateDisplay();
    shouldResetDisplay = true;
    previousOperand = ''; // Clear previous operand after a unary operation
    operation = undefined; // Clear operation after a unary operation
}

function handlePercentage() {
    if (inErrorState) return;
    if (currentOperand === '') {
        displayError("Error: Missing op");
        return;
    }
    const currentNum = parseFloat(currentOperand);
    if (isNaN(currentNum)) {
        displayError("Error: Invalid num");
        return;
    }

    let historyEntryText = '';

    if (previousOperand !== '' && operation) {
        // Case: 200 + 10% --> calculate 10% of 200, then add to 200
        const prevNum = parseFloat(previousOperand);
        if (isNaN(prevNum)) return;
        
        const percentageValue = prevNum * (currentNum / 100);
        historyEntryText = `${currentNum}% of ${previousOperand} = ${parseFloat(percentageValue.toFixed(10)).toString()}`;
        calculationHistory.push(historyEntryText);
        if (calculationHistory.length > 5) {
            calculationHistory.shift();
        }
        // updateHistoryDisplay(); // Display this intermediate step

        currentOperand = parseFloat(percentageValue.toFixed(10)).toString();
        // Now, compute the original operation with the percentage value
        compute(); 
        // compute() will add its own history entry like "200 + 20 = 220"
        // and update display & shouldResetDisplay.
    } else {
        // Case: 50% --> 0.5 (Unary)
        const result = currentNum / 100;
        historyEntryText = `Percent(${currentOperand}) = ${parseFloat(result.toFixed(10)).toString()}`;
        currentOperand = parseFloat(result.toFixed(10)).toString();
        
        calculationHistory.push(historyEntryText);
        if (calculationHistory.length > 5) {
            calculationHistory.shift();
        }
        updateHistoryDisplay();
        updateDisplay();
        shouldResetDisplay = true;
        previousOperand = ''; 
        operation = undefined;
    }
}
// --- End of new functions ---
    
        function clearAll() {
            currentOperand = '0';
            previousOperand = '';
            operation = undefined;
            shouldResetDisplay = false;
            inErrorState = false; // Clear error state
            calculationHistory = []; 
            updateHistoryDisplay(); 
            updateDisplay();
        }
    
        function clearEntry() {
            currentOperand = '0'; // Show '0' instead of blank
            shouldResetDisplay = false; // Allow immediate number input
            inErrorState = false; // Clear error state
            // Do not clear previousOperand or operation, CE usually just clears current entry.
            updateDisplay();
        }
    
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                appendNumber(button.dataset.number);
                updateDisplay();
            });
        });
    
        operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                chooseOperation(button.dataset.operator);
            });
        });
    
        equalsButton.addEventListener('click', () => {
            if (currentOperand !== '' && previousOperand !== '' && operation) {
                compute();
                updateDisplay();
            }
        });
    
        clearAllButton.addEventListener('click', () => {
            clearAll();
        });
    
        clearEntryButton.addEventListener('click', () => {
            clearEntry();
        });
    
        decimalButton.addEventListener('click', () => {
            appendNumber('.');
            updateDisplay();
        });

        // Event listeners for new buttons
        if (powerButton) {
            powerButton.addEventListener('click', () => handleUnaryOperation('power'));
        }
        if (sqrtButton) {
            sqrtButton.addEventListener('click', () => handleUnaryOperation('sqrt'));
        }
        if (percentButton) {
            percentButton.addEventListener('click', handlePercentage);
        }
    
        clearAll(); // Initialize display

        // Keyboard support
        function handleKeyPress(event) {
            const key = event.key;

            // Allow Escape and Backspace to work even in error state for clearing
            if (key === 'Escape') {
                clearAll();
                return;
            }
            if (key === 'Backspace') { 
                clearEntry(); // Or specific backspace logic if currentOperand is not an error
                return;
            }

            // Prevent most key actions if in error state
            if (inErrorState) {
                // Allow number keys to start fresh
                if (!isNaN(parseInt(key)) || key === '.') {
                     appendNumber(key); // appendNumber now handles clearing error state
                     updateDisplay();
                }
                return; 
            }

            if (!isNaN(parseInt(key))) { // Numbers 0-9
                appendNumber(key);
                updateDisplay();
            } else if (key === '+' || key === '-' || key === '*' || key === '/') { // Operators
                chooseOperation(key);
                // chooseOperation now calls updateDisplay if it sets an error or changes currentOperand (e.g. for unary +/-)
            } else if (key === 'Enter' || key === '=') { // Equals
                event.preventDefault(); 
                // compute calls displayError or updateDisplay
                if (previousOperand !== '' && operation) { // Check if there's enough to compute
                    compute();
                }
            } else if (key === '.') { // Decimal point
                appendNumber('.');
                updateDisplay();
            } else if (key === '%') { // Percentage key
                handlePercentage(); // handlePercentage calls displayError or updateDisplay
            }
        }

        document.addEventListener('keydown', handleKeyPress);
    });