import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import placeholderAvatar from "./../assets/placeholder-avatar.jpg";
import "./IndividualDetail.css";
import { DocumentTile, ImageTile } from "../components/ui/elements";
import getPersonByID, { formatName } from "../lib/people";
import { getIndividualDetails } from "../services/api";

export default function IndividualDetail() {
	const { id } = useParams();
	const [details, setDetails] = useState(null);

	useEffect(() => {
		getIndividualDetails(id).then(setDetails);
	}, [id]);

	if (!details) return <div>Lädt...</div>;

	const { person, relatives, peopleByID, documents, images } = details;

	return (
		<div className="individual-detail__body">
			<div className="individual-detail__top-card">
				<div className="individual-detail__top-card-left">
					<div className="individual-detail__portrait">
						<img
							src={
								person.portrait_url ? person.portrait_url : placeholderAvatar
							}
							alt="portrait"
						/>
					</div>
				</div>
				<div className="individual-detail__top-card-right">
					<div className="individual-detail__top-card-name">
						{formatName(person, "full")}
					</div>
					{person.maiden_name && (
						<div className="individual-detail__top-card-maiden">
							{`geb. ${person.maiden_name}`}
						</div>
					)}
					{person.birth_date && (
						<div className="individual-detail__top-card-lifespan">
							<div className="individual-detail__top-card-birth">
								<span className="individual-detail__mark">&#8727;</span>
								{person.birth_date}
								{person.birth_place && `, ${person.birth_place}`}
							</div>
							<div className="individual-detail__top-card-death">
								<span className="individual-detail__mark">&dagger;</span>
								{person.death_date ? (
									<>
										{person.death_date}
										{person.death_place && `, ${person.death_place}`}
									</>
								) : (
									"—"
								)}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="individual-detail__second-row">
				<div className="individual-detail__family-card">
					<div className="individual-detail__family-card-title">Familie</div>
					{relatives.parents?.length > 0 && (
						<div className={"individuals-detail__family-card-relatives-row"}>
							<div className="individuals-detail__family-card-label">
								Eltern
							</div>
							{relatives.parents.map((pid) => (
								<Link
									className="individual-detail__family-card-name"
									to={`/individual/detail/${pid}`}
									key={pid}
								>
									{formatName(getPersonByID(pid, peopleByID), "normal")}
								</Link>
							))}
						</div>
					)}
					{relatives.spouses?.length > 0 && (
						<div className={"individuals-detail__family-card-relatives-row"}>
							<div className="individuals-detail__family-card-label">
								Partner
							</div>
							{relatives.spouses.map((pid) => (
								<Link
									className="individual-detail__family-card-name"
									to={`/individual/detail/${pid}`}
									key={pid}
								>
									{formatName(getPersonByID(pid, peopleByID), "normal")}
								</Link>
							))}
						</div>
					)}
					{relatives.siblings?.length > 0 && (
						<div className={"individuals-detail__family-card-relatives-row"}>
							<div className="individuals-detail__family-card-label">
								Geschwister
							</div>
							{relatives.siblings.map((pid) => (
								<Link
									className="individual-detail__family-card-name"
									to={`/individual/detail/${pid}`}
									key={pid}
								>
									{formatName(getPersonByID(pid, peopleByID), "normal")}
								</Link>
							))}
						</div>
					)}
					{relatives.children?.length > 0 && (
						<div className={"individuals-detail__family-card-relatives-row"}>
							<div className="individuals-detail__family-card-label">
								Kinder
							</div>
							{relatives.children.map((pid) => (
								<Link
									className="individual-detail__family-card-name"
									to={`/individual/detail/${pid}`}
									key={pid}
								>
									{formatName(getPersonByID(pid, peopleByID), "normal")}
								</Link>
							))}
						</div>
					)}
				</div>
				<div className="individual-detail__events">
					<div className="individual-detail__family-card-title">Lebenslauf</div>
					<div>NOT YET IMPLEMENTED</div>
				</div>
			</div>
			<div className="individual-detail__images-card">
				<div className="individual-detail__image-card-title">Fotos</div>
				<div className="individual-detail__image-card-grid">
					{images.length > 0 &&
						images.map((img) => (
							<ImageTile
								key={img.id}
								thumbnail={null}
								label={img.display_name}
								date={img.date.slice(0, 4)}
							/>
						))}
				</div>
			</div>
			<div className="individual-detail__documents-card">
				<div className="individual-detail__document-card-title">Dokumente</div>
				<div className="individual-detail__document-card-grid">
					{documents.length > 0 &&
						documents.map((doc) => (
							<DocumentTile
								key={doc.id}
								thumbnail={null}
								label={doc.display_name}
								date={doc.date.slice(0, 4)}
							/>
						))}
				</div>
			</div>
		</div>
	);
}
