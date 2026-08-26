import "../Drawer.css";

export function Drawer({ open, className, children }) {
	const classes = ["drawer", className, open ? "open" : null]
		.filter(Boolean)
		.join(" ");
	return <aside className={classes}>{children}</aside>;
}
