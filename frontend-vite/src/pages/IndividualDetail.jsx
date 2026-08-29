import { useEffect, useMemo, useState } from "react";
import { Link, useAsyncError, useParams } from "react-router";
import placeholderAvatar from "./../assets/placeholder-avatar.jpg";
import "./IndividualDetail.css";
import { Modal } from "../components/Modal";
import { DocumentTile, ImageTile } from "../components/ui/elements";
import getPersonByID, { formatName } from "../lib/people";
import {
	getIndividualDetails,
	updateIndividual,
	uploadPortrait,
} from "../services/api";

export default function IndividualDetail() {
	const { id } = useParams();
	const [details, setDetails] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [portraitFile, setPortraitFile] = useState(null);

	const portraitPreview = useMemo(
		() => (portraitFile ? URL.createObjectURL(portraitFile) : null),
		[portraitFile],
	);

	useEffect(() => {
		if (!portraitPreview) return;
		return () => URL.revokeObjectURL(portraitPreview);
	}, [portraitPreview]);

	function handlePortraitChange(e) {
		const file = e.target.files[0];
		if (!file) return;
		setPortraitFile(file);
		uploadPortrait(id, file).then(() => {
			getIndividualDetails(id).then(setDetails);
		});
	}

	const [form, setForm] = useState({
		given_name: "",
		second_name: "",
		third_name: "",
		surname: "",
		maiden_name: "",
		sex: "",
		birth_date: "",
		birth_place: "",
		death_date: "",
		death_place: "",
		portrait_url: "",
	});

	useEffect(() => {
		getIndividualDetails(id).then(setDetails);
	}, [id]);

	useEffect(() => {
		if (!details) return;
		setForm({
			given_name: person.given_name ?? "",
			second_name: person.second_name ?? "",
			third_name: person.third_name ?? "",
			surname: person.surname ?? "",
			maiden_name: person.maiden_name ?? "",
			sex: person.sex ?? "",
			birth_date: person.birth_date ?? "",
			birth_place: person.birth_place ?? "",
			death_date: person.death_date ?? "",
			death_place: person.death_place ?? "",
			portrait_url: person.portrait_url ?? "",
		});
	}, [details]);

	if (!details) return <div>Lädt...</div>;

	const { person, relatives, peopleByID, documents, images } = details;

	const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

	return (
		<div className="individual-detail__body">
			<button
				type="button"
				className="individual-detail__edit-button"
				onClick={() => setEditOpen(true)}
			>
				Bearbeiten
			</button>
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
			<Modal
				open={editOpen}
				onClose={() => setEditOpen(false)}
				title={"Person bearbeiten"}
			>
				<div className="edit-person__top-section">
					<label className="edit-person__portrait">
						<img
							src={
								portraitPreview ||
								(form.portrait_url ? form.portrait_url : placeholderAvatar)
							}
							alt=""
						/>
						<span className="edit-person__portrait-edit-icon">
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
									stroke="#fff"
									strokeWidth="2"
									strokeLinejoin="round"
									strokeLinecap="round"
								/>
							</svg>
						</span>
						<input
							type="file"
							accept="image/*"
							onChange={handlePortraitChange}
							style={{ display: "none" }}
						/>
					</label>
					<div className="edit-person__top-fields">
						<div className="edit-person__value-row">
							<div className="edit-person__value-label">Vorname</div>
							<div className="edit-person__value">
								<input
									type="text"
									value={form.given_name}
									onChange={set("given_name")}
								/>
							</div>
						</div>
						<div className="edit-person__value-row">
							<div className="edit-person__value-label">Nachname</div>
							<div className="edit-person__value">
								<input
									type="text"
									value={form.surname}
									onChange={set("surname")}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="edit-person__grid">
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Zweitname</div>
						<div className="edit-person__value">
							<input
								type="text"
								value={form.second_name}
								onChange={set("second_name")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Drittname</div>
						<div className="edit-person__value">
							<input
								type="text"
								value={form.third_name}
								onChange={set("third_name")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Ledigname</div>
						<div className="edit-person__value">
							<input
								type="text"
								value={form.maiden_name}
								onChange={set("maiden_name")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Geschlecht</div>
						<div className="edit-person__value">
							<select value={form.sex} onChange={set("sex")}>
								<option value="">...</option>
								<option value="male">Männlich</option>
								<option value="female">Weiblich</option>
							</select>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Geburtsdatum</div>
						<div className="edit-person__value">
							<input
								type="date"
								value={form.birth_date}
								onChange={set("birth_date")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Geburtsort</div>
						<div className="edit-person__value">
							<input
								type="text"
								value={form.birth_place}
								onChange={set("birth_place")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Todesdatum</div>
						<div className="edit-person__value">
							<input
								type="date"
								value={form.death_date}
								onChange={set("death_date")}
							/>
						</div>
					</div>
					<div className="edit-person__value-row">
						<div className="edit-person__value-label">Todesort</div>
						<div className="edit-person__value">
							<input
								type="text"
								value={form.death_place}
								onChange={set("death_place")}
							/>
						</div>
					</div>
				</div>
				<div className="edit-person__save-button">
					<button
						type="button"
						onClick={() =>
							updateIndividual(id, form).then(() => {
								setEditOpen(false);
								getIndividualDetails(id).then(setDetails);
							})
						}
					>
						Speichern
					</button>
				</div>
			</Modal>
		</div>
	);
}
