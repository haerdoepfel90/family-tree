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

export const getDocument = (id) =>
	fetch(`/api/v1/documents/${id}`).then((r) => r.json());

export const updateDocument = (id, data) =>
	fetch(`/api/v1/documents/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

export const linkDocument = (id, subject_type, subject_id, role) => {
	const body = {
		subject_type,
		subject_id,
		role,
	};
	return fetch(`/api/v1/documents/${id}/links`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
};

export const unlinkDocument = (id, link) => {
	return fetch(`/api/v1/documents/${id}/links`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(link),
	});
};

export const getIndividuals = async () => {
	const people = await fetch("/api/v1/individuals").then((r) => r.json());
	const peopleByID = new Map(people.map((p) => [p.id, p]));

	return {
		people,
		peopleByID,
	};
};
export const uploadDocument = (file) => {
	const formData = new FormData();
	formData.append("file", file);
	return fetch("/api/v1/documents", {
		method: "POST",
		body: formData,
	}).then((r) => r.json());
};
