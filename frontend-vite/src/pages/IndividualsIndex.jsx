import "./IndividualsIndex.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import placeholderAvatar from "./../assets/placeholder-avatar.jpg";
import { formatName } from "../lib/people";
import { getIndividualsIndexContent } from "../services/api";

export function IndividualsIndex() {
	const [people, setPeople] = useState([]);

	useEffect(() => {
		getIndividualsIndexContent().then(setPeople);
	}, []);

	return (
		<div className="individuals-index__body">
			<div className="individuals-index__header">{`Personen \u00B7 ${people.length}`}</div>
			{people.map((p) => (
				<div key={p.id} className="individuals-index__person-card">
					<div className="individuals-index__person-card-left">
						<div
							className={
								p.portrait_url
									? "individuals-index__person-card-img individuals-index__person-card-img--has-portrait"
									: "individuals-index__person-card-img"
							}
						>
							<img
								src={p.portrait_url || placeholderAvatar}
								alt={formatName(p, "normal")}
							/>
						</div>
						<div className="individuals-index__person-card-info">
							<div className="individuals-index__person-card-info-label">
								{formatName(p, "full")}
							</div>
							<div className="individuals-index__person-card-info-meta">
								{p.birth_date && (
									<>
										<span className="individuals-index__person-card-info-mark">
											*
										</span>{" "}
										{p.birth_date}
									</>
								)}
								{p.maiden_name ? `, geb. ${p.maiden_name}` : ""}
							</div>
						</div>
					</div>
					<div className="individuals-index__person-card-right">
						<Link to={`/individual/detail/${p.id}`}>Ansehen &rarr;</Link>
					</div>
				</div>
			))}
		</div>
	);
}
