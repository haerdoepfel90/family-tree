import { useEffect, useState } from "react";
import "../HomePage.css";
import placeholderAvatar from "../assets/placeholder-avatar.jpg";
import { PersonCardPortrait } from "../components/ui/elements.jsx";
import getPersonByID, { formatName } from "../lib/people.js";

export function HomePage() {
	const persons = [
		{
			id: 74,
			given_name: "Ingrid",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: "Schmid",
			sex: "female",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 41,
			given_name: "Mael",
			second_name: null,
			third_name: null,
			surname: "Fleischli",
			maiden_name: null,
			sex: "male",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 84,
			given_name: "Mona",
			second_name: null,
			third_name: null,
			surname: "Stier",
			maiden_name: null,
			sex: "female",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 85,
			given_name: "Rahel",
			second_name: null,
			third_name: null,
			surname: "Stier",
			maiden_name: null,
			sex: "female",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 44,
			given_name: "Roland",
			second_name: null,
			third_name: null,
			surname: "Fleischli",
			maiden_name: null,
			sex: "male",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 51,
			given_name: "Rolf",
			second_name: null,
			third_name: null,
			surname: "Müller",
			maiden_name: null,
			sex: "male",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 82,
			given_name: "Susanne",
			second_name: null,
			third_name: null,
			surname: "Stier",
			maiden_name: "Dössegger",
			sex: "female",
			birth_date: null,
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 13,
			given_name: "Jakob",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: null,
			sex: "male",
			birth_date: "1894-01-01",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 14,
			given_name: "Rosa",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: "Lüscher",
			sex: "female",
			birth_date: "1903-07-16",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 31,
			given_name: "Otto",
			second_name: null,
			third_name: null,
			surname: "Bühler",
			maiden_name: null,
			sex: "male",
			birth_date: "1921-04-29",
			birth_place: null,
			death_date: "1975-01-02",
			death_place: null,
			portrait_url: null,
		},
		{
			id: 16,
			given_name: "Willi",
			second_name: null,
			third_name: null,
			surname: "Suter",
			maiden_name: null,
			sex: "''",
			birth_date: "1923-07-09",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 15,
			given_name: "Frida",
			second_name: null,
			third_name: null,
			surname: "Suter",
			maiden_name: "Bär",
			sex: "female",
			birth_date: "1926-01-22",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 17,
			given_name: "Otto",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: null,
			sex: "male",
			birth_date: "1927-02-12",
			birth_place: null,
			death_date: "2014-11-20",
			death_place: "Schöftland",
			portrait_url: null,
		},
		{
			id: 30,
			given_name: "Vreni",
			second_name: null,
			third_name: null,
			surname: "Bühler",
			maiden_name: "Bär",
			sex: "female",
			birth_date: "1928-02-21",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 28,
			given_name: "Hans",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: null,
			sex: "male",
			birth_date: "1928-02-27",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 29,
			given_name: "Leny",
			second_name: null,
			third_name: null,
			surname: "Bär",
			maiden_name: "Dätwyler",
			sex: "female",
			birth_date: "1929-11-22",
			birth_place: null,
			death_date: "1998-10-06",
			death_place: null,
			portrait_url: null,
		},
		{
			id: 18,
			given_name: "Rosa",
			second_name: "Maria",
			third_name: null,
			surname: "Bär",
			maiden_name: "Baumberger",
			sex: "female",
			birth_date: "1930-06-18",
			birth_place: null,
			death_date: "2025-06-29",
			death_place: "Muhen",
			portrait_url: null,
		},
		{
			id: 81,
			given_name: "Alice",
			second_name: null,
			third_name: null,
			surname: "Dössegger",
			maiden_name: null,
			sex: "female",
			birth_date: "1936-12-08",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: null,
		},
		{
			id: 1,
			given_name: "Matthias",
			second_name: null,
			third_name: null,
			surname: "Dössegger",
			maiden_name: null,
			sex: "male",
			birth_date: "1967-10-22",
			birth_place: null,
			death_date: null,
			death_place: null,
			portrait_url: "/media/portraits/1_portrait.jpg",
		},
	];

	// function onClickPerson()

	return (
		<div className="homepage__body">
			<div className="homepage__content-left">
				<div className="homepage__title">Familie Dössegger</div>
				<div className="homepage__stats">
					34 Personen &middot; 11 Familien &middot; 8 Dokumente
				</div>
				<div className="homepage__person-list">
					{persons.map((p) => (
						<PersonCardPortrait
							key={p.id}
							id={p.id}
							label={formatName(p, "given")}
							portrait={p.portrait_url || placeholderAvatar}
							linkAll={false}
						/>
					))}
					<PersonCardPortrait label={"Alle"} linkAll={true} />
				</div>
			</div>
			<div className="homepage__content-right">
				<div className="homepage__information-card">
					<div className="homepage__information-card-title">AN DIESEM TAG</div>
					<div className="homepage__information-card-note">
						Noch nicht implementiert.
					</div>
				</div>
			</div>
		</div>
	);
}
