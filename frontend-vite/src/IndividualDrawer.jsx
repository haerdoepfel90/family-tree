import { useEffect, useState } from "react";
import { FormDrawer } from "./FormDrawer";

export function IndividualDrawer({ open, editId, onClose, onSaved }) {
	const isEdit = editId != null;

	const [form, setForm] = useState({
		given_name: "",
		second_name: "",
		third_name: "",
		surname: "",
		maiden_name: "",
		sex: "",
		birth_date: "",
		birth_place: "",
		death_date: "",
		death_place: "",
	});

	const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

	useEffect(() => {
		if (!isEdit) {
			setForm({
				given_name: "",
				second_name: "",
				third_name: "",
				surname: "",
				maiden_name: "",
				sex: "",
				birth_date: "",
				birth_place: "",
				death_date: "",
				death_place: "",
			});
			return;
		}
		fetch(`/api/v1/individuals/${editId}`)
			.then((r) => r.json())
			.then((p) => {
				setForm({
					given_name: p.given_name ?? "",
					second_name: p.second_name ?? "",
					third_name: p.third_name ?? "",
					surname: p.surname ?? "",
					maiden_name: p.maiden_name ?? "",
					sex: p.sex ?? "",
					birth_date: p.birth_date ?? "",
					birth_place: p.birth_place ?? "",
					death_date: p.death_date ?? "",
					death_place: p.death_place ?? "",
				});
			});
	}, [editId, isEdit]);

	async function submit(e) {
		e.preventDefault();
		const data = {};
		for (const [k, v] of Object.entries(form)) {
			data[k] = v === "" ? null : v;
		}

		const res = await fetch(
			isEdit ? `/api/v1/individuals/${editId}` : "/api/v1/individuals",
			{
				method: isEdit ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			},
		);
		if (res.ok) {
			onSaved();
		} else {
			console.log("save failed", res.status);
		}
	}

	return (
		<FormDrawer
			open={open}
			title={isEdit ? "Person bearbeiten" : "Person erstellen"}
			deleteLabel={isEdit ? "Person löschen" : null}
			editId={editId}
			onClose={onClose}
			onSave={submit}
		>
			<div className="drawer__field">
				<label>
					Vorname:
					<input value={form.given_name} onChange={set("given_name")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Zweitname:
					<input value={form.second_name} onChange={set("second_name")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Drittname:
					<input value={form.third_name} onChange={set("third_name")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Nachname:
					<input value={form.surname} onChange={set("surname")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Ledigname:
					<input value={form.maiden_name} onChange={set("maiden_name")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Geschlecht:{" "}
					<select value={form.sex} onChange={set("sex")}>
						<option value="">wählen</option>
						<option value="male">Männlich</option>
						<option value="female">Weiblich</option>
					</select>
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Geburtsdatum:{" "}
					<input
						value={form.birth_date}
						type="date"
						onChange={set("birth_date")}
					/>
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Geburtsort:
					<input value={form.birth_place} onChange={set("birth_place")} />
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Todesdatum:{" "}
					<input
						value={form.death_date}
						type="date"
						onChange={set("death_date")}
					/>
				</label>
			</div>
			<div className="drawer__field">
				<label>
					Sterbeort:
					<input value={form.death_place} onChange={set("death_place")} />
				</label>
			</div>
		</FormDrawer>
	);
}
