export default function getRelatives(id, families) {
	id = Number(id);

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

	return { parents, siblings, spouses, children };
}

export function findRootFamilies(families) {
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
