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
import ManagePage from "./ManagePage";

const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_GAP = 100;
const PARTNER_GAP = 20;
const GAP_Y = 100;
const TREE_GAP = 200;
const ROW_HEIGHT = CARD_HEIGHT + GAP_Y;

const hiddenHandle = {
	opacity: 0,
	width: 1,
	height: 1,
	minWidth: 0,
	minHeight: 0,
	border: "none",
};

function PersonNode({ data }) {
	return (
		<div
			className="person-card"
			style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
		>
			<div className="person-card__names">
				<div>{data.given_name_full ?? ""}</div>
				<div>{data.surname}</div>
			</div>
			<hr className="person-card__rule" />
			{data.birth_date ? (
				<div className="person-card__meta person-card__meta--birth">
					<span className="person-card__meta-mark">*</span>
					<span>{data.birth_date}</span>
				</div>
			) : (
				""
			)}

			{data.death_date ? (
				<div className="person-card__meta person-card__meta--death">
					<span className="person-card__meta-mark">†</span>
					<span>{data.death_date}</span>
				</div>
			) : (
				""
			)}
			{data.maiden_name ? (
				<div className="person-card__maiden">{`geb. ${data.maiden_name}`}</div>
			) : (
				""
			)}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
		</div>
	);
}

function UnionNode() {
	return (
		<div style={{ width: 1, height: 1, position: "relative" }}>
			<Handle
				type="target"
				position={Position.Top}
				id="in"
				style={{ left: 0, top: 0, hiddenHandle }}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="out"
				style={{ left: 0, top: 0, hiddenHandle }}
			/>
		</div>
	);
}

const nodeTypes = { person: PersonNode, union: UnionNode };

function getPersonData(individual_id, peopleById) {
	return {
		label: nameOf(peopleById, individual_id),
		given_name_full: `${peopleById.get(individual_id).given_name} ${peopleById.get(individual_id).second_name ?? ""} ${peopleById.get(individual_id).third_name ?? ""}`,
		surname: peopleById.get(individual_id).surname ?? "",
		maiden_name: peopleById.get(individual_id).maiden_name ?? "",
		birth_date: peopleById.get(individual_id).birth_date?.slice(0, 4) ?? "",
		death_date: peopleById.get(individual_id).death_date?.slice(0, 4) ?? "",
	};
}

function leftExtent(node) {
	if (node.type == "individual") {
		return CARD_WIDTH / 2;
	}
	if (node.type == "union") {
		return PARTNER_GAP / 2 + CARD_WIDTH;
	}
}

function rightExtent(node) {
	if (node.type == "individual") {
		return CARD_WIDTH / 2;
	}
	if (node.type == "union") {
		return PARTNER_GAP / 2 + CARD_WIDTH;
	}
}

function separation(left, right) {
	return rightExtent(left) + CARD_GAP + leftExtent(right);
}

function nextRight(v) {
	return v.children.length > 0 ? v.children[v.children.length - 1] : v.thread;
}

function nextLeft(v) {
	return v.children.length > 0 ? v.children[0] : v.thread;
}

function moveSubtree(left, right, shift) {
	const subtrees = right.index - left.index;
	right.change = right.change - shift / subtrees;
	right.shift = right.shift + shift;
	left.change = left.change + shift / subtrees;
	right.preX = right.preX + shift;
	right.mod = right.mod + shift;
}

function executeShifts(node) {
	let shift = 0;
	let change = 0;
	const children = node.children;

	for (let i = node.children.length - 1; i >= 0; i--) {
		children[i].preX = children[i].preX + shift;
		children[i].mod = children[i].mod + shift;
		change = change + children[i].change;
		shift = shift + children[i].shift + change;
	}
}

function ancestorOf(vInsideLeft, node, defaultAncestor) {
	if (vInsideLeft.ancestor && vInsideLeft.ancestor.parent === node.parent) {
		return vInsideLeft.ancestor;
	}
	return defaultAncestor;
}

