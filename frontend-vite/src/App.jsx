import { ReactFlowProvider } from "@xyflow/react";
import { Route, Routes } from "react-router";
import "@xyflow/react/dist/style.css";
import "./Tree.css";
import DetailPage from "./DetailPage";
import Layout from "./Layout";
import ManagePage from "./ManagePage";
import { Tree } from "./Tree";
import { TreeIndex } from "./TreeIndex";

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<div>LANDING PAGE</div>} />
				<Route path="/trees" element={<TreeIndex />} />
				<Route
					path="/tree/:familyId"
					element={
						<ReactFlowProvider>
							<Tree />
						</ReactFlowProvider>
					}
				/>
				<Route path="/detail/:id" element={<DetailPage />} />
				<Route path="/manage" element={<ManagePage />} />
			</Route>
		</Routes>
	);
}
