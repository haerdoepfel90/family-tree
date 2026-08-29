import getRelatives from "../lib/relatives";

export const getIndividualDetails = async (id) => {
	const individuals_res = await fetch("/api/v1/individuals");
	const individuals = await individuals_res.json();

	const families_res = await fetch("/api/v1/families");
	const families = await families_res.json();

	const documents_res = await fetch(`/api/v1/individuals/${id}/documents`);
	const documents_full = await documents_res.json();

	const documents = documents_full.filter((doc) => doc.kind === "document");
	const images = documents_full.filter((doc) => doc.kind === "photo");

	const relatives = getRelatives(id, families);
	const peopleByID = new Map(individuals.map((p) => [p.id, p]));

	const person = peopleByID.get(Number(id));

	return {
		person,
		relatives,
		peopleByID,
		documents,
		images,
	};
};

export const updateIndividual = (id, data) =>
	fetch(`/api/v1/individuals/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

export const uploadPortrait = (id, file) => {
	const formData = new FormData();
	formData.append("file", file);
	return fetch(`/api/v1/individuals/${id}/portrait`, {
		method: "POST",
		body: formData,
	});
};
