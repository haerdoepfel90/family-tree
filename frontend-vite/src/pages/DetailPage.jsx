import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import placeholderAvatar from "../assets/placeholder-avatar.jpg";
import "../DetailPage.css";
import getPersonByID, { formatName } from "../lib/people";
import getRelatives from "../lib/relatives";

export default function DetailPage() {
	const { id } = useParams();
	const [person, setPerson] = useState(null);
	const [individuals, setIndividuals] = useState([]);
	const [families, setFamilies] = useState([]);
	const [documents, setDocuments] = useState([]);

	useEffect(() => {
		if (id == null) return;
		fetch(`/api/v1/individuals/${id}`)
			.then((r) => r.json())
			.then(setPerson);
	}, [id]);

	useEffect(() => {
		fetch("/api/v1/families")
			.then((r) => r.json())
			.then(setFamilies);
	}, []);

	useEffect(() => {
		fetch("/api/v1/individuals")
			.then((r) => r.json())
			.then(setIndividuals);
	}, []);

	useEffect(() => {
		if (id == null) return;
		fetch(`/api/v1/individuals/${id}/documents`)
			.then((r) => r.json())
			.then(setDocuments);
	}, [id]);

	const peopleById = new Map(individuals.map((p) => [p.id, p]));
	const relatives = getRelatives(id, families);

	if (!person) return <div>Loading...</div>;

	return (
		<div>
			<div>/detail/individual/{formatName(person, "full")}</div>

			<div className="detail-page__body">
				<div className="detail-page__card detail-page__person-card">
					<div>
						<img
							src={person.portrait_url || placeholderAvatar}
							className="detail-page__avatar"
							alt="portrait"
						/>
						<div>Generation --X--</div>
					</div>

					<div>
						<div>{formatName(person, "full")}</div>
						{person.maiden_name && <div>geb. {person.maiden_name}</div>}
						{person.birth_date && (
							<div>
								* {person.birth_date}
								{person.birth_place ? `, ${person.birth_place}` : ""}
							</div>
						)}
						{person.death_date && (
							<div>
								† {person.death_date}
								{person.death_place ? `, ${person.death_place}` : ""}
							</div>
						)}
					</div>
				</div>
				<div className="detail-page__card-row">
					<div className="detail-page__card">
						<div className="detail-page__card-title">Familie</div>
						{relatives.parents.length > 0 && (
							<div>
								<div className="detail-page__label">Eltern</div>
								{relatives.parents.map((pid) => (
									<Link
										key={pid}
										style={{ display: "block" }}
										to={`/detail/${pid}`}
									>
										{formatName(getPersonByID(pid, peopleById), "normal")}
									</Link>
								))}
							</div>
						)}
						{relatives.siblings.length > 0 && (
							<div>
								<div className="detail-page__label">Geschwister</div>
								{relatives.siblings.map((sid) => (
									<Link
										key={sid}
										style={{ display: "block" }}
										to={`/detail/${sid}`}
									>
										{formatName(getPersonByID(sid, peopleById), "normal")}
									</Link>
								))}
							</div>
						)}
						{relatives.spouses.length > 0 && (
							<div>
								<div className="detail-page__label">Partner</div>
								{relatives.spouses.map((sid) => (
									<Link
										key={sid}
										style={{ display: "block" }}
										to={`/detail/${sid}`}
									>
										{formatName(getPersonByID(sid, peopleById), "normal")}
									</Link>
								))}
							</div>
						)}
						{relatives.children.length > 0 && (
							<div>
								<div className="detail-page__label">Kinder</div>
								{relatives.children.map((cid) => (
									<Link
										key={cid}
										style={{ display: "block" }}
										to={`/detail/${cid}`}
									>
										{formatName(getPersonByID(cid, peopleById), "normal")}
									</Link>
								))}
							</div>
						)}
					</div>
					<div className="detail-page__card">
						<div className="detail-page__card-title">Lebensdaten</div>
						{person.birth_date && (
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									className="detail-page__label"
									style={{ minWidth: "80px" }}
								>
									Geboren
								</div>
								<div>
									{person.birth_date}
									{person.birth_place ? `, ${person.birth_place}` : ""}
								</div>
							</div>
						)}
						{person.death_date && (
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									className="detail-page__label"
									style={{ minWidth: "80px" }}
								>
									Gestorben
								</div>
								<div>
									{person.death_date}
									{person.death_place ? `, ${person.death_place}` : ""}
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="detail-page__card">
					<div className="detail-page__card-title">Dokumente</div>
					{documents.map((doc) => (
						<a
							key={doc.id}
							style={{ display: "block" }}
							href={`/media/documents/${doc.uuid}${doc.ext}`}
							target="_blank"
							rel="noreferrer"
						>
							{`${doc.display_name} - ${doc.date.slice(0, 4)}` || doc.uuid}
						</a>
					))}
				</div>
			</div>
		</div>
	);
}
