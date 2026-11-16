import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as formatMoney } from "./routes-O8nMTOZk.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spend-chart-B7QLp0hq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpendTip({ active, payload }) {
	const row = payload?.[0]?.payload;
	if (!active || !row) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-fg px-3 py-2 text-sm text-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: row.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "tabular-nums",
			children: [
				formatMoney(row.cents),
				" · ",
				row.pct,
				"%"
			]
		})]
	});
}
function SpendChart({ rows }) {
	const [animate, setAnimate] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => setAnimate(!media.matches);
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);
	if (rows.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full min-w-0 text-muted",
		style: { height: Math.max(176, rows.length * 40) },
		role: "img",
		"aria-label": "Bar chart of spending by category",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data: rows,
				layout: "vertical",
				margin: {
					top: 0,
					right: 8,
					bottom: 0,
					left: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						type: "number",
						hide: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						type: "category",
						dataKey: "name",
						width: 112,
						tickLine: false,
						axisLine: false,
						tick: {
							fill: "currentColor",
							fontSize: 13
						},
						tickFormatter: (value) => value.length > 14 ? `${value.slice(0, 13)}…` : value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						cursor: { fill: "var(--color-inset)" },
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendTip, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "cents",
						fill: "var(--color-accent)",
						barSize: 12,
						radius: [
							0,
							6,
							6,
							0
						],
						isAnimationActive: animate
					})
				]
			})
		})
	});
}
//#endregion
export { SpendChart };
