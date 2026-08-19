// ===============================
// EXPENSE TRACKER
// STEP 3 - TRANSACTION FUNCTIONALITY
// ===============================


// ===============================
// DOM ELEMENTS
// ===============================

const openModalBtn = document.getElementById("openModalBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const transactionForm = document.getElementById("transactionForm");

const expenseTypeBtn = document.getElementById("expenseTypeBtn");
const incomeTypeBtn = document.getElementById("incomeTypeBtn");

const transactionTitle = document.getElementById("transactionTitle");
const transactionAmount = document.getElementById("transactionAmount");
const transactionCategory = document.getElementById("transactionCategory");
const transactionDate = document.getElementById("transactionDate");

const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const transactionBadge = document.getElementById("transactionBadge");
const logoutBtn = document.getElementById("logoutBtn");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const chartTotal = document.getElementById("chartTotal");
const transactionCount = document.getElementById("transactionCount");
const monthlyExpense = document.getElementById("monthlyExpense");
const averageExpense = document.getElementById("averageExpense");

const categoryAmountElements = {
    food: document.getElementById("foodAmount"),
    transport: document.getElementById("transportAmount"),
    shopping: document.getElementById("shoppingAmount"),
    bills: document.getElementById("billsAmount")
};

const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const otpForm = document.getElementById("otpForm");
const phoneNumber = document.getElementById("phoneNumber");
const otpInput = document.getElementById("otpInput");
const otpHint = document.getElementById("otpHint");
const loginError = document.getElementById("loginError");
const backLoginBtn = document.getElementById("backLoginBtn");


// ===============================
// APPLICATION DATA
// ===============================

let transactions = JSON.parse(
    localStorage.getItem("expenseTrackerTransactions") || "[]"
);

let currentType = "expense";

let pendingPhoneNumber = "";

const registeredPhoneNumber =
    localStorage.getItem("expenseTrackerUser");


// ===============================
// PHONE LOGIN
// ===============================

function showLoginError(message) {
    loginError.textContent = message;
}


loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const digits = phoneNumber.value.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(digits)) {
        showLoginError("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    if (registeredPhoneNumber && digits !== registeredPhoneNumber) {
        showLoginError("Only the registered mobile number can be used.");
        return;
    }

    pendingPhoneNumber = digits;
    loginForm.hidden = true;
    otpForm.hidden = false;
    otpHint.textContent = "Demo OTP: 123456";
    showLoginError("");
    otpInput.focus();

});


otpForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (otpInput.value.trim() !== "123456") {
        showLoginError("That code is not correct. Try 123456 for this demo.");
        return;
    }

    localStorage.setItem("expenseTrackerUser", pendingPhoneNumber);
    sessionStorage.setItem("expenseTrackerLoggedIn", pendingPhoneNumber);
    loginOverlay.classList.remove("active");
    showLoginError("");

});


backLoginBtn.addEventListener("click", function () {
    otpForm.hidden = true;
    loginForm.hidden = false;
    otpInput.value = "";
    showLoginError("");
    phoneNumber.focus();
});


logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem("expenseTrackerLoggedIn");
    loginForm.reset();
    otpForm.reset();
    otpForm.hidden = true;
    loginForm.hidden = false;
    loginOverlay.classList.add("active");
    showLoginError("");
    phoneNumber.focus();
});


if (
    registeredPhoneNumber &&
    sessionStorage.getItem("expenseTrackerLoggedIn") === registeredPhoneNumber
) {
    loginOverlay.classList.remove("active");
}


// ===============================
// OPEN MODAL
// ===============================

function openModal() {
    modalOverlay.classList.add("active");

    transactionTitle.focus();
}


// ===============================
// CLOSE MODAL
// ===============================

function closeModal() {
    modalOverlay.classList.remove("active");

    transactionForm.reset();

    currentType = "expense";

    expenseTypeBtn.classList.add("active");
    incomeTypeBtn.classList.remove("active");
}


// ===============================
// BUTTON EVENTS
// ===============================

openModalBtn.addEventListener("click", openModal);

emptyAddBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelModalBtn.addEventListener("click", closeModal);


// ===============================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ===============================

modalOverlay.addEventListener("click", function (event) {

    if (event.target === modalOverlay) {
        closeModal();
    }

});


// ===============================
// CLOSE MODAL WITH ESC KEY
// ===============================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeModal();
    }

});


// ===============================
// TRANSACTION TYPE
// ===============================

document.querySelectorAll(".type-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        currentType = button.dataset.type;

        document.querySelectorAll(".type-btn").forEach(function (typeButton) {
            typeButton.classList.toggle("active", typeButton === button);
        });

    });

});


// ===============================
// FORM SUBMISSION
// ===============================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Get form values

    const title = String(transactionTitle.value || "").trim();

    const amount = Number(transactionAmount.value);

    const category = transactionCategory.value;

    const date = transactionDate.value;


    // ===============================
    // BASIC VALIDATION
    // ===============================

    if (!title) {
        alert("Please enter a transaction name.");
        return;
    }


    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }


    if (!category) {
        alert("Please select a category.");
        return;
    }


    if (!date) {
        alert("Please select a date.");
        return;
    }


    // ===============================
    // CREATE TRANSACTION
    // ===============================

    const transaction = {

        id: Date.now(),

        title: title,

        amount: amount,

        category: category,

        date: date,

        type: currentType

    };


    // Add transaction to array

    transactions.push(transaction);
    localStorage.setItem(
        "expenseTrackerTransactions",
        JSON.stringify(transactions)
    );


    // Display transaction

    renderTransactions();


    // Close modal

    closeModal();


    // Show success message

    alert("Transaction added successfully!");

});


