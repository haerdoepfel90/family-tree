import { useEffect, useState } from "react";
import "./ManagePage.css";

function getIndividualName(individual_id, peopleById) {
	const given_name = peopleById.get(individual_id).given_name ?? ``;
	const second_name = peopleById.get(individual_id).second_name ?? ``;
	const third_name = peopleById.get(individual_id).third_name ?? ``;
	const surname = peopleById.get(individual_id).surname ?? ``;
	return `${given_name} ${second_name} ${third_name} ${surname}`;
}

function IndividualDrawer({ open, editId, onClose, onSaved }) {
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
		<aside className={`drawer${open ? " open" : ""}`}>
			<div className="drawer__header">
				<h2>{isEdit ? "Person bearbeiten" : "Person erstellen"}</h2>
				<div className="drawer__header-actions">
					{isEdit ? (
						<button type="button" className="danger">
							Person löschen
						</button>
					) : (
						""
					)}
					<button type="button" onClick={onClose}>
						X
					</button>
				</div>
			</div>
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
			<button type="button" className="drawer__save" onClick={submit}>
				Speichern
			</button>
			<div className="drawer__meta">editId: {editId ?? "create"}</div>
		</aside>
	);
}

function FamilyDrawer({ open, editId, individuals, onClose, onSaved }) {
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
		<aside className={`drawer${open ? " open" : ""}`}>
			<div className="drawer__header">
				<h2>{isEdit ? "Familie bearbeiten" : "Familie erstellen"}</h2>
				<div className="drawer__header-actions">
					{isEdit ? (
						<button type="button" className="danger">
							Familie löschen
						</button>
					) : (
						""
					)}
					<button type="button" onClick={onClose}>
						X
					</button>
				</div>
			</div>
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
			<button type="button" className="drawer__save" onClick={submit}>
				Speichern
			</button>
			<div className="drawer__meta">editId: {editId ?? "create"}</div>
		</aside>
	);
}

export default function ManagePage() {
	const [individuals, setIndividuals] = useState([]);
	const [families, setFamilies] = useState([]);
	const [personDrawer, setPersonDrawer] = useState(null);
	const [familyDrawer, setFamilyDrawer] = useState(null);

	async function loadTables() {
		const [ppl, fams] = await Promise.all([
			fetch("/api/v1/individuals").then((r) => r.json()),
			fetch("/api/v1/families").then((r) => r.json()),
		]);

		ppl.sort((a, b) => {
			const givenName = (a.given_name ?? "").localeCompare(b.given_name ?? "");

			if (givenName !== 0) return givenName;

			const surname = (a.surname ?? "").localeCompare(b.surname ?? "");

			if (surname !== 0) return surname;

			return (a.birth_date ?? "").localeCompare(b.birth_date ?? "");
		});

		setIndividuals(ppl);
		setFamilies(fams);
	}

	useEffect(() => {
		loadTables();
	}, []);

	const peopleById = new Map(individuals.map((ind) => [ind.id, ind]));

	return (
		<div className="manage-page">
			<header>
				<div>
					<h1>Personen Verwalten</h1>
				</div>
				<div className="actions">
					<a href="/">Zum Stammbaum</a>
					<button type="button" onClick={() => setPersonDrawer({})}>
						Person erstellen
					</button>
					<button type="button" onClick={() => setFamilyDrawer({})}>
						Familie erstellen
					</button>
				</div>
			</header>
			<div className="tables">
				<table>
					<thead>
						<tr>
							<th>Vorname</th>
							<th>Nachname</th>
							<th>Geboren</th>
							<th>Gestorben</th>
						</tr>
					</thead>
					<tbody>
						{individuals.map((p) => (
							<tr key={p.id}>
								<td>{p.given_name}</td>
								<td>{p.surname}</td>
								<td>{p.birth_date}</td>
								<td>{p.death_date}</td>
								<td>
									<button
										type="button"
										onClick={() => setPersonDrawer({ id: p.id })}
									>
										Bearbeiten
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<table>
					<thead>
						<tr>
							<th>Eheperson 1</th>
							<th>Eheperson 2</th>
							<th>Hochzeitsdatum</th>
						</tr>
					</thead>
					<tbody>
						{families.map((fam) => (
							<tr key={fam.id}>
								<td>{getIndividualName(fam.partner1_id, peopleById)}</td>
								<td>{getIndividualName(fam.partner2_id, peopleById)}</td>
								<td>{fam.wedding_date}</td>
								<td>
									<button
										type="button"
										onClick={() => setFamilyDrawer({ id: fam.id })}
									>
										Bearbeiten
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<IndividualDrawer
					open={!!personDrawer}
					editId={personDrawer?.id}
					onClose={() => setPersonDrawer(null)}
					onSaved={() => {
						setPersonDrawer(null);
						loadTables();
					}}
				/>
				<FamilyDrawer
					open={!!familyDrawer}
					editId={familyDrawer?.id}
					individuals={individuals}
					onClose={() => setFamilyDrawer(null)}
					onSaved={() => {
						setFamilyDrawer(null);
						loadTables();
					}}
				/>
			</div>
		</div>
	);
}
