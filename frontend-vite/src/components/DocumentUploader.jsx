import { useState } from "react";
import { Modal } from "./Modal";
import "./DocumentUploader.css";
import { uploadDocument } from "../services/api";

export function DocumentUploader({ open, onClose, kind, onUploaded }) {
	const [file, setFile] = useState(null);
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={kind === "photo" ? "Foto hochladen" : "Dokument hochladen"}
		>
			<label
				className={
					file
						? "document-uploader__dropzone document-uploader__dropzone--staged"
						: "document-uploader__dropzone"
				}
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					setFile(e.dataTransfer.files[0]);
				}}
			>
				<input
					type="file"
					className="document-uploader__file-input"
					onChange={(e) => setFile(e.target.files[0])}
				/>
				<span className="document-uploader__hint">
					{file ? file.name : "Datei auswählen oder hierher ziehen"}
				</span>
			</label>
			<div className="document-uploader__actions">
				<button
					type="button"
					className="document-uploader__upload-button"
					disabled={!file}
					onClick={() =>
						uploadDocument(file).then((result) => onUploaded(result))
					}
				>
					Hochladen
				</button>
			</div>
		</Modal>
	);
}
