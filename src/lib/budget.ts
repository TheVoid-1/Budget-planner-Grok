import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EntryKind = "income" | "expense";

export type Transaction = {
  id: string;
  kind: EntryKind;
  amountCents: number;
  category: string;
  note: string;
  date: string;
};

export type Goal = {
  name: string;
  targetCents: number;
};

export type SpendRow = {
  name: string;
  cents: number;
  pct: number;
};

export const PRESETS: Record<EntryKind, readonly string[]> = {
  income: ["Salary", "Freelance", "Refund", "Gift", "Other"],
  expense: [
    "Housing",
    "Food",
    "Transport",
    "Utilities",
    "Health",
    "Shopping",
    "Entertainment",
    "Other",
  ],
};

export const DEFAULT_GOAL: Goal = {
  name: "Emergency fund",
  targetCents: 150_000,
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(cents: number): string {
  return money.format(cents / 100);
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Dollars and cents, greater than zero. Rejects extra decimal places. */
export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,]/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  if (whole.length > 8) return null;
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  return cents;
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2200) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const row = value as Transaction;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    (row.kind === "income" || row.kind === "expense") &&
    Number.isInteger(row.amountCents) &&
    row.amountCents > 0 &&
    typeof row.category === "string" &&
    row.category.trim().length > 0 &&
    typeof row.note === "string" &&
    typeof row.date === "string" &&
    isValidISODate(row.date)
  );
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + delta, 1));
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDayLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function defaultDateForMonth(key: string, today = new Date()): string {
  if (key === monthKey(today)) {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
  return `${key}-01`;
}

export function totals(rows: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const row of rows) {
    if (row.kind === "income") income += row.amountCents;
    else expense += row.amountCents;
  }
  return { income, expense, remaining: income - expense };
}

function largestRemainder(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map((value) => Math.floor(value));
  let left = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; i < order.length && left > 0; i += 1) {
    floors[order[i].index] += 1;
    left -= 1;
  }
  return floors;
}

export function spendingByCategory(rows: Transaction[]): SpendRow[] {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    if (row.kind !== "expense") continue;
    grouped.set(row.category, (grouped.get(row.category) ?? 0) + row.amountCents);
  }
  const entries = [...grouped.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const pcts = largestRemainder(entries.map(([, cents]) => cents));
  return entries.map(([name, cents], index) => ({
    name,
    cents,
    pct: pcts[index] ?? 0,
  }));
}

function buildSample(now = new Date()): Transaction[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const row = (
    id: string,
    kind: EntryKind,
    amountCents: number,
    category: string,
    note: string,
    day: number,
  ): Transaction => ({
    id,
    kind,
    amountCents,
    category,
    note,
    date: date(day),
  });
  return [
    row("sample-paycheck", "income", 420_000, "Salary", "Paycheck", 1),
    row("sample-freelance", "income", 65_000, "Freelance", "Client revision", 8),
    row("sample-rent", "expense", 145_000, "Housing", "Rent", 1),
    row("sample-groceries", "expense", 8_640, "Food", "Groceries", 3),
    row("sample-lunch", "expense", 4_215, "Food", "Lunch out", 10),
    row("sample-transit", "expense", 6_400, "Transport", "Transit pass", 5),
    row("sample-electric", "expense", 11_820, "Utilities", "Electric", 6),
    row("sample-pharmacy", "expense", 3_500, "Health", "Pharmacy", 12),
    row("sample-streaming", "expense", 1_599, "Entertainment", "Streaming", 14),
    row("sample-supplies", "expense", 7_250, "Shopping", "Supplies", 15),
  ];
}

type DraftInput = Omit<Transaction, "id">;

function sanitize(input: DraftInput): DraftInput | null {
  const category = input.category.trim().slice(0, 40);
  const note = input.note.trim().slice(0, 80);
  if (!category) return null;
  if (input.kind !== "income" && input.kind !== "expense") return null;
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) return null;
  if (input.amountCents > 9_999_999_999) return null;
  if (!isValidISODate(input.date)) return null;
  return {
    kind: input.kind,
    amountCents: input.amountCents,
    category,
    note,
    date: input.date,
  };
}

type BudgetState = {
  transactions: Transaction[];
  goal: Goal;
  addTransaction: (input: DraftInput) => string | null;
  updateTransaction: (id: string, input: DraftInput) => boolean;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  setGoal: (name: string, targetCents: number) => boolean;
};

export const useBudget = create<BudgetState>()(
  persist(
    (set, get) => ({
      transactions: buildSample(),
      goal: DEFAULT_GOAL,
      addTransaction: (input) => {
        const clean = sanitize(input);
        if (!clean) return null;
        const id = crypto.randomUUID();
        set((state) => ({
          transactions: [...state.transactions, { ...clean, id }],
        }));
        return id;
      },
      updateTransaction: (id, input) => {
        const clean = sanitize(input);
        if (!clean) return false;
        if (!get().transactions.some((row) => row.id === id)) return false;
        set((state) => ({
          transactions: state.transactions.map((row) =>
            row.id === id ? { ...clean, id } : row,
          ),
        }));
        return true;
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((row) => row.id !== id),
        }));
      },
      deleteTransactions: (ids) => {
        const drop = new Set(ids);
        set((state) => ({
          transactions: state.transactions.filter((row) => !drop.has(row.id)),
        }));
      },
      setGoal: (name, targetCents) => {
        const trimmed = name.trim().slice(0, 40);
        if (!trimmed) return false;
        if (!Number.isInteger(targetCents) || targetCents <= 0) return false;
        if (targetCents > 9_999_999_999) return false;
        set({ goal: { name: trimmed, targetCents } });
        return true;
      },
    }),
    {
      name: "ledger-budget-v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        transactions: state.transactions,
        goal: state.goal,
      }),
    },
  ),
);
