import { useEffect, useState } from "react";
import "../HomePage.css";
import placeholderAvatar from "../assets/placeholder-avatar.jpg";
import { PersonCardPortrait } from "../components/ui/elements.jsx";
import getPersonByID, { formatName } from "../lib/people.js";

export function HomePage() {
	const [persons, setPersons] = useState([]);
	const [stats, setStats] = useState({});

	useEffect(() => {
		fetch("/api/v1/individuals")
			.then((r) => r.json())
			.then((all) => {
				const shuffled = [...all].sort(() => Math.random() - 0.5);
				setPersons(shuffled.slice(0, 23));
			});
	}, []);

	return (
		<div className="homepage__body">
			<div className="homepage__content-left">
				<div className="homepage__title">Familie Dössegger</div>
				<div className="homepage__stats">
					XX Personen &middot; XX Familien &middot; XX Dokumente
				</div>
				<div className="homepage__person-list">
					{persons.map((p) => (
						<PersonCardPortrait
							key={p.id}
							id={p.id}
							label={formatName(p, "given")}
							portrait={p.portrait_url || placeholderAvatar}
							linkAll={false}
						/>
					))}
					<PersonCardPortrait label={"Alle"} linkAll={true} />
				</div>
			</div>
			<div className="homepage__content-right">
				<div className="homepage__information-card">
					<div className="homepage__information-card-title">AN DIESEM TAG</div>
					<div className="homepage__information-card-note">
						Noch nicht implementiert.
					</div>
				</div>
			</div>
		</div>
	);
}
