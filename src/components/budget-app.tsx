import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import {
  DEFAULT_GOAL,
  PRESETS,
  centsToInput,
  defaultDateForMonth,
  formatDayLabel,
  formatMoney,
  formatMonthLabel,
  isTransaction,
  monthKey,
  parseAmountToCents,
  shiftMonth,
  spendingByCategory,
  totals,
  useBudget,
  type EntryKind,
  type Transaction,
} from "@/lib/budget";

const SpendChart = lazy(() =>
  import("@/components/spend-chart").then((mod) => ({ default: mod.SpendChart })),
);

type Filter = "all" | EntryKind;

type Draft = {
  kind: EntryKind;
  amount: string;
  category: string;
  note: string;
  date: string;
};

type FieldErrors = {
  amount: string;
  category: string;
  date: string;
};

type Confirm =
  | { type: "delete"; tx: Transaction }
  | { type: "clear"; count: number; label: string; ids: string[] };

const emptyErrors = (): FieldErrors => ({ amount: "", category: "", date: "" });

function blankDraft(month: string): Draft {
  return {
    kind: "expense",
    amount: "",
    category: "",
    note: "",
    date: defaultDateForMonth(month),
  };
}

function entryLabel(tx: Transaction): string {
  const sign = tx.kind === "income" ? "+" : "−";
  const note = tx.note ? `${tx.note} · ` : "";
  return `${note}${tx.category} · ${sign}${formatMoney(tx.amountCents)}`;
}

