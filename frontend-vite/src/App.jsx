import { ReactFlowProvider } from "@xyflow/react";
import { Route, Routes } from "react-router";
import "@xyflow/react/dist/style.css";
import "./Tree.css";
import DetailPage from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";
import { IndividualsIndex } from "./pages/IndividualsIndex";
import Layout from "./pages/Layout";
import ManagePage from "./pages/ManagePage";
import { Tree } from "./pages/Tree";
import { TreeIndex } from "./pages/TreeIndex";

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/trees" element={<TreeIndex />} />
				<Route
					path="/tree/:familyId"
					element={
						<ReactFlowProvider>
							<Tree />
						</ReactFlowProvider>
					}
				/>
				<Route path="/individuals" element={<IndividualsIndex />} />
				<Route path="/detail/:id" element={<DetailPage />} />
				<Route path="/manage" element={<ManagePage />} />
			</Route>
		</Routes>
	);
}
