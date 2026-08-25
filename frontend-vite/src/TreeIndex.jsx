import { useEffect, useState } from "react";
import { Link } from "react-router";
import getPersonByID, { formatName } from "./lib/people";

import { findRootFamilies } from "./lib/relatives";

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
		<ul className="tree-index">
			{roots.map((root) => (
				<li key={root.id}>
					<Link to={`/tree/${root.id}`}>
						{formatName(getPersonByID(root.partner1_id, peopleById), "normal")}{" "}
						&amp;{" "}
						{formatName(getPersonByID(root.partner2_id, peopleById), "normal")}
					</Link>
				</li>
			))}
		</ul>
	);
}
