import { useEffect, useState } from "react";
import "./ManagePage.css";
import { FamilyDrawer } from "./FamilyDrawer";
import { IndividualDrawer } from "./IndividualDrawer";

function getIndividualName(individual_id, peopleById) {
	const given_name = peopleById.get(individual_id).given_name ?? ``;
	const second_name = peopleById.get(individual_id).second_name ?? ``;
	const third_name = peopleById.get(individual_id).third_name ?? ``;
	const surname = peopleById.get(individual_id).surname ?? ``;
	return `${given_name} ${second_name} ${third_name} ${surname}`;
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
