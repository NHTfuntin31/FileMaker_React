
import { Button, Modal } from 'flowbite-react';

const RequestModal = (props: any) => {
	const {status, changeStatus, children, title, hopital, submit} = props;

	return (
		<>
			<Modal show={status} onClose={() => changeStatus(false)}>
				<Modal.Header>
					<div>
						{title} <br />
						{hopital}
					</div>
				</Modal.Header>
				<Modal.Body>
					<div className="space-y-6">
						<div>
						{children}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={(e) => submit(e)}>確認</Button>
					<Button color="gray" onClick={() => changeStatus(false)}>
						閉じる
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
const DetailsModal = (props: any) => {
	const {status, changeStatus, children, title} = props;

	return (
		<>
			<Modal show={status} onClose={() => changeStatus(false)} className='block md:hidden'>
				<Modal.Header>
					{title}
				</Modal.Header>
				<Modal.Body>
					<div className="space-y-6">
						{children}
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}

const RegisterModal = (props: any) => {
	const {status, changeStatus, children, title} = props;

	return (
		<>
			<Modal show={status} onClose={() => changeStatus(false)}>
				<Modal.Header>
					{title} <br />
					スケジュールを追加
				</Modal.Header>
				<Modal.Body>
					<div className="space-y-6">
						{children}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => changeStatus(false)}>確認</Button>
					<Button color="gray" onClick={() => changeStatus(false)}>
						閉じる
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export {RequestModal, DetailsModal, RegisterModal}
