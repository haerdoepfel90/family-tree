import { useEffect, useState } from "react";
import { Link } from "react-router";
import getPersonByID, { formatName } from "../lib/people";
import "./TreeIndex.css";

import { findRootFamilies } from "../lib/relatives";

export function TreeIndex() {
	const [roots, setRoots] = useState([]);
	const [peopleById, setPeopleById] = useState(new Map());

	useEffect(() => {
		(async () => {
			const [people, fams] = await Promise.all([
				fetch("/api/v1/individuals").then((r) => r.json()),
				fetch("/api/v1/families").then((r) => r.json()),
			]);
			setPeopleById(new Map(people.map((p) => [p.id, p])));
			setRoots(findRootFamilies(fams));
		})();
	}, []);

	return (
		<div className="tree-index__body">
			<div className="tree-index__header">
				Wurzelfamilien &middot; {`${roots.length}`}
			</div>
			{roots.map((root) => (
				<div className="tree-index__root-card" key={root.id}>
					<div className="tree-index__root-card-left">
						<div className="tree-index__root-card-img"></div>
						<div className="tree-index__root-card-info">
							<div>
								{`${formatName(
									getPersonByID(root.partner1_id, peopleById),
									"normal",
								)} &
								${formatName(
									getPersonByID(root.partner2_id, peopleById),
									"normal",
								)}`}
							</div>
							<div>XX Generationen &middot; XX Nachkommen</div>
						</div>
					</div>
					<div className="tree-index__root-card-right">
						<Link to={`/tree/${root.id}`}>Ansehen &rarr;</Link>
					</div>
				</div>
			))}
		</div>
	);
}
