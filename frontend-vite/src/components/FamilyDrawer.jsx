import { useEffect, useState } from "react";
import { FormDrawer } from "./FormDrawer";

export function FamilyDrawer({ open, editId, individuals, onClose, onSaved }) {
	const isEdit = editId != null;

	const [form, setForm] = useState({
		partner1_id: "",
		partner2_id: "",
		wedding_date: "",
		children: [],
	});

	const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

	const setChild = (idx) => (e) => {
		const next = [...form.children];
		next[idx] = e.target.value;
		setForm({ ...form, children: next });
	};

	const addChild = () => setForm({ ...form, children: [...form.children, ""] });
	const removeChild = (idx) =>
		setForm({ ...form, children: form.children.filter((_, i) => i !== idx) });

	const personOptions = (
		<>
			<option value="">- Person wählen -</option>
			{individuals.map((p) => (
				<option key={p.id} value={p.id}>
					{p.given_name} {p.surname ?? ""}
					{p.birth_date ? ` (${p.birth_date.slice(0, 4)})` : ""}
				</option>
			))}
		</>
	);

	useEffect(() => {
		if (!isEdit) {
			setForm({
				partner1_id: "",
				partner2_id: "",
				wedding_date: "",
				children: [],
			});
			return;
		}
		fetch(`/api/v1/families/${editId}`)
			.then((r) => r.json())
			.then((f) => {
				setForm({
					partner1_id: f.partner1_id ?? "",
					partner2_id: f.partner2_id ?? "",
					wedding_date: f.wedding_date ?? "",
					children: (f.children ?? []).map(String),
				});
			});
	}, [editId, isEdit]);

	async function handleDelete() {
		if (!confirm("Diese Familie wirklich löschen?")) return;
		const res = await fetch(`/api/v1/families/${editId}`, {
			method: "DELETE",
		});
		if (res.ok) {
			onSaved();
		} else {
			console.log("delete failed", res.status);
		}
	}

	async function submit(e) {
		e.preventDefault();
		const body = {
			partner_1: form.partner1_id || null,
			partner_2: form.partner2_id || null,
			wedding_date: form.wedding_date || null,
			children_list: form.children.filter(Boolean).map(Number),
		};
		const res = await fetch(
			isEdit ? `/api/v1/families/${editId}` : "/api/v1/families",
			{
				method: isEdit ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
		if (res.ok) onSaved();
		else console.log("save failed", res.status);
	}

	return (
		<FormDrawer
			open={open}
			title={isEdit ? "Familie bearbeiten" : "Familie erstellen"}
			deleteLabel={isEdit ? "Familie löschen" : null}
			editId={editId}
			onClose={onClose}
			onSave={submit}
			onDelete={isEdit ? handleDelete : undefined}
		>
			<div className="drawer__field">
				<label>
					Ehepartner 1:{" "}
					<select value={form.partner1_id} onChange={set("partner1_id")}>
						{personOptions}
					</select>
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Ehepartner 2:
					<select value={form.partner2_id} onChange={set("partner2_id")}>
						{personOptions}
					</select>
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Hochzeitsdatum:
					<input
						value={form.wedding_date}
						type="date"
						onChange={set("wedding_date")}
					/>
				</label>
			</div>
			<div className="drawer__field">
				<label>Kinder:</label>
				{form.children.map((childId, idx) => (
					<div className="drawer__child-row" key={idx}>
						<select value={childId} onChange={setChild(idx)}>
							<option value="">- Person wählen -</option>
							{individuals.map((p) => (
								<option key={p.id} value={p.id}>
									{p.given_name} {p.surname ?? ""} ({p.birth_date?.slice(0, 4)})
								</option>
							))}
						</select>
						<button type="button" onClick={() => removeChild(idx)}>
							x
						</button>
					</div>
				))}
				<button className="drawer__add" type="button" onClick={addChild}>
					Kind hinzufügen
				</button>
			</div>
		</FormDrawer>
	);
}
