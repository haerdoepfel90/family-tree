import "./elements.css";
import { Link } from "react-router";
import placeholderAvatar from "../../assets/placeholder-avatar.jpg";
import placeholderDocument from "../../assets/placeholder-document.svg";
import placeholderPhoto from "../../assets/placeholder-photo.svg";

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

export function DocumentTile({ thumbnail, label, date }) {
	return (
		<div className="document-tile__body">
			<div className="document-tile__thumbnail">
				<img src={thumbnail ?? placeholderDocument} alt="" />
			</div>
			<div className="document-tile__label">{label}</div>
			<div className="document-tile__date">{date}</div>
		</div>
	);
}

export function ImageTile({ thumbnail, label, date }) {
	return (
		<div className="image-tile__body">
			<div className="image-tile__thumbnail">
				<img src={thumbnail ?? placeholderPhoto} alt="" />
			</div>
			<div className="image-tile__label">{label}</div>
			<div className="image-tile__date">{date}</div>
		</div>
	);
}
