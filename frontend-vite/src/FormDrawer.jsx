import { Drawer } from "./Drawer";

export function FormDrawer({
	open,
	title,
	deleteLabel,
	editId,
	onClose,
	onSave,
	children,
}) {
	return (
		<Drawer open={open}>
			<div className="drawer__header">
				<h2>{title}</h2>
				<div className="drawer__header-actions">
					{deleteLabel ? (
						<button type="button" className="danger">
							{deleteLabel}
						</button>
					) : (
						""
					)}
					<button type="button" onClick={onClose}>
						X
					</button>
				</div>
			</div>
			{children}
			<button type="button" className="drawer__save" onClick={onSave}>
				Speichern
			</button>
			<div className="drawer__meta">editId: {editId ?? "create"}</div>
		</Drawer>
	);
}
