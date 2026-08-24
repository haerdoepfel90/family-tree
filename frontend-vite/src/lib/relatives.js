export default function getRelatives(id, families) {
  id = Number(id);

  const childOf = families.find(f => f.children?.includes(id));
  const parents = childOf ? [childOf.partner1_id, childOf.partner2_id].filter(Boolean) : [];
  const siblings = childOf ? childOf.children.filter(c => c !== id) : [];

  const partnerIn = families.filter(f => f.partner1_id === id || f.partner2_id === id);
  const spouses = partnerIn.map(f => (f.partner1_id === id ? f.partner2_id : f.partner1_id)).filter(Boolean);
  const children = partnerIn.flatMap(f => f.children ?? []);

  return { parents, siblings, spouses, children };
}