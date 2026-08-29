import "../Layout.css";
import { NavLink, Outlet } from "react-router";

export default function Layout() {
	return (
		<>
			<header className="app-header">
				<div className="header-left">
					<NavLink to="/">FamilyTree</NavLink>
					<NavLink to="/trees">Stammbäume</NavLink>
					<NavLink to="/individuals">Personen</NavLink>
					<NavLink to="/families">Familien</NavLink>
				</div>
				<div className="header-right">
					<div>
						<input type="text" placeholder="Suchen..." />
					</div>
				</div>
			</header>
			<main className="main">
				<Outlet />
			</main>
		</>
	);
}
