export default function getPersonByID(id, peopleByID) {
	return peopleByID.get(Number(id)) ?? null;
}

export function formatName(person, option = "surname") {
	if (!person) return "";

	switch (option) {
		case "given":
			return `${person.given_name ?? ""}`;

		case "normal":
			return `${person.given_name ?? ""} ${person.surname ?? ""}`;

		case "full":
			return `${person.given_name ?? ""} ${person.second_name ?? ""} ${person.third_name ?? ""} ${person.surname ?? ""}`;

		case "surname":
			return `${person.surname}`;

		default:
			break;
	}
}
