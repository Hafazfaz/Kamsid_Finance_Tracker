 // Initial sample transaction data
 const initialTransactionsData = {
    consulting: [
        { id: 1, description: "Client A Payment", amount: 15000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Consultant Fees", amount: -5000, type: "outflow", date: "2025-04-02" },
        { id: 3, description: "Client B Payment", amount: 20000, type: "inflow", date: "2025-04-03" },
    ],
    software: [
        { id: 1, description: "License Renewal", amount: -2000, type: "outflow", date: "2025-04-01" },
        { id: 2, description: "Project X Delivery", amount: 30000, type: "inflow", date: "2025-04-02" },
    ],
    marketing: [
        { id: 1, description: "Ad Campaign", amount: -10000, type: "outflow", date: "2025-04-01" },
        { id: 2, description: "Client Sponsorship", amount: 5000, type: "inflow", date: "2025-04-02" },
    ],
    'human-resources': [
        { id: 1, description: "Staff Training", amount: -8000, type: "outflow", date: "2025-04-01" },
        { id: 2, description: "Recruitment Bonus", amount: 12000, type: "inflow", date: "2025-04-02" },
    ],
    sales: [
        { id: 1, description: "Product Sale", amount: 25000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Sales Commission", amount: -6000, type: "outflow", date: "2025-04-02" },
    ],
    'customer-support': [
        { id: 1, description: "Support Contract", amount: 10000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Call Center Costs", amount: -4000, type: "outflow", date: "2025-04-02" },
    ],
    'research-development': [
        { id: 1, description: "R&D Grant", amount: 20000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Equipment Purchase", amount: -15000, type: "outflow", date: "2025-04-02" },
    ],
    operations: [
        { id: 1, description: "Logistics Contract", amount: 18000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Warehouse Rent", amount: -7000, type: "outflow", date: "2025-04-02" },
    ],
    finance: [
        { id: 1, description: "Investment Income", amount: 22000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Audit Fees", amount: -9000, type: "outflow", date: "2025-04-02" },
    ],
    legal: [
        { id: 1, description: "Legal Settlement", amount: 15000, type: "inflow", date: "2025-04-01" },
        { id: 2, description: "Attorney Fees", amount: -10000, type: "outflow", date: "2025-04-02" },
    ]
};

// Load transactions from localStorage or use initial data
let transactionsData = JSON.parse(localStorage.getItem('transactionsData')) || initialTransactionsData;

const ITEMS_PER_PAGE = 3;
const availableBalanceEl = document.getElementById('available-balance');
const moneySpentEl = document.getElementById('money-spent');
const modal = document.getElementById('add-transaction-modal');
const transactionForm = document.getElementById('transaction-form');
const cancelModalBtn = document.getElementById('cancel-modal');
let currentService = null;

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactionsData', JSON.stringify(transactionsData));
}

// Calculate and update balances
function updateBalances() {
    let totalAvailable = 0;
    let totalSpent = 0;

    Object.values(transactionsData).flat().forEach(t => {
        if (t.type === 'inflow') {
            totalAvailable += Math.abs(t.amount);
        } else {
            totalAvailable -= Math.abs(t.amount);
            totalSpent += Math.abs(t.amount);
        }
    });

    availableBalanceEl.textContent = totalAvailable.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
    moneySpentEl.textContent = totalSpent.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
}

// Initialize each service section
document.querySelectorAll('.service-section').forEach(section => {
    const service = section.querySelector('.transaction-history').dataset.service;
    const history = section.querySelector('.transaction-history');
    const transactionList = section.querySelector('.transaction-list');
    const pagination = section.querySelector('.pagination');
    const searchBar = section.querySelector('.search-bar');
    const sortBy = section.querySelector('.sort-by');
    const filterType = section.querySelector('.filter-type');
    const exportCsvBtn = section.querySelector('.export-csv');
    const exportPdfBtn = section.querySelector('.export-pdf');
    const addTransactionBtn = section.querySelector('.add-transaction-btn');
    let currentPage = 1;
    let currentTransactions = transactionsData[service] ? [...transactionsData[service]] : [];

    // Toggle history visibility
    section.querySelector('h3').addEventListener('click', () => {
        history.classList.toggle('active');
    });

    // Open modal for adding transaction
    addTransactionBtn.addEventListener('click', () => {
        currentService = service;
        modal.classList.add('active');
        transactionForm.reset();
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
    });

    // Render transactions
    function renderTransactions(page = 1) {
        transactionList.innerHTML = '';
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedTransactions = currentTransactions.slice(start, end);

        paginatedTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.classList.add('transaction-item', transaction.type);
            li.innerHTML = `
                <span>${transaction.description}</span>
                <span>${transaction.type === 'inflow' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</span>
                <span>${transaction.date}</span>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            `;
            transactionList.appendChild(li);
        });

        // Add delete event listeners
        transactionList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                transactionsData[service] = transactionsData[service].filter(t => t.id !== id);
                currentTransactions = currentTransactions.filter(t => t.id !== id);
                saveTransactions(); // Save to localStorage
                renderTransactions(currentPage);
                updateBalances();
            });
        });

        renderPagination();
    }

    // Render pagination
    function renderPagination() {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(currentTransactions.length / ITEMS_PER_PAGE);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => {
                currentPage = i;
                renderTransactions(i);
            });
            pagination.appendChild(btn);
        }
    }

    // Filter and sort transactions
    function updateTransactions() {
        let filtered = transactionsData[service] ? [...transactionsData[service]] : [];

        // Search
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => t.description.toLowerCase().includes(searchTerm));
        }

        // Filter by type
        const type = filterType.value;
        if (type !== 'all') {
            filtered = filtered.filter(t => t.type === type);
        }

        // Sort
        const [sortField, sortOrder] = sortBy.value.split('-');
        filtered.sort((a, b) => {
            if (sortField === 'date') {
                return sortOrder === 'asc' 
                    ? new Date(a.date) - new Date(b.date) 
                    : new Date(b.date) - new Date(a.date);
            } else {
                return sortOrder === 'asc' 
                    ? Math.abs(a.amount) - Math.abs(b.amount) 
                    : Math.abs(b.amount) - Math.abs(a.amount);
            }
        });

        currentTransactions = filtered;
        currentPage = 1;
        renderTransactions(1);
    }

    // Event listeners for controls
    searchBar.addEventListener('input', updateTransactions);
    sortBy.addEventListener('change', updateTransactions);
    filterType.addEventListener('change', updateTransactions);

    // Export CSV
    exportCsvBtn.addEventListener('click', () => {
        const headers = ['ID,Description,Amount,Type,Date'];
        const rows = currentTransactions.map(t => 
            `${t.id},"${t.description}",${t.amount},${t.type},${t.date}`
        );
        const csv = headers.concat(rows).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${service}-transactions.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Export PDF
    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ')} Transactions`, 10, 10);
        doc.setFontSize(12);
        let y = 20;
        currentTransactions.forEach(t => {
            doc.text(`${t.date} | ${t.description} | ${t.type === 'inflow' ? '+' : ''}${Math.abs(t.amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} | ${t.type}`, 10, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });
        doc.save(`${service}-transactions.pdf`);
    });

    // Initial render
    renderTransactions();
});

// Modal handling
cancelModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const date = document.getElementById('transaction-date').value;

    // Generate new ID
    if (!transactionsData[currentService]) {
        transactionsData[currentService] = [];
    }
    const ids = transactionsData[currentService].map(t => t.id);
    const newId = ids.length ? Math.max(...ids) + 1 : 1;

    // Add transaction
    transactionsData[currentService].push({
        id: newId,
        description,
        amount: type === 'inflow' ? amount : -amount,
        type,
        date
    });

    // Save to localStorage
    saveTransactions();

    // Update UI
    modal.classList.remove('active');
    updateBalances();
    document.querySelector(`[data-service="${currentService}"] .transaction-history`).classList.add('active');
    document.querySelector(`[data-service="${currentService}"] .sort-by`).dispatchEvent(new Event('change')); // Trigger re-render
});

// Initial balance calculation
updateBalances();