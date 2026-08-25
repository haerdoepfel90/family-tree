import {
	Background,
	BackgroundVariant,
	Controls,
	Handle,
	Position,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import placeholderAvatar from "./assets/placeholder-avatar.jpg";
import "@xyflow/react/dist/style.css";
import "./Tree.css";
import DetailPage from "./DetailPage";
import Layout from "./Layout";
import { findRootFamilies } from "./lib/relatives";
import ManagePage from "./ManagePage";
import { Tree } from "./Tree";

function nameOf(peopleById, id) {
	const p = peopleById.get(id);
	return p ? `${p.given_name} ${p.surname}` : `#${id}`;
}

function TreeIndex() {
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
						{nameOf(peopleById, root.partner1_id)} &amp;{" "}
						{nameOf(peopleById, root.partner2_id)}
					</Link>
				</li>
			))}
		</ul>
	);
}

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<div>LANDING PAGE</div>} />
				<Route path="/trees" element={<TreeIndex />} />
				<Route
					path="/tree/:familyId"
					element={
						<ReactFlowProvider>
							<Tree />
						</ReactFlowProvider>
					}
				/>
				<Route path="/detail/:id" element={<DetailPage />} />
				<Route path="/manage" element={<ManagePage />} />
			</Route>
		</Routes>
	);
}
