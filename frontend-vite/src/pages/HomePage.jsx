import { use, useEffect, useState } from "react";
import "../HomePage.css";
import placeholderAvatar from "../assets/placeholder-avatar.jpg";
import { PersonCardPortrait } from "../components/ui/elements.jsx";
import { formatName } from "../lib/people.js";
import { getHomePageContent } from "../services/api.js";

export function HomePage() {
	const [persons, setPersons] = useState([]);
	const [statistics, setStatistics] = useState({
		counts: { individuals: 0, families: 0, documents: 0 },
	});

	useEffect(() => {
		getHomePageContent().then(({ people, stats }) => {
			setPersons(people);
			setStatistics(stats);
		});
	}, []);

	return (
		<div className="homepage__body">
			<div className="homepage__content-left">
				<div className="homepage__title">Familie Dössegger</div>
				<div className="homepage__stats">
					{`${statistics.counts.individuals} Personen \u00B7 ${statistics.counts.families} Familien \u00B7 ${statistics.counts.documents} Dokumente`}
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
