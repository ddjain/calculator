let doughnutChart; 

const principalInput = document.getElementById('principal');
const rateInput = document.getElementById('rate');
const yearsInput = document.getElementById('years');
const saveButton = document.getElementById('saveBtn');
const historyButton = document.getElementById('historyBtn');
const historySection = document.getElementById('historySection');

// Display fields
const investedDisplay = document.getElementById('investedDisplay');
const returnDisplay = document.getElementById('returnDisplay');
const totalDisplay = document.getElementById('totalDisplay');

// Add event listeners to update the calculation when values change
principalInput.addEventListener('input', calculateAndUpdate);
rateInput.addEventListener('input', calculateAndUpdate);
yearsInput.addEventListener('input', calculateAndUpdate);
saveButton.addEventListener('click', saveCalculation);
historyButton.addEventListener('click', toggleHistorySection);

// Add event listeners to sliders
document.getElementById('principalSlider').addEventListener('input', syncPrincipal);
document.getElementById('rateSlider').addEventListener('input', syncRate);
document.getElementById('yearsSlider').addEventListener('input', syncYears);

// Sync the slider and input fields
function syncPrincipal(e) {
    principalInput.value = e.target.value;
    calculateAndUpdate();
}

function syncRate(e) {
    rateInput.value = e.target.value;
    calculateAndUpdate();
}

function syncYears(e) {
    yearsInput.value = e.target.value;
    calculateAndUpdate();
}

// Trigger calculation with default values
calculateAndUpdate();

function calculateAndUpdate() {
    const principal = parseFloat(principalInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseInt(yearsInput.value);
    const rateDecimal = rate / 100;

    let totalAmount = principal;
    let totalInterestEarned = 0;
    let yearWiseBreakdown = [];

    for (let i = 1; i <= years; i++) {
        let interestEarned = totalAmount * rateDecimal;
        totalInterestEarned += interestEarned;
        totalAmount += interestEarned;

        yearWiseBreakdown.push({
            year: i,
            totalAmount: totalAmount.toFixed(2),
            interestEarned: interestEarned.toFixed(2)
        });
    }

    // Update Doughnut Chart
    updateDoughnutChart(principal, totalInterestEarned, totalAmount);

    // Populate table
    populateTable(yearWiseBreakdown);

    // Animate the text change
    animateNumberChange(investedDisplay, principal);
    animateNumberChange(returnDisplay, totalInterestEarned);
    animateNumberChange(totalDisplay, totalAmount);
}

function updateDoughnutChart(invested, interestEarned, totalAmount) {
    const ctx = document.getElementById('resultChart').getContext('2d');

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Amount Invested', 'Interest Received'],
            datasets: [{
                data: [invested, interestEarned],
                backgroundColor: ['#4CAF50', '#FF5733'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            cutout: '70%', 
            animation: {
                animateRotate: true,
                animateScale: true
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            let label = tooltipItem.label || '';
                            if (label) {
                                label += ': ₹';
                            }
                            label += tooltipItem.raw.toFixed(2);
                            return label;
                        }
                    }
                },
                centerText: {
                    display: true,
                    text: `₹${totalAmount.toFixed(2)}`,
                }
            },
        },
        plugins: [{
            id: 'centerText',
            afterDraw: function(chart) {
                if (chart.config.options.plugins.centerText.display !== null &&
                    typeof chart.config.options.plugins.centerText.text !== 'undefined') {
                    const ctx = chart.ctx;
                    const width = chart.width;
                    const height = chart.height;
                    ctx.restore();

                    const fontSize = (height / 190).toFixed(2);
                    ctx.font = `${fontSize}em sans-serif`;
                    ctx.textBaseline = 'middle';

                    const text = chart.config.options.plugins.centerText.text;
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = (height / 2) + 30;

                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }
        }]
    });
}

function populateTable(data) {
    const tableBody = document.querySelector('#breakdownTable tbody');
    tableBody.innerHTML = '';  // Clear previous data

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.year}</td>
            <td>₹${row.totalAmount}</td>
            <td>₹${row.interestEarned}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Function to animate number change
function animateNumberChange(element, value) {
    const startValue = parseFloat(element.innerText.replace('₹', '')) || 0;
    const endValue = value;
    const duration = 500;  // Animation duration in milliseconds
    const startTime = performance.now();

    function updateNumber(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = startValue + (endValue - startValue) * progress;
        element.innerText = currentValue.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// Function to save the calculation into localStorage
function saveCalculation() {
    const principal = parseFloat(principalInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseInt(yearsInput.value);
    const totalAmount = (principal * Math.pow(1 + rate / 100, years)).toFixed(2);
    const totalInterest = (totalAmount - principal).toFixed(2);

    const history = JSON.parse(localStorage.getItem('history')) || [];
    const timestamp = new Date().toLocaleString();

    history.push({ timestamp, principal, rate, years, totalInvestment: principal, totalReturn: totalAmount, interestEarned: totalInterest });
    localStorage.setItem('history', JSON.stringify(history));

    alert('Calculation saved!');
}

// Function to toggle visibility of the history section
function toggleHistorySection() {
    if (historySection.classList.contains('hidden')) {
        historySection.classList.remove('hidden');
        populateHistoryTable();
    } else {
        historySection.classList.add('hidden');
    }
}

// Function to populate the history table
function populateHistoryTable() {
    const historyTableBody = document.querySelector('#historyTable tbody');
    historyTableBody.innerHTML = '';  // Clear previous data
    const history = JSON.parse(localStorage.getItem('history')) || [];

    history.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.timestamp}</td>
            <td>₹${row.principal}</td>
            <td>${row.rate}%</td>
            <td>${row.years}</td>
            <td>₹${row.totalInvestment}</td>
            <td>₹${row.totalReturn}</td>
            <td>₹${row.interestEarned}</td>
        `;
        historyTableBody.appendChild(tr);
    });
}
