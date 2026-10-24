// app.js - connects the page with the data and helpers

import { expenses, loadExpenses, addExpense, deleteExpense } from "./data.js";
import {
  createIdGenerator,
  fetchJSON,
  todayString,
  formatMoney,
  validateExpense,
  getVisibleExpenses,
  sumAmounts,
  calculateStats
} from "./utils.js";

// used when the JSON files cannot be loaded
const DEFAULT_CATEGORIES = ["Food", "Transport", "Books", "Bills", "Other"];
const DEFAULT_SETTINGS = { currency: "PKR", monthlyBudget: 20000 };

let categories = [...DEFAULT_CATEGORIES];
let settings = { ...DEFAULT_SETTINGS };
let nextId; // set after the expenses are loaded

// ----- page elements -----
const form = document.getElementById("expense-form");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const tableBody = document.getElementById("expense-body");
const tableTotal = document.getElementById("table-total");
const filterCategory = document.getElementById("filter-category");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const loadMessage = document.getElementById("load-message");
const budgetMessage = document.getElementById("budget-message");
const categoryCounts = document.getElementById("category-counts");

const fieldNames = ["title", "amount", "date", "category"];

// ----- load the two JSON files together -----
async function loadConfig() {
  try {
    const [loadedCategories, loadedSettings] = await Promise.all([
      fetchJSON("categories.json"),
      fetchJSON("settings.json")
    ]);

    // make sure the files have the shape we expect
    if (!Array.isArray(loadedCategories) || loadedCategories.length === 0) {
      throw new Error("categories.json is not a list of categories");
    }
    if (typeof loadedSettings.monthlyBudget !== "number") {
      throw new Error("settings.json has no valid monthlyBudget");
    }

    categories = loadedCategories.map(String);
    settings = { ...DEFAULT_SETTINGS, ...loadedSettings };
  } catch (err) {
    // keep the defaults so the app still works, and tell the user
    categories = [...DEFAULT_CATEGORIES];
    settings = { ...DEFAULT_SETTINGS };
    loadMessage.textContent = `Could not load settings (${err.message}). Using the default categories and a budget of ${formatMoney(settings.monthlyBudget, settings.currency)}.`;
    loadMessage.hidden = false;
  }
}

// ----- fill both category dropdowns -----
function fillCategoryDropdowns() {
  categories.forEach((name) => {
    categorySelect.append(new Option(name, name));
    filterCategory.append(new Option(name, name));
  });
}

// ----- table -----
function makeCell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function makeMessageRow(text) {
  const tr = document.createElement("tr");
  tr.className = "empty-row";
  const td = makeCell(text);
  td.colSpan = 5;
  tr.append(td);
  return tr;
}

function renderTable() {
  const visible = getVisibleExpenses(expenses, {
    category: filterCategory.value,
    search: searchInput.value,
    sort: sortSelect.value
  });

  tableBody.replaceChildren(); // clear old rows

  if (expenses.length === 0) {
    tableBody.append(makeMessageRow("No expenses yet"));
  } else if (visible.length === 0) {
    tableBody.append(makeMessageRow("No expenses match your filters"));
  } else {
    visible.forEach((item) => {
      const tr = document.createElement("tr");

      // user text only goes in through textContent, so no HTML is ever run
      const titleCell = makeCell(item.title);
      if (item.note) titleCell.title = item.note;

      const actionCell = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.id = item.id;
      deleteBtn.setAttribute("aria-label", `Delete ${item.title}`);
      actionCell.append(deleteBtn);

      tr.append(
        makeCell(item.date),
        titleCell,
        makeCell(item.category),
        makeCell(formatMoney(item.amount, settings.currency), "num"),
        actionCell
      );
      tableBody.append(tr);
    });
  }

  tableTotal.textContent = formatMoney(sumAmounts(visible), settings.currency);
}

// ----- summary and budget -----
function renderSummary() {
  const stats = calculateStats(expenses, categories);
  const money = (n) => formatMoney(n, settings.currency);

  document.getElementById("stat-total").textContent = money(stats.total);
  document.getElementById("stat-average").textContent = money(Math.round(stats.average * 100) / 100);
  document.getElementById("stat-highest").textContent = money(stats.highest);
  document.getElementById("stat-count").textContent = stats.count;

  categoryCounts.replaceChildren();
  stats.perCategory.forEach(({ name, count }) => {
    const li = document.createElement("li");
    li.textContent = `${name}: ${count}`;
    categoryCounts.append(li);
  });

  const budget = settings.monthlyBudget;
  const difference = Math.abs(budget - stats.total);
  if (stats.total > budget) {
    budgetMessage.textContent = `Warning: you have crossed your monthly budget of ${money(budget)} by ${money(difference)}.`;
    budgetMessage.className = "budget-message budget-over";
  } else {
    budgetMessage.textContent = `You have ${money(difference)} left from your monthly budget of ${money(budget)}.`;
    budgetMessage.className = "budget-message budget-ok";
  }
}

function renderAll() {
  renderTable();
  renderSummary();
}

// ----- form errors -----
function showErrors(errors) {
  fieldNames.forEach((name) => {
    const input = document.getElementById(name);
    const errorBox = document.getElementById(`${name}-error`);
    const message = errors[name] || "";
    errorBox.textContent = message;
    input.classList.toggle("input-error", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  });
}

function handleSubmit(event) {
  event.preventDefault(); // stop the page from reloading

  const fields = form.elements; // form.title would give the form's own title attribute
  const values = {
    title: fields.title.value.trim(),
    amount: fields.amount.value.trim(),
    date: fields.date.value,
    category: fields.category.value,
    note: fields.note.value.trim()
  };

  const errors = validateExpense(values);
  showErrors(errors);

  const firstBadField = fieldNames.find((name) => errors[name]);
  if (firstBadField) {
    document.getElementById(firstBadField).focus();
    return;
  }

  addExpense({
    id: nextId(),
    title: values.title,
    amount: Number(values.amount),
    category: values.category,
    date: values.date,
    note: values.note
  });

  form.reset();
  renderAll();
}

// ----- one listener on tbody handles every Delete button -----
function handleTableClick(event) {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  deleteExpense(Number(button.dataset.id));
  renderAll();
}

// ----- start the app -----
async function init() {
  await loadConfig();
  fillCategoryDropdowns();

  loadExpenses();
  // new ids start after the biggest id we already have
  const maxId = expenses.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  nextId = createIdGenerator(maxId + 1);

  dateInput.max = todayString(); // the date picker also blocks future days

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", () => showErrors({})); // clear old messages on Reset
  tableBody.addEventListener("click", handleTableClick);
  filterCategory.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);
  sortSelect.addEventListener("change", renderTable);

  renderAll();
}

init();
