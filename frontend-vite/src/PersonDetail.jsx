import { useEffect, useState } from "react";
import { Link } from "react-router";
import placeholderAvatar from "./assets/placeholder-avatar.jpg";
import getRelatives from "./lib/relatives";

export function PersonDetail({ id, families, peopleById, onClose, onSelect }) {
	const [person, setPerson] = useState(null);
	useEffect(() => {
		if (id == null) return;
		fetch(`/api/v1/individuals/${id}`)
			.then((r) => r.json())
			.then(setPerson);
	}, [id]);

	if (!person) return <aside className="person-detail open" />;

	const relatives = getRelatives(id, families);

	return (
		<aside className="person-detail open">
			<button type="button" className="person-detail__close" onClick={onClose}>
				×
			</button>
			<img
				className="person-detail__portrait"
				src={person.portrait_url || placeholderAvatar}
				alt="portrait"
			/>
			<h2>
				{person.given_name} {person.second_name ?? ""} {person.surname}
			</h2>
			{person.maiden_name && (
				<div className="person-detail__maiden">geb. {person?.maiden_name}</div>
			)}
			<section>
				<div className="person-detail__label">Lebensdaten</div>
				{person.birth_date && (
					<div>
						<span className="person-detail__mark">∗</span>
						<span>
							{person.birth_date}
							{person.birth_place ? `, ${person.birth_place}` : ""}
						</span>
					</div>
				)}
				{person.death_date && (
					<div>
						<span className="person-detail__mark">†</span>
						<span>
							{person.death_date}
							{person.death_place ? `, ${person.death_place}` : ""}
						</span>
					</div>
				)}
			</section>
			<section>
				{relatives.parents.length > 0 && (
					<>
						<div className="person-detail__label">Eltern</div>
						<div>
							{relatives.parents.map((pid) => {
								const p = peopleById.get(pid);
								if (!p) return null;
								return (
									<button
										type="button"
										key={pid}
										className="relative-button"
										onClick={() => onSelect(pid)}
									>
										{p.given_name} {p.surname}
									</button>
								);
							})}
						</div>
					</>
				)}

				{relatives.siblings.length > 0 && (
					<>
						<div className="person-detail__label">Geschwister</div>
						<div>
							{relatives.siblings.map((sid) => {
								const s = peopleById.get(sid);
								if (!s) return null;
								return (
									<button
										type="button"
										key={sid}
										className="relative-button"
										onClick={() => onSelect(sid)}
									>
										{s.given_name} {s.surname}
									</button>
								);
							})}
						</div>
					</>
				)}

				{relatives.spouses.length > 0 && (
					<>
						<div className="person-detail__label">Partner</div>
						<div>
							{relatives.spouses.map((sid) => {
								const s = peopleById.get(sid);
								if (!s) return null;
								return (
									<button
										type="button"
										key={sid}
										className="relative-button"
										onClick={() => onSelect(sid)}
									>
										{s.given_name} {s.surname}
									</button>
								);
							})}
						</div>
					</>
				)}

				{relatives.children.length > 0 && (
					<>
						<div className="person-detail__label">Kinder</div>
						<div>
							{relatives.children.map((cid) => {
								const c = peopleById.get(cid);
								if (!c) return null;
								return (
									<button
										type="button"
										key={cid}
										className="relative-button"
										onClick={() => onSelect(cid)}
									>
										{c.given_name} {c.surname}
									</button>
								);
							})}
						</div>
					</>
				)}
				<div>
					<Link to={`/detail/${person.id}`}>Detail Page</Link>
				</div>
			</section>
		</aside>
	);
}
