
import { Button, Modal } from 'flowbite-react';

const CalendarModal = (props: any) => {
	const { status, changeStatus, children, title, submit, notFooter, mobile } = props;

	return (
		<>
			<Modal show={status} onClose={() => changeStatus()} className={mobile ? 'block md:hidden' : ""}>
				<Modal.Header>
					{title} <br />
				</Modal.Header>
				<Modal.Body>
					<div className="space-y-6">
						{children}
					</div>
				</Modal.Body>
				{
					notFooter
						? ""
						:
						<Modal.Footer>
							<Button onClick={() => submit()}>確認</Button>
							<Button color="gray" onClick={() => changeStatus()}>
								閉じる
							</Button>
						</Modal.Footer>
				}
			</Modal>
		</>
	);
}

export { CalendarModal }
