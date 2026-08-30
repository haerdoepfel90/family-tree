import { useEffect, useState } from "react";
import getPersonByID, { formatName } from "../lib/people";
import {
	getDocument,
	getIndividuals,
	linkDocument,
	unlinkDocument,
	updateDocument,
} from "../services/api";
import { Modal } from "./Modal";
import { LinkTag } from "./ui/elements";
import "./DocumentEditor.css";

export function DocumentEditor({ doc, open, onClose, peopleById }) {
	const isEdit = doc?.id != null;
	const [form, setForm] = useState({
		display_name: "",
		kind: doc?.kind ?? "document",
		date: "",
		place: "",
		source: "",
		caption: "",
	});
	const [links, setLinks] = useState([]);
	const [linkAddContext, setLinkAddContext] = useState(false);
	const [subjectType, setSubjectType] = useState("individual");
	const [people, setPeople] = useState([]);
	const [peopleByID, setPeopleById] = useState(new Map());
	const [pickedId, setPickedId] = useState("");
	const [pickedRole, setPickedRole] = useState("");

	const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

	function handleAddLink() {
		console.log("handleAddLink fired");
		setLinkAddContext(true);
		return;
	}
	function handleRemoveLink(id, link) {
		console.log("handleRemoveLink fired");
		unlinkDocument(id, link).then(() =>
			setLinks(links.filter((l) => l !== link)),
		);
		return;
	}
	function handleClose() {
		setLinkAddContext(false);
		setSubjectType("");
		onClose();
	}

	useEffect(() => {
		if (!isEdit) {
			setForm({
				display_name: "",
				kind: doc?.kind ?? "document",
				date: "",
				place: "",
				source: "",
				caption: "",
			});
			setLinks([]);
			return;
		}
		getDocument(doc.id).then((full) => {
			setForm({
				display_name: full.display_name ?? "",
				kind: full.kind ?? "document",
				date: full.date ?? "",
				place: full.place ?? "",
				source: full.source ?? "",
				caption: full.caption ?? "",
			});
			setLinks(full.links ?? []);
		});
	}, [doc?.id, isEdit, doc?.kind]);

	useEffect(() => {
		getIndividuals().then(({ people, peopleByID }) => {
			setPeople(people);
			setPeopleById(peopleByID);
		});
	}, []);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title={isEdit ? "Dokument bearbeiten" : "Dokument hochladen"}
		>
			<div className="edit-document__metadata">
				<div className="edit-document__section-label">Metadaten</div>
				<div className="edit-document__grid">
					<div className="edit-document__value-row">
						<div className="edit-document__value-label">Anzeigename</div>
						<div className="edit-document__value">
							<input
								type="text"
								value={form.display_name}
								onChange={set("display_name")}
							/>
						</div>
					</div>
					<div className="edit-document__value-row">
						<div className="edit-document__value-label">Art</div>
						<div className="edit-document__value">
							<select value={form.kind} onChange={set("kind")}>
								<option value="document">Dokument</option>
								<option value="photo">Foto</option>
							</select>
						</div>
					</div>
					<div className="edit-document__value-row">
						<div className="edit-document__value-label">Datum</div>
						<div className="edit-document__value">
							<input type="date" value={form.date} onChange={set("date")} />
						</div>
					</div>
					<div className="edit-document__value-row">
						<div className="edit-document__value-label">Ort</div>
						<div className="edit-document__value">
							<input type="text" value={form.place} onChange={set("place")} />
						</div>
					</div>
					<div className="edit-document__value-row">
						<div className="edit-document__value-label">Quelle</div>
						<div className="edit-document__value">
							<input type="text" value={form.source} onChange={set("source")} />
						</div>
					</div>
				</div>
				<div className="edit-document__value-row">
					<div className="edit-document__value-label">Beschreibung</div>
					<div className="edit-document__value">
						<textarea value={form.caption} onChange={set("caption")} />
					</div>
				</div>
			</div>
			<div className="edit-document__links">
				<div className="edit-document__section-label">Verknüpfungen</div>
				<div className="edit-document__links-tags">
					<div className="edit-document__links-row">
						{links.map((link) => (
							<LinkTag
								key={`${link.document_id}-${link.subject_id}`}
								label={formatName(
									getPersonByID(link.subject_id, peopleById),
									"normal",
								)}
								onRemove={() => handleRemoveLink(doc.id, link)}
							/>
						))}
						<LinkTag onAdd={handleAddLink} />
					</div>
					{linkAddContext ? (
						<div className="edit-document__link-add-context">
							<div className="edit-document__link-add-context-top">
								<label>
									<input
										type="radio"
										name="subjectType"
										value="individual"
										checked={subjectType === "individual"}
										onChange={(e) => setSubjectType(e.target.value)}
									/>
									Person
								</label>
								<label>
									<input
										type="radio"
										name="subjectType"
										value="event"
										checked={subjectType === "event"}
										onChange={(e) => setSubjectType(e.target.value)}
									/>
									Ereignis
								</label>
								{subjectType === "individual" ? (
									<select
										value={pickedId}
										onChange={(e) => setPickedId(e.target.value)}
									>
										<option value="">Person Wählen</option>
										{people.map((p) => (
											<option key={p.id} value={p.id}>
												{formatName(p, "normal")}
												{p.birth_date ? ` (${p.birth_date.slice(0, 4)})` : ""}
											</option>
										))}
									</select>
								) : (
									<select>
										<option value="">Ereignis Wählen</option>
									</select>
								)}
								<select
									value={pickedRole}
									onChange={(e) => setPickedRole(e.target.value)}
								>
									<option value="">Bezug Wählen</option>
									<option value="depicts">Bildet ab</option>
									<option value="documents">Dokumentiert</option>
								</select>
							</div>
							<div className="edit-document__link-add-context-bottom">
								<button
									type="button"
									disabled={!pickedId || !pickedRole}
									onClick={() =>
										linkDocument(
											doc.id,
											"individual",
											pickedId,
											pickedRole,
										).then(() => {
											setLinks([
												...links,
												{
													document_id: doc.id,
													subject_type: "individual",
													subject_id: pickedId,
													role: pickedRole,
												},
											]);
											setPickedId("");
											setPickedRole("");
											setLinkAddContext(false);
										})
									}
								>
									Verknüpfen
								</button>
							</div>
						</div>
					) : (
						<></>
					)}
				</div>
			</div>
			<div className="edit-document__save-button">
				<button
					type="button"
					onClick={() => updateDocument(doc.id, form).then(() => handleClose())}
				>
					Speichern
				</button>
			</div>
		</Modal>
	);
}