export function BudgetApp() {
  const store = useBudget();
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [draft, setDraft] = useState<Draft>(() => blankDraft(monthKey(new Date())));
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalError, setGoalError] = useState("");
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMonth(monthKey(new Date()));
    const done = () => {
      if (!cancelled) setReady(true);
    };
    try {
      const result = useBudget.persist.rehydrate() as unknown;
      if (result && typeof (result as Promise<void>).then === "function") {
        void Promise.resolve(result as Promise<void>).then(done, done);
      } else {
        done();
      }
    } catch {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const transactions = useMemo(
    () => store.transactions.filter(isTransaction),
    [store.transactions],
  );
  const goal =
    store.goal &&
    typeof store.goal.name === "string" &&
    store.goal.name.trim() &&
    Number.isInteger(store.goal.targetCents) &&
    store.goal.targetCents > 0
      ? store.goal
      : DEFAULT_GOAL;

  const monthRows = useMemo(
    () => (month ? transactions.filter((row) => row.date.slice(0, 7) === month) : []),
    [transactions, month],
  );
  const figures = useMemo(() => totals(monthRows), [monthRows]);
  const spendRows = useMemo(() => spendingByCategory(monthRows), [monthRows]);
  const visible = useMemo(() => {
    const filtered =
      filter === "all" ? monthRows : monthRows.filter((row) => row.kind === filter);
    return filtered
      .map((row, index) => ({ row, index }))
      .sort((a, b) => b.row.date.localeCompare(a.row.date) || b.index - a.index)
      .map((item) => item.row);
  }, [monthRows, filter]);

  useEffect(() => {
    if (!pendingScroll) return;
    const node = document.querySelector(
      `[data-testid="${CSS.escape(`tx-${pendingScroll}`)}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [pendingScroll, visible, month]);

  if (!ready || !month) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
        <h1 className="font-display text-4xl tracking-tight">Ledger</h1>
        <p className="mt-2 text-muted">Opening your budget…</p>
      </main>
    );
  }

  const monthLabel = formatMonthLabel(month);
  const applied = Math.min(goal.targetCents, Math.max(0, figures.remaining));
  const goalPct = Math.min(100, (applied / goal.targetCents) * 100);
  const goalStatus =
    figures.remaining >= goal.targetCents
      ? "Goal covered this month."
      : figures.remaining > 0
        ? `${formatMoney(goal.targetCents - figures.remaining)} still to set aside.`
        : "Nothing left to set aside.";
  const samplesOnly =
    transactions.length > 0 && transactions.every((row) => row.id.startsWith("sample-"));

  function openAdd() {
    setEditing(null);
    setDraft(blankDraft(month!));
    setErrors(emptyErrors());
    setEntryOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setDraft({
      kind: tx.kind,
      amount: centsToInput(tx.amountCents),
      category: tx.category,
      note: tx.note,
      date: tx.date,
    });
    setErrors(emptyErrors());
    setEntryOpen(true);
  }

  function setKind(kind: EntryKind) {
    setDraft((current) => {
      const other = kind === "income" ? PRESETS.expense : PRESETS.income;
      const category = other.includes(current.category) ? "" : current.category;
      return { ...current, kind, category };
    });
  }

  function saveEntry(event: FormEvent) {
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
      amountCents: cents as number,
      category: draft.category,
      note: draft.note,
      date: draft.date,
    };
    const id = editing
      ? store.updateTransaction(editing.id, payload)
        ? editing.id
        : null
      : store.addTransaction(payload);
    if (!id) {
      setErrors({ ...nextErrors, amount: "Could not save that entry." });
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

  function saveGoal(event: FormEvent) {
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

  const listCaption =
    filter === "all"
      ? `${visible.length} ${visible.length === 1 ? "entry" : "entries"}`
      : `${visible.length} ${filter === "income" ? "income" : "expense"} ${visible.length === 1 ? "entry" : "entries"}`;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pt-8 pb-24">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl tracking-tight">Ledger</h1>
          <p className="mt-1 text-pretty text-muted">
            Income, spending, and what is left to save — for one month at a time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center rounded-md bg-inset p-1"
            role="group"
            aria-label="Choose month"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous month"
              data-testid="month-prev"
              onClick={() => setMonth((current) => shiftMonth(current ?? month, -1))}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Button>
            <p
              data-testid="month-label"
              className="min-w-36 text-center text-sm font-medium tabular-nums"
            >
              {monthLabel}
            </p>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next month"
              data-testid="month-next"
              onClick={() => setMonth((current) => shiftMonth(current ?? month, 1))}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
          <Button data-testid="add-entry" onClick={openAdd}>
            <Plus className="size-4" aria-hidden="true" />
            Add entry
          </Button>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="remaining-label">
        <h2 id="remaining-label" className="text-sm font-medium text-muted">
          Left this month
        </h2>
        <p
          data-testid="remaining"
          aria-live="polite"
          className={cn(
            "mt-1 font-display text-4xl leading-tight tracking-tight tabular-nums sm:text-5xl",
            figures.remaining < 0 && "text-danger",
          )}
        >
          {formatMoney(figures.remaining)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {figures.remaining < 0
            ? "Spending is ahead of income."
            : "Income minus expenses, updated as you edit."}
        </p>
        <div className="mt-6 grid max-w-md grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <p className="text-sm text-muted">Income</p>
            <p
              data-testid="income-total"
              className="mt-1 text-xl font-medium text-positive tabular-nums"
            >
              {formatMoney(figures.income)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Spent</p>
            <p
              data-testid="expense-total"
              className="mt-1 text-xl font-medium text-danger tabular-nums"
            >
              {formatMoney(figures.expense)}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-5">
        <section className="min-w-0 rounded-xl bg-surface p-4 shadow-card lg:col-span-3">
          <h2 className="text-lg font-medium">Spending by category</h2>
          <p className="mt-1 text-sm text-pretty text-muted">
            Expenses in {monthLabel}, largest first.
          </p>
          {spendRows.length === 0 ? (
            <p data-testid="spend-empty" className="mt-4 text-sm text-pretty text-muted">
              No spending this month. Add an expense and it will show up here.
            </p>
          ) : (
            <div className="mt-4 grid items-center gap-4 lg:grid-cols-2">
              <Suspense
                fallback={<p className="text-sm text-muted">Loading chart…</p>}
              >
                <SpendChart rows={spendRows} />
              </Suspense>
              <ul className="divide-y divide-line" data-testid="category-list">
                {spendRows.map((row) => (
                  <li
                    key={row.name}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm">{row.name}</span>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {formatMoney(row.cents)}
                    </span>
                    <span className="w-10 shrink-0 text-right text-sm text-muted tabular-nums">
                      {row.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl bg-surface p-4 shadow-card lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Savings goal</h2>
              <p className="mt-1 text-sm text-pretty text-muted">
                Set aside from what is left this month.
              </p>
            </div>
            <Button variant="secondary" data-testid="edit-goal" onClick={openGoal}>
              Edit goal
            </Button>
          </div>
          <p
            data-testid="goal-name"
            className="mt-5 font-display text-2xl leading-tight tracking-tight"
          >
            {goal.name}
          </p>
          <p data-testid="goal-amounts" className="mt-1 text-sm text-muted tabular-nums">
            {formatMoney(applied)} of {formatMoney(goal.targetCents)}
          </p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-inset"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal.targetCents}
            aria-valuenow={applied}
            aria-label={`${goal.name} progress`}
            data-testid="goal-progress"
          >
            <div className="goal-fill" style={{ width: `${goalPct}%` }} />
          </div>
          <p data-testid="goal-status" className="mt-3 text-sm">
            {goalStatus}
          </p>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="transactions-label">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="transactions-label" className="text-lg font-medium">
              Transactions
            </h2>
            <p data-testid="list-count" className="mt-1 text-sm text-muted">
              {listCaption}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-md bg-inset p-1"
              role="group"
              aria-label="Filter entries"
            >
              {(
                [
                  ["all", "All"],
                  ["income", "Income"],
                  ["expense", "Expenses"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  variant="ghost"
                  aria-pressed={filter === id}
                  data-testid={`filter-${id}`}
                  className={cn(filter === id && "bg-surface shadow-card")}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
            {monthRows.length > 0 ? (
              <Button
                variant="danger"
                data-testid="clear-month"
                onClick={() =>
                  setConfirm({
                    type: "clear",
                    count: monthRows.length,
                    label: monthLabel,
                    ids: monthRows.map((row) => row.id),
                  })
                }
              >
                Clear month
              </Button>
            ) : null}
          </div>
        </div>

        {samplesOnly ? (
          <p className="mt-4 text-sm text-pretty text-muted">
            Example entries are filled in so the month is not empty. Edit any row, or clear
            the month and use your own.
          </p>
        ) : null}

        {visible.length === 0 ? (
          <div className="mt-4 rounded-xl bg-surface p-4 shadow-card">
            <p className="text-pretty text-muted">
              {monthRows.length === 0
                ? `Nothing in ${monthLabel} yet.`
                : filter === "income"
                  ? "No income this month."
                  : "No expenses this month."}
            </p>
            {monthRows.length === 0 ? (
              <Button className="mt-4" onClick={openAdd}>
                Add entry
              </Button>
            ) : (
              <Button className="mt-4" variant="secondary" onClick={() => setFilter("all")}>
                Show all entries
              </Button>
            )}
          </div>
        ) : (
          <ul data-testid="tx-list" className="mt-4 divide-y divide-line">
            {visible.map((tx) => (
              <li key={tx.id} data-testid={`tx-${tx.id}`} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tx.category}</p>
                    <p className="truncate text-sm text-muted">
                      {tx.note ? `${tx.note} · ` : ""}
                      {formatDayLabel(tx.date)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "inline-flex shrink-0 font-medium tabular-nums",
                      tx.kind === "income" ? "text-positive" : "text-danger",
                    )}
                  >
                    <span className="inline-block w-4 text-center" aria-hidden="true">
                      {tx.kind === "income" ? "+" : "−"}
                    </span>
                    {formatMoney(tx.amountCents)}
                  </p>
                </div>
                <div className="mt-1 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    aria-label={`Edit ${entryLabel(tx)}`}
                    onClick={() => openEdit(tx)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    aria-label={`Delete ${entryLabel(tx)}`}
                    onClick={() => setConfirm({ type: "delete", tx })}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={entryOpen}
        onOpenChange={(open) => {
          setEntryOpen(open);
          if (!open) setErrors(emptyErrors());
        }}
        title={editing ? "Edit entry" : "Add entry"}
        description={
          editing
            ? "Update this entry. The balance changes as soon as you save."
            : "Record money coming in or going out."
        }
        initialFocusId="entry-amount"
      >
        <form className="flex flex-col gap-4" onSubmit={saveEntry} noValidate>
          <div
            className="grid grid-cols-2 gap-1 rounded-md bg-inset p-1"
            role="group"
            aria-label="Entry type"
          >
            {(
              [
                ["income", "Income"],
                ["expense", "Expense"],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                aria-pressed={draft.kind === kind}
                data-testid={`kind-${kind}`}
                className={cn(
                  "pressable min-h-11 rounded-sm text-sm font-medium",
                  draft.kind === kind ? "bg-surface text-fg shadow-card" : "text-muted",
                )}
                onClick={() => setKind(kind)}
              >
                {label}
              </button>
            ))}
          </div>

          <Field
            id="entry-amount"
            label="Amount"
            error={errors.amount}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            maxLength={12}
            value={draft.amount}
            onChange={(value) => {
              setDraft((current) => ({ ...current, amount: value }));
              setErrors((current) => ({ ...current, amount: "" }));
            }}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="entry-category" className="text-sm font-medium">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS[draft.kind].map((name) => {
                const selected = draft.category === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selected}
                    data-testid={`chip-${name}`}
                    className={cn(
                      "pressable min-h-11 rounded-full px-3 text-sm font-medium",
                      selected
                        ? "bg-accent text-accent-fg"
                        : "bg-inset text-fg hover:bg-line",
                    )}
                    onClick={() => {
                      setDraft((current) => ({ ...current, category: name }));
                      setErrors((current) => ({ ...current, category: "" }));
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <input
              id="entry-category"
              className="h-11 w-full rounded-sm bg-bg px-3 text-base text-fg shadow-card placeholder:text-subtle"
              autoComplete="off"
              maxLength={40}
              placeholder="Or type your own"
              value={draft.category}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((current) => ({ ...current, category: value }));
                setErrors((current) => ({ ...current, category: "" }));
              }}
            />
            {errors.category ? (
              <p role="alert" className="text-sm text-danger">
                {errors.category}
              </p>
            ) : null}
          </div>

          <Field
            id="entry-date"
            label="Date"
            type="date"
            error={errors.date}
            value={draft.date}
            onChange={(value) => {
              setDraft((current) => ({ ...current, date: value }));
              setErrors((current) => ({ ...current, date: "" }));
            }}
          />

          <Field
            id="entry-note"
            label="Note"
            autoComplete="off"
            maxLength={80}
            placeholder="Optional"
            value={draft.note}
            onChange={(value) => setDraft((current) => ({ ...current, note: value }))}
          />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEntryOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="save-entry">
              {editing ? "Save changes" : "Add entry"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={goalOpen}
        onOpenChange={(open) => {
          setGoalOpen(open);
          if (!open) setGoalError("");
        }}
        title="Edit savings goal"
        description="A monthly target. Progress uses whatever is left after expenses."
        initialFocusId="goal-name"
      >
        <form className="flex flex-col gap-4" onSubmit={saveGoal} noValidate>
          <Field
            id="goal-name"
            label="Name"
            autoComplete="off"
            maxLength={40}
            value={goalName}
            onChange={(value) => {
              setGoalName(value);
              setGoalError("");
            }}
          />
          <Field
            id="goal-target"
            label="Target"
            inputMode="decimal"
            autoComplete="off"
            placeholder="1500.00"
            maxLength={12}
            value={goalTarget}
            onChange={(value) => {
              setGoalTarget(value);
              setGoalError("");
            }}
          />
          {goalError ? (
            <p role="alert" className="text-sm text-danger">
              {goalError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setGoalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="save-goal">
              Save goal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm?.type === "clear" ? "Clear this month?" : "Delete entry?"}
        description={
          confirm?.type === "clear"
            ? `Remove all ${confirm.count} ${confirm.count === 1 ? "entry" : "entries"} in ${confirm.label}? Your savings goal stays. This cannot be undone.`
            : confirm?.type === "delete"
              ? `Remove ${entryLabel(confirm.tx)}? This cannot be undone.`
              : " "
        }
        initialFocusId="confirm-cancel"
      >
        <div className="flex gap-2">
          <Button
            id="confirm-cancel"
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirm(null)}
          >
            {confirm?.type === "clear" ? "Keep entries" : "Keep"}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            data-testid="confirm-remove"
            onClick={runConfirm}
          >
            {confirm?.type === "clear" ? "Remove entries" : "Delete"}
          </Button>
        </div>
      </Modal>
    </main>
  );
}

function Field({
  id,
  label,
  error,
  value,
  onChange,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-sm bg-bg px-3 text-base text-fg shadow-card placeholder:text-subtle"
        {...props}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
