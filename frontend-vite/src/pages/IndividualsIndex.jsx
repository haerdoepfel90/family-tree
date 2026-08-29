import "./IndividualsIndex.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import placeholderAvatar from "./../assets/placeholder-avatar.jpg";
import { formatName } from "../lib/people";

export function IndividualsIndex() {
	const [people, setPeople] = useState([]);

	useEffect(() => {
		fetch("/api/v1/individuals")
			.then((r) => r.json())
			.then((data) => {
				setPeople(data);
			});
	}, []);

	return (
		<div className="individuals-index__body">
			<div className="individuals-index__header">Personen &middot; XX</div>
			{people.map((p) => (
				<div key={p.id} className="individuals-index__person-card">
					<div className="individuals-index__person-card-left">
						<div className="individuals-index__person-card-img">
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
						<Link to={`/detail/${p.id}`}>Ansehen &rarr;</Link>
					</div>
				</div>
			))}
		</div>
	);
}