function apportion(node, defaultAncestor) {
	const leftSibling = node.leftSibling;
	if (!leftSibling) {
		return defaultAncestor;
	}

	let vInsideRight = node;
	let sInsideRight = node.mod;
	let vOutsideRight = node;
	let sOutsideRight = node.mod;
	let vInsideLeft = leftSibling;
	let sInsideLeft = leftSibling.mod;
	let vOutsideLeft = node.parent.children[0];
	let sOutsideLeft = vOutsideLeft.mod;

	while (nextRight(vInsideLeft) && nextLeft(vInsideRight)) {
		vInsideLeft = nextRight(vInsideLeft);
		vInsideRight = nextLeft(vInsideRight);
		vOutsideLeft = nextLeft(vOutsideLeft);
		vOutsideRight = nextRight(vOutsideRight);
		vOutsideRight.ancestor = node;

		const shift =
			vInsideLeft.preX +
			sInsideLeft -
			(vInsideRight.preX + sInsideRight) +
			separation(vInsideLeft, vInsideRight);

		if (shift > 0) {
			moveSubtree(ancestorOf(vInsideLeft, node, defaultAncestor), node, shift);
			sInsideRight += shift;
			sOutsideRight += shift;
		}

		sInsideLeft = sInsideLeft + vInsideLeft.mod;
		sInsideRight = sInsideRight + vInsideRight.mod;
		sOutsideLeft = sOutsideLeft + vOutsideLeft.mod;
		sOutsideRight = sOutsideRight + vOutsideRight.mod;
	}

	if (nextRight(vInsideLeft) && !nextRight(vOutsideRight)) {
		vOutsideRight.thread = nextRight(vInsideLeft);
		vOutsideRight.mod = vOutsideRight.mod + sInsideLeft - sOutsideRight;
	}

	if (nextLeft(vInsideRight) && !nextLeft(vOutsideLeft)) {
		vOutsideLeft.thread = nextLeft(vInsideRight);
		vOutsideLeft.mod = vOutsideLeft.mod + sInsideRight - sOutsideLeft;
	}

	defaultAncestor = node;

	return defaultAncestor;
}

function findRootFamilies(people, families) {
	// find root families by checking that both partners of a family are not a child of any other family

	const childIds = new Set(); // set which contains all individual_ids present in any family
	for (const fam of families) {
		for (const childId of fam.children) {
			childIds.add(childId);
		}
	}
	// console.log(childIds);

	return families.filter(
		(
			fam, // filter those families where neither partner1_id and partner2_id are not present in childIds
		) => !childIds.has(fam.partner1_id) && !childIds.has(fam.partner2_id),
	);
}

function buildTree(root, people, families, depth = 0) {
	// returns a nested json of a familiy tree

	const tree = {
		id: `f${root.id}`,
		type: "union",
		family_id: root.id,
		partner1_id: root.partner1_id,
		partner2_id: root.partner2_id,
		children: [],

		// layout
		depth: depth,
		preX: 0,
		mod: 0,
		shift: 0,
		change: 0,
		ancestor: null,
		thread: null,
		leftSibling: null,
	};

	for (const childId of root.children ?? []) {
		// append a child element for each child of the root family

		const childsFamily = families.find(
			// check if child has its own family
			(fam) => fam.partner1_id === childId || fam.partner2_id === childId,
		);

		if (childsFamily) {
			// skipping leaf children
			// console.log('child has a family', childsFamily.id);
			// console.log("childsfamily:", childsFamily);

			const childTree = buildTree(
				// append the childs own tree
				childsFamily,
				people,
				families,
				depth + 1,
			);

			tree.children.push(childTree);
		} else {
			tree.children.push({
				id: `i${childId}`,
				type: "individual",
				individual_id: childId,
				children: [],

				// layout
				depth: depth + 1,
				preX: 0,
				mod: 0,
				shift: 0,
				change: 0,
				ancestor: null,
				thread: null,
				leftSibling: null,
			});
		}
	}

	// assign leftSiblings and parent node for each child
	for (let i = 0; i < tree.children.length; i++) {
		tree.children[i].leftSibling = i > 0 ? tree.children[i - 1] : null;
		tree.children[i].parent = tree;
		tree.children[i].index = i;
	}

	return tree;
}

