const API_URL = 'http://localhost:3000/api';

// Load dashboard data
async function loadDashboardData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            window.location.href = '/';
            return;
        }

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Load budget overview
        const budgetResponse = await fetch(`${API_URL}/budget/overview/${user.id}/${month}/${year}`);
        if (!budgetResponse.ok) {
            const errorData = await budgetResponse.json();
            throw new Error(errorData.error || 'Failed to fetch budget data');
        }
        const budgetData = await budgetResponse.json();
        if (budgetData.success) {
            updateBudgetOverview(budgetData.overview);
        }

        // Load recent transactions
        const transactionsResponse = await fetch(`${API_URL}/transaction/recent/${user.id}?limit=5`);
        if (!transactionsResponse.ok) {
            const errorData = await transactionsResponse.json();
            throw new Error(errorData.error || 'Failed to fetch transactions');
        }
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.success) {
            updateRecentTransactions(transactionsData.transactions);
        }

        // Load analytics (using monthly transaction overview for now)
        const analysisResponse = await fetch(`${API_URL}/transaction/monthly/${user.id}/${month}/${year}`);
        if (!analysisResponse.ok) {
             // Try reading as text if JSON parsing fails (e.g., if HTML is returned)
             const errorText = await analysisResponse.text();
             // console.error('Analytics fetch error response:', errorText);
             throw new Error('Failed to fetch analytics: Invalid response from server.');
        }

        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
            // Assuming analysisData.overview contains the necessary data for updateAnalytics
            // The structure might need adjustment based on the actual /api/transaction/monthly response
            updateAnalytics(analysisData.overview, budgetData.overview); // Pass budgetData.overview as well if needed by updateAnalytics
        } else {
             throw new Error(analysisData.error || 'Failed to fetch analytics');
        }

    } catch (error) {
        // console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data: ' + error.message);
    }
}

// Update budget overview
function updateBudgetOverview(overview) {
    document.getElementById('totalBudget').textContent = `$${overview.totalBudget.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${overview.totalExpenses.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `$${overview.totalIncome.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${overview.balance.toFixed(2)}`;
}

// Update recent transactions
function updateRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    container.innerHTML = '';

    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            <span class="transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </span>
        `;
        container.appendChild(item);
    });
}

// Store chart instances
let monthlyChart = null;
let categoriesChart = null;
let comparisonChart = null;
let progressChart = null;

// Update analytics charts
function updateAnalytics(analysis, overview) {
    // Monthly Overview Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: analysis.monthlyLabels,
            datasets: [
                {
                    label: 'Income',
                    data: analysis.monthlyIncome,
                    borderColor: '#4CAF50',
                    fill: false
                },
                {
                    label: 'Expenses',
                    data: analysis.monthlyExpenses,
                    borderColor: '#F44336',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Expense Categories Chart
    const categoriesCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoriesChart) {
        categoriesChart.destroy();
    }
    categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: analysis.categoryLabels,
            datasets: [{
                data: analysis.categoryAmounts,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Income vs Expenses Chart
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [overview.totalIncome, overview.totalExpenses],
                backgroundColor: ['#4CAF50', '#F44336']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Budget Progress Chart
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    if (progressChart) {
        progressChart.destroy();
    }
    progressChart = new Chart(progressCtx, {
        type: 'bar',
        data: {
            labels: analysis.budgetCategories,
            datasets: [{
                label: 'Budget',
                data: analysis.budgetAmounts,
                backgroundColor: '#2196F3'
            }, {
                label: 'Spent',
                data: analysis.spentAmounts,
                backgroundColor: '#FF9800'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Handle form submissions
async function handleFormSubmit(formId, data) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            window.location.href = '/';
            return false;
        }

        let endpoint = '';
        let method = 'POST';

        // Include userId in the data payload
        data.userId = user.id;

        switch (formId) {
            case 'budgetForm':
                endpoint = `${API_URL}/budget`;
                break;
            case 'expenseForm':
                endpoint = `${API_URL}/transaction`;
                data.type = 'expense';
                break;
            case 'incomeForm':
                endpoint = `${API_URL}/transaction`;
                data.type = 'income';
                break;
            default:
                throw new Error('Invalid form type');
        }

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'//,
                // 'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Operation failed');
        }

        // Reload dashboard data
        await loadDashboardData();
        return true;
    } catch (error) {
        // console.error('Error submitting form:', error);
        alert(error.message);
        return false;
    }
}

// Modal handling
const modal = document.getElementById('addItemModal');
const modalTitle = document.getElementById('modalTitle');
const addItemForm = document.getElementById('addItemForm');
const closeBtn = document.querySelector('.close');

// Show modal
function showModal(title) {
    modalTitle.textContent = title;
    modal.classList.remove('hidden');
    addItemForm.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('itemDate').value = today;
}

// Hide modal
function hideModal() {
    modal.classList.add('hidden');
    addItemForm.reset();
}

// Close modal when clicking the X
closeBtn.addEventListener('click', hideModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Add Budget button click handler
document.getElementById('addBudgetBtn').addEventListener('click', () => {
    showModal('Add Budget');
    addItemForm.onsubmit = async (e) => {
        e.preventDefault();

        const data = {
            category: document.getElementById('itemCategory').value,
            amount: parseFloat(document.getElementById('itemAmount').value),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        };

        const success = await handleFormSubmit('budgetForm', data);
        if (success) {
            hideModal();
        }
    };
});

// Add Expense button click handler
document.getElementById('addExpenseBtn').addEventListener('click', () => {
    showModal('Add Expense');
    addItemForm.onsubmit = async (e) => {
        e.preventDefault();

        const data = {
            type: 'expense',
            category: document.getElementById('itemCategory').value,
            amount: parseFloat(document.getElementById('itemAmount').value),
            description: document.getElementById('itemDescription').value,
            date: document.getElementById('itemDate').value
        };

        const success = await handleFormSubmit('expenseForm', data);
        if (success) {
            hideModal();
        }
    };
});

// Add Income button click handler
document.getElementById('addIncomeBtn').addEventListener('click', () => {
    showModal('Add Income');
    addItemForm.onsubmit = async (e) => {
        e.preventDefault();

        const data = {
            type: 'income',
            category: document.getElementById('itemCategory').value,
            amount: parseFloat(document.getElementById('itemAmount').value),
            description: document.getElementById('itemDescription').value,
            date: document.getElementById('itemDate').value
        };

        const success = await handleFormSubmit('incomeForm', data);
        if (success) {
            hideModal();
        }
    };
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // const user = JSON.parse(localStorage.getItem('user'));
    // if (!user || !user.token) {
    //     window.location.href = '/';
    //     return;
    // }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        document.getElementById('username').textContent = user.username;
        document.getElementById('email').textContent = user.email; // Assuming email is also available and desired
    } else {
        document.getElementById('username').textContent = 'Guest';
        document.getElementById('email').textContent = '';
        // Redirect to login if no user is found in localStorage
        window.location.href = '/';
        return;
    }

    loadDashboardData();

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Logout handling (simplified)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // For simplicity, just redirect to home page
            window.location.href = '/';
        });
    }
}); 