// data.js - keeps the expenses array and saves/loads it from localStorage

const STORAGE_KEY = "expenseTracker.expenses";

// sample data used the first time (when nothing is saved yet)
const sampleExpenses = [
  { id: 1, title: "Groceries for the week", amount: 4500, category: "Food", date: "2026-10-02", note: "Bought from the local mart" },
  { id: 2, title: "Bus card top-up", amount: 1200, category: "Transport", date: "2026-10-05", note: "" },
  { id: 3, title: "Web Development book", amount: 2800, category: "Books", date: "2026-10-09", note: "For CSC336" },
  { id: 4, title: "Electricity bill", amount: 6200, category: "Bills", date: "2026-10-12", note: "September bill" },
  { id: 5, title: "Lunch with friends", amount: 1650, category: "Food", date: "2026-10-18", note: "" },
  { id: 6, title: "Phone charger", amount: 950, category: "Other", date: "2026-10-20", note: "Old one broke" }
];

// the main array the whole app works with
export const expenses = [];

// fill the array from localStorage, or with sample data if nothing valid is saved
export function loadExpenses() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      saved = JSON.parse(raw);
    }
  } catch (err) {
    // bad JSON or storage blocked, just start fresh
    console.warn("Could not read saved expenses, using sample data.", err);
    saved = null;
  }

  // only accept a real array, otherwise use the samples
  const startData = Array.isArray(saved) ? saved : sampleExpenses;

  expenses.length = 0;
  startData.forEach((item) => {
    expenses.push({ ...item, amount: Number(item.amount) || 0 });
  });
}

// write the current array to localStorage as a JSON string
export function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.warn("Could not save expenses.", err);
  }
}

export function addExpense(expense) {
  expenses.push(expense);
  saveExpenses();
}

export function deleteExpense(id) {
  const index = expenses.findIndex((item) => item.id === id);
  if (index !== -1) {
    expenses.splice(index, 1);
    saveExpenses();
  }
}
