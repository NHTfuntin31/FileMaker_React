import { LoadingI } from "../utils/interface";
import { Loading as LoadingIcon } from "./icon/loading";

export const Loading: React.FC<LoadingI> = ({ show }) => {
	return (
		<>
			{show ? (
				<>
					<div
						role="status"
						className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
					>
						<LoadingIcon />
						<span className="sr-only">Loading...</span>
					</div>
				</>
			) : null}
		</>
	);
};
