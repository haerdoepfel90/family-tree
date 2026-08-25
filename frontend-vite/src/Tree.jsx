import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CARD_HEIGHT, CARD_WIDTH } from "./lib/treeConstants";
import { buildTree, firstWalk, secondWalk } from "./lib/treeLayout";
import { buildNodes } from "./lib/treeNodes";
import { PersonDetail } from "./PersonDetail";
import { nodeTypes } from "./treeNodes";
import "./lib/treeConstants";

export function Tree() {
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
				onNodeClick={(_event, node) => {
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
