document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("darkToggle");

    // load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
});




// Global variables
let expenses = [];
let currentFilter = 'all';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    initializeApp();
});




// Initialize the application
function initializeApp() {
    console.log('Setting up application...');
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
        console.log('Date input set to today');
    } else {
        console.error('Date input not found!');
    }
    
    // Load expenses
    loadExpenses();
    
    // Setup event listeners
    const form = document.getElementById('expenseForm');
    if (form) {
        form.addEventListener('submit', handleAddExpense);
        console.log('Form event listener added');
    } else {
        console.error('Form not found! Check if id="expenseForm" exists in HTML');
    }
    
    const filterSelect = document.getElementById('filterCategory');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilterChange);
        console.log('Filter event listener added');
    } else {
        console.error('Filter select not found!');
    }
}

// Load all expenses from the server
async function loadExpenses() {
    const res = await fetch("/api/expenses");
    const data = await res.json();

    let total = 0;
    document.getElementById("expensesList").innerHTML = "";

    data.forEach(e => {
        total += Number(e.amount);

        document.getElementById("expensesList").innerHTML += `
            <div class="expense-item">
                <b>${e.description}</b> — ₹${e.amount} (${e.category})
            </div>
        `;
    });

    document.getElementById("totalExpenses").innerText = `₹${total.toFixed(2)}`;
    document.getElementById("totalCount").innerText = data.length;
}

document.getElementById("expenseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const expense = {
        description: description.value,
        amount: amount.value,
        category: category.value,
        date: date.value
    };

    await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    });

    e.target.reset();
    loadExpenses();
});
document.addEventListener("DOMContentLoaded", loadExpenses);


// Handle form submission
async function handleAddExpense(e) {
    e.preventDefault();
    console.log('Form submitted!');
    
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    console.log('Form values:', { description, amount, category, date });
    
    const newExpense = {
        description,
        amount: parseFloat(amount),
        category,
        date
    };
    
    console.log('Sending expense to server:', newExpense);
    
    try {
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newExpense)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Server response:', result);
            alert('Expense added successfully!');
            document.getElementById('expenseForm').reset();
            document.getElementById('date').valueAsDate = new Date();
            loadExpenses();
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            alert('Error adding expense: ' + errorText);
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Error adding expense: ' + error.message);
    }
}

// Delete an expense
async function deleteExpense(id) {
    console.log('Deleting expense:', id);
    
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('Expense deleted successfully');
            alert('Expense deleted successfully!');
            loadExpenses();
        } else {
            console.error('Delete failed:', response.status);
            alert('Error deleting expense');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense: ' + error.message);
    }
}

// Handle filter change
function handleFilterChange(e) {
    currentFilter = e.target.value;
    console.log('Filter changed to:', currentFilter);
    renderExpenses();
}

// Render expenses list
function renderExpenses() {
    console.log('Rendering expenses...');
    const expensesList = document.getElementById('expensesList');
    
    if (!expensesList) {
        console.error('expensesList element not found!');
        return;
    }
    
    // Filter expenses
    let filteredExpenses = expenses;
    if (currentFilter !== 'all') {
        filteredExpenses = expenses.filter(e => e.category === currentFilter);
    }
    
    console.log('Filtered expenses count:', filteredExpenses.length);
    
    // Clear list
    expensesList.innerHTML = '';
    
    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No expenses found. Start tracking your spending!</p>
            </div>
        `;
        return;
    }
    
    // Render each expense
    filteredExpenses.forEach(expense => {
        const expenseElement = createExpenseElement(expense);
        expensesList.appendChild(expenseElement);
    });
    
    console.log('Rendered', filteredExpenses.length, 'expenses');
}

// Create expense element
function createExpenseElement(expense) {
    const div = document.createElement('div');
    div.className = 'expense-item';
    
    const formattedDate = formatDate(expense.date);
    const categoryClass = expense.category.toLowerCase().replace(/\s+/g, '-');
    
    div.innerHTML = `
        <span class="expense-category ${categoryClass}">${expense.category}</span>
        <div class="expense-details">
            <div class="expense-description">${expense.description}</div>
            <div class="expense-date">${formattedDate}</div>
        </div>
        <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
        <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
    `;
    
    return div;
}

// Update statistics
async function updateStatistics() {
    console.log('Updating statistics...');
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        console.log('Stats:', stats);
        
        const totalElement = document.getElementById('totalExpenses');
        const countElement = document.getElementById('totalCount');
        
        if (totalElement) {
            totalElement.textContent = `₹${stats.total.toFixed(2)}`;
        } else {
            console.error('totalExpenses element not found!');
        }
        
        if (countElement) {
            countElement.textContent = stats.count;
        } else {
            console.error('totalCount element not found!');
        }
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Update category chart
async function updateCategoryChart() {
    console.log('Updating category chart...');
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        const categoryChart = document.getElementById('categoryChart');
        
        if (!categoryChart) {
            console.error('categoryChart element not found!');
            return;
        }
        
        categoryChart.innerHTML = '';
        
        if (Object.keys(stats.categories).length === 0) {
            categoryChart.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
            return;
        }
        
        const maxAmount = Math.max(...Object.values(stats.categories));
        
        // Sort categories by amount
        const sortedCategories = Object.entries(stats.categories)
            .sort((a, b) => b[1] - a[1]);
        
        sortedCategories.forEach(([category, amount]) => {
            const percentage = (amount / maxAmount) * 100;
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-bar-container">
                    <div class="category-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="category-amount">₹${amount.toFixed(2)}</div>
            `;
            
            categoryChart.appendChild(categoryItem);
        });
        
        console.log('Category chart updated');
    } catch (error) {
        console.error('Error updating category chart:', error);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

console.log('Script loaded successfully!');

function formatINR(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙 Dark Mode';
    }
});