function firstWalk(node) {
	if (node.children.length == 0) {
		// if node has any children

		if (node.leftSibling) {
			// if node has leftSibling --> separate from it
			node.preX = node.leftSibling.preX + separation(node.leftSibling, node);
		} else {
			// if no leftSibling start at 0
			node.preX = 0;
		}

		return;
	}

	let defaultAncestor = node.children[0];

	for (const child of node.children) {
		firstWalk(child);
		defaultAncestor = apportion(child, defaultAncestor);
	}

	executeShifts(node);

	const midpoint =
		(node.children[0].preX + node.children[node.children.length - 1].preX) / 2;

	if (node.leftSibling) {
		node.preX = node.leftSibling.preX + separation(node.leftSibling, node);
		node.mod = node.preX - midpoint;
	} else {
		node.preX = midpoint;
		node.mod = 0;
	}
}

function secondWalk(node, modSum = 0) {
	node.x = node.preX + modSum;
	node.y = node.depth * ROW_HEIGHT;
	for (const child of node.children) {
		secondWalk(child, modSum + node.mod);
	}
}

function nameOf(peopleById, id) {
	const p = peopleById.get(id);
	return p ? `${p.given_name} ${p.surname}` : `#${id}`;
}

function buildNodes(tree, peopleById, nodes = [], edges = []) {
	switch (tree.type) {
		case "individual": {
			nodes.push({
				id: tree.id,
				position: {
					x: anchorToTopLeftX(tree.x, CARD_WIDTH),
					y: tree.y,
				},
				data: getPersonData(tree.individual_id, peopleById),
				type: "person",
			});

			if (tree.parent) {
				edges.push({
					id: `${tree.parent.id}->${tree.id}`,
					source: tree.parent.id,
					sourceHandle: "out",
					target: tree.id,
					targetHandle: tree.type === "union" ? "in" : "top",
					type: "step",
				});
			}

			break;
		}

		case "union": {
			nodes.push({
				id: tree.id,
				position: {
					x: tree.x,
					y: tree.y + CARD_HEIGHT / 2,
				},
				data: { label: "union" },
				type: "union",
			});

			if (tree.partner1_id) {
				nodes.push({
					id: `i${tree.partner1_id}`,
					position: {
						x: offsetPartnerLeft(
							anchorToTopLeftX(tree.x, CARD_WIDTH),
							PARTNER_GAP,
							CARD_WIDTH,
						),
						y: tree.y,
					},
					data: getPersonData(tree.partner1_id, peopleById),
					type: "person",
				});
			}

			if (tree.partner2_id) {
				nodes.push({
					id: `i${tree.partner2_id}`,
					position: {
						x: offsetPartnerRight(
							anchorToTopLeftX(tree.x, CARD_WIDTH),
							PARTNER_GAP,
							CARD_WIDTH,
						),
						y: tree.y,
					},
					data: getPersonData(tree.partner2_id, peopleById),
					type: "person",
				});
			}

			edges.push({
				id: `u${tree.family_id}`,
				source: `i${tree.partner1_id}`,
				sourceHandle: "right",
				target: `i${tree.partner2_id}`,
				targetHandle: "left",
				type: "straight",
			});

			if (tree.parent) {
				edges.push({
					id: `${tree.parent.id}->${tree.id}`,
					source: tree.parent.id,
					sourceHandle: "out",
					target: tree.id,
					targetHandle: tree.type === "union" ? "in" : "top",
					type: "step",
				});
			}

			break;
		}
	}

	for (const child of tree.children) {
		buildNodes(child, peopleById, nodes, edges);
	}
}

function anchorToTopLeftX(x, width) {
	return x - width / 2;
}
function offsetPartnerLeft(x, PARTNER_GAP, CARD_WIDTH) {
	return x - PARTNER_GAP / 2 - CARD_WIDTH / 2;
}
function offsetPartnerRight(x, PARTNER_GAP, CARD_WIDTH) {
	return x + PARTNER_GAP / 2 + CARD_WIDTH / 2;
}

