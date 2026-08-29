import { useEffect } from "react";
import "./Modal.css";

export function Modal({ title, open, onClose, children }) {
	useEffect(() => {
		if (!open) return;

		function handleKeyDown(e) {
			if (e.key === "Escape") onClose();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<div className="modal-header-left">{title}</div>
					<div className="modal-header-right">
						<button type="button" onClick={onClose}>
							X
						</button>
					</div>
				</div>
				<div className="modal-content">{children}</div>
				<div className="modal-footer"></div>
			</div>
		</div>
	);
}
