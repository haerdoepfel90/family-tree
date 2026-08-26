import { Handle, Position } from "@xyflow/react";
import { CARD_HEIGHT, CARD_WIDTH } from "../lib/treeConstants";

export function PersonNode({ data }) {
	return (
		<div
			className="person-card"
			style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
		>
			<div className="person-card__names">
				<div>{data.given_name_full ?? ""}</div>
				<div>{data.surname}</div>
			</div>
			<hr className="person-card__rule" />
			{data.birth_date ? (
				<div className="person-card__meta person-card__meta--birth">
					<span className="person-card__meta-mark">*</span>
					<span>{data.birth_date}</span>
				</div>
			) : (
				""
			)}

			{data.death_date ? (
				<div className="person-card__meta person-card__meta--death">
					<span className="person-card__meta-mark">†</span>
					<span>{data.death_date}</span>
				</div>
			) : (
				""
			)}
			{data.maiden_name ? (
				<div className="person-card__maiden">{`geb. ${data.maiden_name}`}</div>
			) : (
				""
			)}
			<Handle
				type="target"
				position={Position.Top}
				id="top"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left"
				style={{
					left: CARD_WIDTH / 2,
					right: -CARD_WIDTH / 2,
					top: CARD_HEIGHT / 2,
					bottom: -CARD_HEIGHT / 2,
					hiddenHandle,
				}}
			/>
		</div>
	);
}

export function UnionNode() {
	return (
		<div style={{ width: 1, height: 1, position: "relative" }}>
			<Handle
				type="target"
				position={Position.Top}
				id="in"
				style={{ left: 0, top: 0, hiddenHandle }}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="out"
				style={{ left: 0, top: 0, hiddenHandle }}
			/>
		</div>
	);
}

export const hiddenHandle = {
	opacity: 0,
	width: 1,
	height: 1,
	minWidth: 0,
	minHeight: 0,
	border: "none",
};

export const nodeTypes = { person: PersonNode, union: UnionNode };
