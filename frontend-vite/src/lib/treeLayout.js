import { CARD_GAP, CARD_WIDTH, PARTNER_GAP, ROW_HEIGHT } from "./treeConstants";

function leftExtent(node) {
	if (node.type === "individual") {
		return CARD_WIDTH / 2;
	}
	if (node.type === "union") {
		return PARTNER_GAP / 2 + CARD_WIDTH;
	}
}

function rightExtent(node) {
	if (node.type === "individual") {
		return CARD_WIDTH / 2;
	}
	if (node.type === "union") {
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

export function buildTree(root, people, families, depth = 0) {
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

export function firstWalk(node) {
	if (node.children.length === 0) {
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

export function secondWalk(node, modSum = 0) {
	node.x = node.preX + modSum;
	node.y = node.depth * ROW_HEIGHT;
	for (const child of node.children) {
		secondWalk(child, modSum + node.mod);
	}
}
