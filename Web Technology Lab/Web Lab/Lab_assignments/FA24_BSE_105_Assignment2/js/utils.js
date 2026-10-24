// utils.js - small helper functions used by app.js

// closure: "current" stays private and keeps counting between calls
export function createIdGenerator(start = 1) {
  let current = start;
  return () => current++;
}

// fetch a JSON file and throw if the server says it failed
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url} (status ${response.status})`);
  }
  return response.json();
}

// today's date as "YYYY-MM-DD" in local time (same format as <input type="date">)
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// show a number as money, e.g. "PKR 1,250"
export function formatMoney(amount, currency) {
  const safe = Number.isFinite(amount) ? amount : 0;
  const text = safe.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${currency} ${text}`;
}

// title: 3-40 characters with at least one letter
const TITLE_PATTERN = /^(?=.*[A-Za-z]).{3,40}$/;

// check form values, return an object like { title: "message" } for each bad field
export function validateExpense({ title, amount, date, category }) {
  const errors = {};

  if (!TITLE_PATTERN.test(title)) {
    errors.title = "Title must be 3 to 40 characters and contain at least one letter.";
  }

  const amountNumber = Number(amount);
  if (amount === "" || !Number.isFinite(amountNumber) || amountNumber <= 0) {
    errors.amount = "Amount must be a positive number.";
  }

  if (date === "") {
    errors.date = "Please choose a date.";
  } else if (date > todayString()) {
    // both strings are YYYY-MM-DD so comparing them as text works
    errors.date = "Date cannot be in the future.";
  }

  if (category === "") {
    errors.category = "Please choose a category.";
  }

  return errors;
}

// apply category filter + title search, then sort a COPY (the original array is not touched)
export function getVisibleExpenses(list, { category, search, sort }) {
  const term = search.trim().toLowerCase();

  const filtered = list
    .filter((item) => category === "all" || item.category === category)
    .filter((item) => item.title.toLowerCase().includes(term));

  if (sort === "asc") {
    return [...filtered].sort((a, b) => a.amount - b.amount);
  }
  if (sort === "desc") {
    return [...filtered].sort((a, b) => b.amount - a.amount);
  }
  return filtered;
}

// add up the amounts of a list
export function sumAmounts(list) {
  return list.reduce((total, item) => total + item.amount, 0);
}

// total, average, highest and per-category counts (never NaN, empty list gives 0)
export function calculateStats(list, categories) {
  const count = list.length;
  const total = sumAmounts(list);
  const average = count > 0 ? total / count : 0;
  const highest = count > 0 ? Math.max(...list.map((item) => item.amount)) : 0;

  // include loaded categories and any old category that is still used by an expense
  const allCategories = [...new Set([...categories, ...list.map((item) => item.category)])];
  const perCategory = allCategories.map((name) => ({
    name,
    count: list.filter((item) => item.category === name).length
  }));

  return { count, total, average, highest, perCategory };
}
