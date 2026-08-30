import "./elements.css";
import { Link } from "react-router";
import placeholderAvatar from "../../assets/placeholder-avatar.jpg";
import placeholderDocument from "../../assets/placeholder-document.svg";
import placeholderPhoto from "../../assets/placeholder-photo.svg";

export function LinkTag({ label, onClick, onRemove, onAdd }) {
	if (onAdd) {
		return (
			<button type="button" className="link-tag__empty" onClick={onAdd}>
				+verknüpfen
			</button>
		);
	}

	return (
		<span className="link-tag">
			{onClick ? (
				<button type="button" className="link-tag__label" onClick={onClick}>
					{label}
				</button>
			) : (
				<span className="link-tag__label">{label}</span>
			)}
			{onRemove && (
				<button type="button" className="link-tag__remove" onClick={onRemove}>
					x
				</button>
			)}
		</span>
	);
}

export function PersonCardPortrait({ id, label, portrait, linkAll }) {
	if (!linkAll)
		return (
			<Link
				to={`individual/detail/${id}`}
				className="person-card-portrait__body"
			>
				<div className="person-card-portrait__img-frame">
					<img
						src={portrait || placeholderAvatar}
						className="person-card-portrait__img"
						alt="portrait"
					/>
				</div>
				<div className="person-card-portrait__label">{label}</div>
			</Link>
		);
	return (
		<Link to={"/individuals"} className="person-card-portrait__body">
			<button type="button" className="person-card-portrait__img-frame-empty">
				Alle
			</button>
		</Link>
	);
}

function TileEditIcon({ className, onEdit }) {
	if (!onEdit) return null;
	return (
		<button
			type="button"
			className={className}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onEdit();
			}}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
					stroke="#fff"
					strokeWidth="2"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
			</svg>
		</button>
	);
}

export function DocumentTile({ thumbnail, label, date, fileUrl, onEdit }) {
	const Wrapper = fileUrl ? "a" : "div";
	const wrapperProps = fileUrl
		? { href: fileUrl, target: "_blank", rel: "noreferrer" }
		: {};
	return (
		<Wrapper className="document-tile__body" {...wrapperProps}>
			<div className="document-tile__thumbnail">
				<img src={thumbnail ?? placeholderDocument} alt="" />
				<TileEditIcon className="document-tile__edit-icon" onEdit={onEdit} />
			</div>
			<div className="document-tile__label">{label}</div>
			<div className="document-tile__date">{date}</div>
		</Wrapper>
	);
}

export function ImageTile({ thumbnail, label, date, fileUrl, onEdit }) {
	const Wrapper = fileUrl ? "a" : "div";
	const wrapperProps = fileUrl
		? { href: fileUrl, target: "_blank", rel: "noreferrer" }
		: {};
	return (
		<Wrapper className="image-tile__body" {...wrapperProps}>
			<div className="image-tile__thumbnail">
				<img src={thumbnail ?? placeholderPhoto} alt="" />
				<TileEditIcon className="image-tile__edit-icon" onEdit={onEdit} />
			</div>
			<div className="image-tile__label">{label}</div>
			<div className="image-tile__date">{date}</div>
		</Wrapper>
	);
}
