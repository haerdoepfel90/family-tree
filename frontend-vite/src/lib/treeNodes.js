import { formatName } from "./people";
import { CARD_HEIGHT, CARD_WIDTH, PARTNER_GAP } from "./treeConstants";

export function buildNodes(tree, peopleById, nodes = [], edges = []) {
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

function getPersonData(individual_id, peopleById) {
	const person = peopleById.get(individual_id);
	return {
		label: formatName(person, "normal"),
		given_name_full: formatName(person, "given"),
		surname: person.surname ?? "",
		maiden_name: person.maiden_name ?? "",
		birth_date: person.birth_date?.slice(0, 4) ?? "",
		death_date: person.death_date?.slice(0, 4) ?? "",
	};
}