function Tree() {
	const { familyId } = useParams();
	const [rfNodes, setRfNodes] = useState([]);
	const [rfEdges, setRfEdges] = useState([]);
	const [selected, setSelected] = useState(null);
	const [families, setFamilies] = useState([]);
	const [individuals, setIndividuals] = useState([]);
	const { setCenter } = useReactFlow();

	useEffect(() => {
		(async () => {
			const [people, fams] = await Promise.all([
				fetch("/api/v1/individuals").then((r) => r.json()),
				fetch("/api/v1/families").then((r) => r.json()),
			]);
			setIndividuals(people);
			setFamilies(fams);

			const peopleById = new Map(people.map((p) => [p.id, p]));
			const root = fams.find((fam) => fam.id === Number(familyId));
			if (!root) return;

			const tree = buildTree(root, people, fams);
			firstWalk(tree);
			secondWalk(tree, 0);

			const nodes = [];
			const edges = [];
			buildNodes(tree, peopleById, nodes, edges);

			setRfNodes(nodes);
			setRfEdges(edges);
		})();
	}, [familyId]);

	const peopleById = new Map(individuals.map((p) => [p.id, p]));

	function focusNode(nodeId) {
		const node = rfNodes.find((n) => n.id === nodeId);
		if (!node) return;

		setCenter(
			node.position.x + CARD_WIDTH / 2,
			node.position.y + CARD_HEIGHT / 2,
			{ zoom: 1, duration: 800 },
		);
	}

	return (
		<div className="tree-canvas">
			<ReactFlow
				nodes={rfNodes}
				edges={rfEdges}
				nodeTypes={nodeTypes}
				fitView={{ maxZoom: 1 }}
				minZoom={0.1}
				onNodeClick={(event, node) => {
					if (node.type === "person") {
						const id = Number(node.id.slice(1));
						setSelected(id);
						focusNode(node.id);
					}
				}}
			>
				<Background color="#cccccc" variant={BackgroundVariant.Dots} />
				<Controls />
			</ReactFlow>

			{selected != null && (
				<PersonDetail
					id={selected}
					families={families}
					peopleById={peopleById}
					onClose={() => setSelected(null)}
					onSelect={(newId) => {
						setSelected(newId);
						focusNode(`i${newId}`);
					}}
				/>
			)}
		</div>
	);
}

function PersonDetail({ id, families, peopleById, onClose, onSelect }) {
	const [person, setPerson] = useState(null);
	useEffect(() => {
		if (id == null) return;
		fetch(`/api/v1/individuals/${id}`)
			.then((r) => r.json())
			.then(setPerson);
	}, [id]);

	if (!person) return <aside className="person-detail open" />;

	const childOf = families.find((f) => f.children?.includes(id));
	const parents = childOf
		? [childOf.partner1_id, childOf.partner2_id].filter(Boolean)
		: [];
	const siblings = childOf ? childOf.children.filter((c) => c !== id) : [];

	const partnerIn = families.filter(
		(f) => f.partner1_id === id || f.partner2_id === id,
	);
	const spouses = partnerIn
		.map((f) => (f.partner1_id === id ? f.partner2_id : f.partner1_id))
		.filter(Boolean);
	const children = partnerIn.flatMap((f) => f.children ?? []);

	return (
		<aside className="person-detail open">
			<button className="person-detail__close" onClick={onClose}>
				×
			</button>
			<img
				className="person-detail__portrait"
				src={person.portrait_url || placeholderAvatar}
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
				{parents.length > 0 && (
					<>
						<div className="person-detail__label">Eltern</div>
						<div>
							{parents.map((pid) => {
								const p = peopleById.get(pid);
								if (!p) return null;
								return (
									<button
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

				{siblings.length > 0 && (
					<>
						<div className="person-detail__label">Geschwister</div>
						<div>
							{siblings.map((sid) => {
								const s = peopleById.get(sid);
								if (!s) return null;
								return (
									<button
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

				{spouses.length > 0 && (
					<>
						<div className="person-detail__label">Partner</div>
						<div>
							{spouses.map((sid) => {
								const s = peopleById.get(sid);
								if (!s) return null;
								return (
									<button
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

				{children.length > 0 && (
					<>
						<div className="person-detail__label">Kinder</div>
						<div>
							{children.map((cid) => {
								const c = peopleById.get(cid);
								if (!c) return null;
								return (
									<button
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
			setRoots(findRootFamilies(people, fams));
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