// ===============================
// RENDER TRANSACTIONS
// ===============================

function renderTransactions() {

    updateSummary();

    transactionBadge.textContent =
        `${transactions.length} ${transactions.length === 1 ? "Transaction" : "Transactions"}`;

    // Remove existing transaction elements

    const existingTransactions =
        transactionList.querySelectorAll(".transaction-item");

    existingTransactions.forEach(function (item) {
        item.remove();
    });


    // Show empty state if there are no transactions

    if (transactions.length === 0) {

        emptyState.style.display = "flex";

        return;

    }


    // Hide empty state

    emptyState.style.display = "none";


    // Display newest transactions first

    const sortedTransactions = [...transactions].reverse();


    sortedTransactions.forEach(function (transaction) {

        const transactionElement =
            createTransactionElement(transaction);

        transactionList.appendChild(transactionElement);

    });

}


// ===============================
// UPDATE CALCULATIONS
// ===============================

function updateSummary() {

    const income = transactions
        .filter(function (transaction) {
            return transaction.type === "income";
        })
        .reduce(function (total, transaction) {
            return total + transaction.amount;
        }, 0);

    const expenses = transactions
        .filter(function (transaction) {
            return transaction.type === "expense";
        });

    const expenseTotal = expenses.reduce(function (total, transaction) {
        return total + transaction.amount;
    }, 0);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpense = expenses
        .filter(function (transaction) {
            return transaction.date.slice(0, 7) === currentMonth;
        })
        .reduce(function (total, transaction) {
            return total + transaction.amount;
        }, 0);

    const formattedCurrency = function (amount) {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    totalBalance.textContent = formattedCurrency(income - expenseTotal);
    totalIncome.textContent = formattedCurrency(income);
    totalExpense.textContent = formattedCurrency(expenseTotal);
    chartTotal.textContent = formattedCurrency(expenseTotal);
    transactionCount.textContent = transactions.length;
    monthlyExpense.textContent = formattedCurrency(currentMonthExpense);
    averageExpense.textContent = formattedCurrency(
        expenses.length ? expenseTotal / expenses.length : 0
    );

    Object.keys(categoryAmountElements).forEach(function (category) {
        const categoryTotal = expenses
            .filter(function (transaction) {
                return transaction.category === category;
            })
            .reduce(function (total, transaction) {
                return total + transaction.amount;
            }, 0);

        categoryAmountElements[category].textContent = formattedCurrency(categoryTotal);
    });

}


// ===============================
// CREATE TRANSACTION ELEMENT
// ===============================

function createTransactionElement(transaction) {

    const item = document.createElement("div");

    item.classList.add("transaction-item");


    // Category icon

    const icon = getCategoryIcon(transaction.category);


    // Format date

    const formattedDate = formatDate(transaction.date);


    // Income or expense sign

    const sign = transaction.type === "income" ? "+" : "-";


    // Category name

    const categoryName =
        transaction.category.charAt(0).toUpperCase() +
        transaction.category.slice(1);


    item.innerHTML = `

        <div class="transaction-info">

            <div class="transaction-icon">

                <i class="${icon}"></i>

            </div>

            <div class="transaction-details">

                <h3 class="transaction-title">${escapeHTML(String(transaction.title || "Untitled transaction"))}</h3>

                <p>
                    ${categoryName} • ${formattedDate}
                </p>

            </div>

        </div>


        <div class="transaction-right">

            <strong class="${transaction.type}">
                ${sign}₹${transaction.amount.toFixed(2)}
            </strong>


            <button
                class="delete-btn"
                data-id="${transaction.id}"
                title="Delete transaction"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    `;


    // Delete button

    const deleteBtn =
        item.querySelector(".delete-btn");


    deleteBtn.addEventListener("click", function () {

        deleteTransaction(transaction.id);

    });


    return item;

}


// ===============================
// CATEGORY ICONS
// ===============================

function getCategoryIcon(category) {

    const icons = {

        food: "fa-solid fa-utensils",

        transport: "fa-solid fa-car",

        shopping: "fa-solid fa-bag-shopping",

        bills: "fa-solid fa-file-invoice",

        entertainment: "fa-solid fa-film",

        health: "fa-solid fa-heart-pulse",

        education: "fa-solid fa-graduation-cap",

        salary: "fa-solid fa-money-bill-wave",

        other: "fa-solid fa-ellipsis"

    };


    return icons[category] || icons.other;

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");


    return date.toLocaleDateString("en-IN", {

        day: "numeric",

        month: "short",

        year: "numeric"

    });

}


// ===============================
// DELETE TRANSACTION
// ===============================

function deleteTransaction(id) {

    const confirmed =
        confirm("Are you sure you want to delete this transaction?");


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(function (transaction) {

            return transaction.id !== id;

        });

    localStorage.setItem(
        "expenseTrackerTransactions",
        JSON.stringify(transactions)
    );


    renderTransactions();

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ===============================
// INITIAL RENDER
// ===============================

renderTransactions();