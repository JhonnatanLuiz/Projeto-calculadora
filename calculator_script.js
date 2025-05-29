// calculator_script.js

document.addEventListener('DOMContentLoaded', () => {
const display = document.getElementById('display');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.getElementById('equals');
const clearAllButton = document.getElementById('clear-all');
const clearEntryButton = document.getElementById('clear-entry');
const decimalButton = document.getElementById('decimal');

let currentOperand = '';
let previousOperand = '';
let operation = undefined;
let shouldResetDisplay = false;

function updateDisplay() {
    display.value = currentOperand || '0';
}

function appendNumber(number) {
    if (currentOperand === '0' && number !== '.') currentOperand = '';
    if (shouldResetDisplay && number !== '.') {
        currentOperand = '';
        shouldResetDisplay = false;
    }

    if (number === '.' && currentOperand.includes('.')) return;

    currentOperand = currentOperand.toString() + number.toString();
}

function chooseOperation(selectedOperation) {
    if (currentOperand === '' && previousOperand === '') return;
    if (currentOperand !== '' && previousOperand !== '' && operation) {
        operation = selectedOperation;
        return;
        }
        if (previousOperand !== '') {
        compute();
        }
        operation = selectedOperation;
        previousOperand = currentOperand;
        currentOperand = '';
        shouldResetDisplay = false;
    }

    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

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
                    alert("Não é possível dividir por zero!");
                    clearAllButton();
                    return;
                }
                computation = prev / current;
                break;
                default:
                    return;
        }
            currentOperand = parseFloat(computation.toFixed(10)).toString();
            operation = undefined;
            previousOperand = '';
            shouldResetDisplay = true;
        }
    
        function clearAll() {
            currentOperand = '0';
            previousOperand = '';
            operation = undefined;
            shouldResetDisplay = false;
            updateDisplay();
        }
    
        function clearEntry() {
            currentOperand = '';
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
    
        clearAll();
    });