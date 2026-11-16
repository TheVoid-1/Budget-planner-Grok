import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as ChevronLeft, i as ChevronRight, r as Plus, t as X } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-O8nMTOZk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var PRESETS = {
	income: [
		"Salary",
		"Freelance",
		"Refund",
		"Gift",
		"Other"
	],
	expense: [
		"Housing",
		"Food",
		"Transport",
		"Utilities",
		"Health",
		"Shopping",
		"Entertainment",
		"Other"
	]
};
var DEFAULT_GOAL = {
	name: "Emergency fund",
	targetCents: 15e4
};
var money = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD"
});
function formatMoney(cents) {
	return money.format(cents / 100);
}
function centsToInput(cents) {
	return (cents / 100).toFixed(2);
}
/** Dollars and cents, greater than zero. Rejects extra decimal places. */
function parseAmountToCents(raw) {
	const cleaned = raw.trim().replace(/[$,]/g, "");
	if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
	const [whole, frac = ""] = cleaned.split(".");
	if (whole.length > 8) return null;
	const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
	if (!Number.isSafeInteger(cents) || cents <= 0) return null;
	return cents;
}
function isValidISODate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	if (year < 1900 || year > 2200) return false;
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function isTransaction(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return typeof row.id === "string" && row.id.length > 0 && (row.kind === "income" || row.kind === "expense") && Number.isInteger(row.amountCents) && row.amountCents > 0 && typeof row.category === "string" && row.category.trim().length > 0 && typeof row.note === "string" && typeof row.date === "string" && isValidISODate(row.date);
}
function monthKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function shiftMonth(key, delta) {
	const [year, month] = key.split("-").map(Number);
	return monthKey(new Date(year, month - 1 + delta, 1));
}
function formatMonthLabel(key) {
	const [year, month] = key.split("-").map(Number);
	return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
}
function formatDayLabel(iso) {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function defaultDateForMonth(key, today = /* @__PURE__ */ new Date()) {
	if (key === monthKey(today)) return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	return `${key}-01`;
}
function totals(rows) {
	let income = 0;
	let expense = 0;
	for (const row of rows) if (row.kind === "income") income += row.amountCents;
	else expense += row.amountCents;
	return {
		income,
		expense,
		remaining: income - expense
	};
}
function largestRemainder(values) {
	const total = values.reduce((sum, value) => sum + value, 0);
	if (total <= 0) return values.map(() => 0);
	const exact = values.map((value) => value / total * 100);
	const floors = exact.map((value) => Math.floor(value));
	let left = 100 - floors.reduce((sum, value) => sum + value, 0);
	const order = exact.map((value, index) => ({
		index,
		frac: value - floors[index]
	})).sort((a, b) => b.frac - a.frac || a.index - b.index);
	for (let i = 0; i < order.length && left > 0; i += 1) {
		floors[order[i].index] += 1;
		left -= 1;
	}
	return floors;
}
function spendingByCategory(rows) {
	const grouped = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (row.kind !== "expense") continue;
		grouped.set(row.category, (grouped.get(row.category) ?? 0) + row.amountCents);
	}
	const entries = [...grouped.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	const pcts = largestRemainder(entries.map(([, cents]) => cents));
	return entries.map(([name, cents], index) => ({
		name,
		cents,
		pct: pcts[index] ?? 0
	}));
}
function buildSample(now = /* @__PURE__ */ new Date()) {
	const year = now.getFullYear();
	const month = now.getMonth();
	const date = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	const row = (id, kind, amountCents, category, note, day) => ({
		id,
		kind,
		amountCents,
		category,
		note,
		date: date(day)
	});
	return [
		row("sample-paycheck", "income", 42e4, "Salary", "Paycheck", 1),
		row("sample-freelance", "income", 65e3, "Freelance", "Client revision", 8),
		row("sample-rent", "expense", 145e3, "Housing", "Rent", 1),
		row("sample-groceries", "expense", 8640, "Food", "Groceries", 3),
		row("sample-lunch", "expense", 4215, "Food", "Lunch out", 10),
		row("sample-transit", "expense", 6400, "Transport", "Transit pass", 5),
		row("sample-electric", "expense", 11820, "Utilities", "Electric", 6),
		row("sample-pharmacy", "expense", 3500, "Health", "Pharmacy", 12),
		row("sample-streaming", "expense", 1599, "Entertainment", "Streaming", 14),
		row("sample-supplies", "expense", 7250, "Shopping", "Supplies", 15)
	];
}
function sanitize(input) {
	const category = input.category.trim().slice(0, 40);
	const note = input.note.trim().slice(0, 80);
	if (!category) return null;
	if (input.kind !== "income" && input.kind !== "expense") return null;
	if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) return null;
	if (input.amountCents > 9999999999) return null;
	if (!isValidISODate(input.date)) return null;
	return {
		kind: input.kind,
		amountCents: input.amountCents,
		category,
		note,
		date: input.date
	};
}
var useBudget = create()(persist((set, get) => ({
	transactions: buildSample(),
	goal: DEFAULT_GOAL,
	addTransaction: (input) => {
		const clean = sanitize(input);
		if (!clean) return null;
		const id = crypto.randomUUID();
		set((state) => ({ transactions: [...state.transactions, {
			...clean,
			id
		}] }));
		return id;
	},
	updateTransaction: (id, input) => {
		const clean = sanitize(input);
		if (!clean) return false;
		if (!get().transactions.some((row) => row.id === id)) return false;
		set((state) => ({ transactions: state.transactions.map((row) => row.id === id ? {
			...clean,
			id
		} : row) }));
		return true;
	},
	deleteTransaction: (id) => {
		set((state) => ({ transactions: state.transactions.filter((row) => row.id !== id) }));
	},
	deleteTransactions: (ids) => {
		const drop = new Set(ids);
		set((state) => ({ transactions: state.transactions.filter((row) => !drop.has(row.id)) }));
	},
	setGoal: (name, targetCents) => {
		const trimmed = name.trim().slice(0, 40);
		if (!trimmed) return false;
		if (!Number.isInteger(targetCents) || targetCents <= 0) return false;
		if (targetCents > 9999999999) return false;
		set({ goal: {
			name: trimmed,
			targetCents
		} });
		return true;
	}
}), {
	name: "ledger-budget-v1",
	version: 1,
	skipHydration: true,
	partialize: (state) => ({
		transactions: state.transactions,
		goal: state.goal
	})
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("pressable inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-[background-color,color,box-shadow,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface text-fg shadow-card hover:bg-inset",
			ghost: "bg-transparent text-fg hover:bg-inset",
			danger: "bg-surface text-danger shadow-card hover:bg-inset"
		},
		size: {
			md: "min-h-11 px-4",
			icon: "size-11 shrink-0 p-0"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Modal({ open, onOpenChange, title, description, children, initialFocusId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "modal-overlay fixed inset-0 z-50 bg-fg/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "modal-panel fixed top-1/2 right-4 left-4 z-50 mx-auto max-w-md -translate-y-1/2 rounded-xl bg-surface p-4 shadow-card outline-none",
			onOpenAutoFocus: (event) => {
				if (!initialFocusId) return;
				event.preventDefault();
				document.getElementById(initialFocusId)?.focus();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display text-2xl leading-tight tracking-tight text-fg",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "mt-1 text-sm text-pretty text-muted",
						children: description
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "pressable inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-inset hover:text-fg",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), children]
		})] })
	});
}
var SpendChart = (0, import_react.lazy)(() => import("./spend-chart-B7QLp0hq.mjs").then((mod) => ({ default: mod.SpendChart })));
var emptyErrors = () => ({
	amount: "",
	category: "",
	date: ""
});
function blankDraft(month) {
	return {
		kind: "expense",
		amount: "",
		category: "",
		note: "",
		date: defaultDateForMonth(month)
	};
}
function entryLabel(tx) {
	const sign = tx.kind === "income" ? "+" : "−";
	return `${tx.note ? `${tx.note} · ` : ""}${tx.category} · ${sign}${formatMoney(tx.amountCents)}`;
}
function BudgetApp() {
	const store = useBudget();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [month, setMonth] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [entryOpen, setEntryOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(() => blankDraft(monthKey(/* @__PURE__ */ new Date())));
	const [errors, setErrors] = (0, import_react.useState)(emptyErrors);
	const [goalOpen, setGoalOpen] = (0, import_react.useState)(false);
	const [goalName, setGoalName] = (0, import_react.useState)("");
	const [goalTarget, setGoalTarget] = (0, import_react.useState)("");
	const [goalError, setGoalError] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [pendingScroll, setPendingScroll] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setMonth(monthKey(/* @__PURE__ */ new Date()));
		const done = () => {
			if (!cancelled) setReady(true);
		};
		try {
			const result = useBudget.persist.rehydrate();
			if (result && typeof result.then === "function") Promise.resolve(result).then(done, done);
			else done();
		} catch {
			done();
		}
		return () => {
			cancelled = true;
		};
	}, []);
	const transactions = (0, import_react.useMemo)(() => store.transactions.filter(isTransaction), [store.transactions]);
	const goal = store.goal && typeof store.goal.name === "string" && store.goal.name.trim() && Number.isInteger(store.goal.targetCents) && store.goal.targetCents > 0 ? store.goal : DEFAULT_GOAL;
	const monthRows = (0, import_react.useMemo)(() => month ? transactions.filter((row) => row.date.slice(0, 7) === month) : [], [transactions, month]);
	const figures = (0, import_react.useMemo)(() => totals(monthRows), [monthRows]);
	const spendRows = (0, import_react.useMemo)(() => spendingByCategory(monthRows), [monthRows]);
	const visible = (0, import_react.useMemo)(() => {
		return (filter === "all" ? monthRows : monthRows.filter((row) => row.kind === filter)).map((row, index) => ({
			row,
			index
		})).sort((a, b) => b.row.date.localeCompare(a.row.date) || b.index - a.index).map((item) => item.row);
	}, [monthRows, filter]);
	(0, import_react.useEffect)(() => {
		if (!pendingScroll) return;
		document.querySelector(`[data-testid="${CSS.escape(`tx-${pendingScroll}`)}"]`)?.scrollIntoView({ block: "nearest" });
	}, [
		pendingScroll,
		visible,
		month
	]);
	if (!ready || !month) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-5xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl tracking-tight",
			children: "Ledger"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Opening your budget…"
		})]
	});
	const monthLabel = formatMonthLabel(month);
	const applied = Math.min(goal.targetCents, Math.max(0, figures.remaining));
	const goalPct = Math.min(100, applied / goal.targetCents * 100);
	const goalStatus = figures.remaining >= goal.targetCents ? "Goal covered this month." : figures.remaining > 0 ? `${formatMoney(goal.targetCents - figures.remaining)} still to set aside.` : "Nothing left to set aside.";
	const samplesOnly = transactions.length > 0 && transactions.every((row) => row.id.startsWith("sample-"));
	function openAdd() {
		setEditing(null);
		setDraft(blankDraft(month));
		setErrors(emptyErrors());
		setEntryOpen(true);
	}
	function openEdit(tx) {
		setEditing(tx);
		setDraft({
			kind: tx.kind,
			amount: centsToInput(tx.amountCents),
			category: tx.category,
			note: tx.note,
			date: tx.date
		});
		setErrors(emptyErrors());
		setEntryOpen(true);
	}
	function setKind(kind) {
		setDraft((current) => {
			const category = (kind === "income" ? PRESETS.expense : PRESETS.income).includes(current.category) ? "" : current.category;
			return {
				...current,
				kind,
				category
			};
		});
	}
	function saveEntry(event) {
		event.preventDefault();
		const nextErrors = emptyErrors();
		const cents = parseAmountToCents(draft.amount);
		if (cents == null) nextErrors.amount = "Enter an amount greater than 0, like 12.50.";
		if (!draft.category.trim()) nextErrors.category = "Choose or type a category.";
		if (!draft.date) nextErrors.date = "Choose a date.";
		else if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) nextErrors.date = "That date isn't valid.";
		if (nextErrors.amount || nextErrors.category || nextErrors.date) {
			setErrors(nextErrors);
			return;
		}
		const payload = {
			kind: draft.kind,
			amountCents: cents,
			category: draft.category,
			note: draft.note,
			date: draft.date
		};
		const id = editing ? store.updateTransaction(editing.id, payload) ? editing.id : null : store.addTransaction(payload);
		if (!id) {
			setErrors({
				...nextErrors,
				amount: "Could not save that entry."
			});
			return;
		}
		setFilter("all");
		setMonth(payload.date.slice(0, 7));
		setPendingScroll(id);
		setEntryOpen(false);
	}
	function openGoal() {
		setGoalName(goal.name);
		setGoalTarget(centsToInput(goal.targetCents));
		setGoalError("");
		setGoalOpen(true);
	}
	function saveGoal(event) {
		event.preventDefault();
		const cents = parseAmountToCents(goalTarget);
		if (!goalName.trim()) {
			setGoalError("Name your goal.");
			return;
		}
		if (cents == null) {
			setGoalError("Enter a target greater than 0, like 1500.");
			return;
		}
		if (!store.setGoal(goalName, cents)) {
			setGoalError("Could not save that goal.");
			return;
		}
		setGoalOpen(false);
	}
	function runConfirm() {
		if (!confirm) return;
		if (confirm.type === "delete") store.deleteTransaction(confirm.tx.id);
		else store.deleteTransactions(confirm.ids);
		setConfirm(null);
	}
	const listCaption = filter === "all" ? `${visible.length} ${visible.length === 1 ? "entry" : "entries"}` : `${visible.length} ${filter === "income" ? "income" : "expense"} ${visible.length === 1 ? "entry" : "entries"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-5xl px-4 pt-8 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-tight",
						children: "Ledger"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-pretty text-muted",
						children: "Income, spending, and what is left to save — for one month at a time."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center rounded-md bg-inset p-1",
						role: "group",
						"aria-label": "Choose month",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Previous month",
								"data-testid": "month-prev",
								onClick: () => setMonth((current) => shiftMonth(current ?? month, -1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
									className: "size-5",
									"aria-hidden": "true"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-testid": "month-label",
								className: "min-w-36 text-center text-sm font-medium tabular-nums",
								children: monthLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Next month",
								"data-testid": "month-next",
								onClick: () => setMonth((current) => shiftMonth(current ?? month, 1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
									className: "size-5",
									"aria-hidden": "true"
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-testid": "add-entry",
						onClick: openAdd,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Add entry"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				"aria-labelledby": "remaining-label",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "remaining-label",
						className: "text-sm font-medium text-muted",
						children: "Left this month"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-testid": "remaining",
						"aria-live": "polite",
						className: cn("mt-1 font-display text-4xl leading-tight tracking-tight tabular-nums sm:text-5xl", figures.remaining < 0 && "text-danger"),
						children: formatMoney(figures.remaining)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: figures.remaining < 0 ? "Spending is ahead of income." : "Income minus expenses, updated as you edit."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid max-w-md grid-cols-2 gap-4 border-t border-line pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Income"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "income-total",
							className: "mt-1 text-xl font-medium text-positive tabular-nums",
							children: formatMoney(figures.income)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Spent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "expense-total",
							className: "mt-1 text-xl font-medium text-danger tabular-nums",
							children: formatMoney(figures.expense)
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid items-start gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 rounded-xl bg-surface p-4 shadow-card lg:col-span-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-medium",
							children: "Spending by category"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-pretty text-muted",
							children: [
								"Expenses in ",
								monthLabel,
								", largest first."
							]
						}),
						spendRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "spend-empty",
							className: "mt-4 text-sm text-pretty text-muted",
							children: "No spending this month. Add an expense and it will show up here."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid items-center gap-4 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Loading chart…"
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendChart, { rows: spendRows })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-line",
								"data-testid": "category-list",
								children: spendRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-baseline justify-between gap-3 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-0 truncate text-sm",
											children: row.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 text-sm font-medium tabular-nums",
											children: formatMoney(row.cents)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "w-10 shrink-0 text-right text-sm text-muted tabular-nums",
											children: [row.pct, "%"]
										})
									]
								}, row.name))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 rounded-xl bg-surface p-4 shadow-card lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-medium",
								children: "Savings goal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-pretty text-muted",
								children: "Set aside from what is left this month."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								"data-testid": "edit-goal",
								onClick: openGoal,
								children: "Edit goal"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "goal-name",
							className: "mt-5 font-display text-2xl leading-tight tracking-tight",
							children: goal.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-testid": "goal-amounts",
							className: "mt-1 text-sm text-muted tabular-nums",
							children: [
								formatMoney(applied),
								" of ",
								formatMoney(goal.targetCents)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-2 overflow-hidden rounded-full bg-inset",
							role: "progressbar",
							"aria-valuemin": 0,
							"aria-valuemax": goal.targetCents,
							"aria-valuenow": applied,
							"aria-label": `${goal.name} progress`,
							"data-testid": "goal-progress",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "goal-fill",
								style: { width: `${goalPct}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "goal-status",
							className: "mt-3 text-sm",
							children: goalStatus
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				"aria-labelledby": "transactions-label",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "transactions-label",
							className: "text-lg font-medium",
							children: "Transactions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "list-count",
							className: "mt-1 text-sm text-muted",
							children: listCaption
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-md bg-inset p-1",
								role: "group",
								"aria-label": "Filter entries",
								children: [
									["all", "All"],
									["income", "Income"],
									["expense", "Expenses"]
								].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									"aria-pressed": filter === id,
									"data-testid": `filter-${id}`,
									className: cn(filter === id && "bg-surface shadow-card"),
									onClick: () => setFilter(id),
									children: label
								}, id))
							}), monthRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								"data-testid": "clear-month",
								onClick: () => setConfirm({
									type: "clear",
									count: monthRows.length,
									label: monthLabel,
									ids: monthRows.map((row) => row.id)
								}),
								children: "Clear month"
							}) : null]
						})]
					}),
					samplesOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-pretty text-muted",
						children: "Example entries are filled in so the month is not empty. Edit any row, or clear the month and use your own."
					}) : null,
					visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl bg-surface p-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-pretty text-muted",
							children: monthRows.length === 0 ? `Nothing in ${monthLabel} yet.` : filter === "income" ? "No income this month." : "No expenses this month."
						}), monthRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							onClick: openAdd,
							children: "Add entry"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							variant: "secondary",
							onClick: () => setFilter("all"),
							children: "Show all entries"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						"data-testid": "tx-list",
						className: "mt-4 divide-y divide-line",
						children: visible.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							"data-testid": `tx-${tx.id}`,
							className: "py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-medium",
										children: tx.category
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-sm text-muted",
										children: [tx.note ? `${tx.note} · ` : "", formatDayLabel(tx.date)]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("inline-flex shrink-0 font-medium tabular-nums", tx.kind === "income" ? "text-positive" : "text-danger"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-block w-4 text-center",
										"aria-hidden": "true",
										children: tx.kind === "income" ? "+" : "−"
									}), formatMoney(tx.amountCents)]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									"aria-label": `Edit ${entryLabel(tx)}`,
									onClick: () => openEdit(tx),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "danger",
									"aria-label": `Delete ${entryLabel(tx)}`,
									onClick: () => setConfirm({
										type: "delete",
										tx
									}),
									children: "Delete"
								})]
							})]
						}, tx.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: entryOpen,
				onOpenChange: (open) => {
					setEntryOpen(open);
					if (!open) setErrors(emptyErrors());
				},
				title: editing ? "Edit entry" : "Add entry",
				description: editing ? "Update this entry. The balance changes as soon as you save." : "Record money coming in or going out.",
				initialFocusId: "entry-amount",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-4",
					onSubmit: saveEntry,
					noValidate: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1 rounded-md bg-inset p-1",
							role: "group",
							"aria-label": "Entry type",
							children: [["income", "Income"], ["expense", "Expense"]].map(([kind, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": draft.kind === kind,
								"data-testid": `kind-${kind}`,
								className: cn("pressable min-h-11 rounded-sm text-sm font-medium", draft.kind === kind ? "bg-surface text-fg shadow-card" : "text-muted"),
								onClick: () => setKind(kind),
								children: label
							}, kind))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "entry-amount",
							label: "Amount",
							error: errors.amount,
							inputMode: "decimal",
							autoComplete: "off",
							placeholder: "0.00",
							maxLength: 12,
							value: draft.amount,
							onChange: (value) => {
								setDraft((current) => ({
									...current,
									amount: value
								}));
								setErrors((current) => ({
									...current,
									amount: ""
								}));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "entry-category",
									className: "text-sm font-medium",
									children: "Category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: PRESETS[draft.kind].map((name) => {
										const selected = draft.category === name;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": selected,
											"data-testid": `chip-${name}`,
											className: cn("pressable min-h-11 rounded-full px-3 text-sm font-medium", selected ? "bg-accent text-accent-fg" : "bg-inset text-fg hover:bg-line"),
											onClick: () => {
												setDraft((current) => ({
													...current,
													category: name
												}));
												setErrors((current) => ({
													...current,
													category: ""
												}));
											},
											children: name
										}, name);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "entry-category",
									className: "h-11 w-full rounded-sm bg-bg px-3 text-base text-fg shadow-card placeholder:text-subtle",
									autoComplete: "off",
									maxLength: 40,
									placeholder: "Or type your own",
									value: draft.category,
									onChange: (event) => {
										const value = event.target.value;
										setDraft((current) => ({
											...current,
											category: value
										}));
										setErrors((current) => ({
											...current,
											category: ""
										}));
									}
								}),
								errors.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "text-sm text-danger",
									children: errors.category
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "entry-date",
							label: "Date",
							type: "date",
							error: errors.date,
							value: draft.date,
							onChange: (value) => {
								setDraft((current) => ({
									...current,
									date: value
								}));
								setErrors((current) => ({
									...current,
									date: ""
								}));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "entry-note",
							label: "Note",
							autoComplete: "off",
							maxLength: 80,
							placeholder: "Optional",
							value: draft.note,
							onChange: (value) => setDraft((current) => ({
								...current,
								note: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => setEntryOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "flex-1",
								"data-testid": "save-entry",
								children: editing ? "Save changes" : "Add entry"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: goalOpen,
				onOpenChange: (open) => {
					setGoalOpen(open);
					if (!open) setGoalError("");
				},
				title: "Edit savings goal",
				description: "A monthly target. Progress uses whatever is left after expenses.",
				initialFocusId: "goal-name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-4",
					onSubmit: saveGoal,
					noValidate: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "goal-name",
							label: "Name",
							autoComplete: "off",
							maxLength: 40,
							value: goalName,
							onChange: (value) => {
								setGoalName(value);
								setGoalError("");
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							id: "goal-target",
							label: "Target",
							inputMode: "decimal",
							autoComplete: "off",
							placeholder: "1500.00",
							maxLength: 12,
							value: goalTarget,
							onChange: (value) => {
								setGoalTarget(value);
								setGoalError("");
							}
						}),
						goalError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "text-sm text-danger",
							children: goalError
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => setGoalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "flex-1",
								"data-testid": "save-goal",
								children: "Save goal"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: confirm !== null,
				onOpenChange: (open) => {
					if (!open) setConfirm(null);
				},
				title: confirm?.type === "clear" ? "Clear this month?" : "Delete entry?",
				description: confirm?.type === "clear" ? `Remove all ${confirm.count} ${confirm.count === 1 ? "entry" : "entries"} in ${confirm.label}? Your savings goal stays. This cannot be undone.` : confirm?.type === "delete" ? `Remove ${entryLabel(confirm.tx)}? This cannot be undone.` : " ",
				initialFocusId: "confirm-cancel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						id: "confirm-cancel",
						variant: "secondary",
						className: "flex-1",
						onClick: () => setConfirm(null),
						children: confirm?.type === "clear" ? "Keep entries" : "Keep"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						className: "flex-1",
						"data-testid": "confirm-remove",
						onClick: runConfirm,
						children: confirm?.type === "clear" ? "Remove entries" : "Delete"
					})]
				})
			})
		]
	});
}
function Field({ id, label, error, value, onChange, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				value,
				onChange: (event) => onChange(event.target.value),
				className: "h-11 w-full rounded-sm bg-bg px-3 text-base text-fg shadow-card placeholder:text-subtle",
				...props
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}) : null
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetApp, {});
}
//#endregion
export { formatMoney as n, routes_exports as t };
