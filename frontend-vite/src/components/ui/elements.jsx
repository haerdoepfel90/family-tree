import "./elements.css";
import { Link } from "react-router";
import placeholderAvatar from "../../assets/placeholder-avatar.jpg";

export function PersonCardPortrait({ id, label, portrait, linkAll }) {
	if (!linkAll)
		return (
			<Link to={`/detail/${id}`} className="person-card-portrait__body">
				<div className="person-card-portrait__img-frame">
					<img
						src={portrait || placeholderAvatar}
						className="person-card-portrait__img"
					/>
				</div>
				<div className="person-card-portrait__label">{label}</div>
			</Link>
		);
	return (
		<Link to={"/manage"} className="person-card-portrait__body">
			<button type="button" className="person-card-portrait__img-frame-empty">
				Alle
			</button>
		</Link>
	);
}
