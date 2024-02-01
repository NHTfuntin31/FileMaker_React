
import { Button, Modal } from 'flowbite-react';
import { FormProvider, useForm } from 'react-hook-form';


const RequestModal = (props: any) => {
	const {status, changeStatus, children, title, hopital} = props;

	const methods  = useForm();

	const submit = (data: any) => {
		console.log(data);
	}

	return (
		<>
			<Modal show={status} onClose={() => changeStatus(false)}>
				<Modal.Header>
					<div>
						{title} <br />
						{hopital}
					</div>
				</Modal.Header>
				<form onSubmit={methods.handleSubmit(submit)}>
					<FormProvider {...methods}>
						<Modal.Body>
							<div className="space-y-6">
								{children}
							</div>
						</Modal.Body>
						<Modal.Footer>
							<Button onSubmit={methods.handleSubmit(submit)}>確認</Button>
							<Button color="gray" onClick={() => changeStatus(false)}>
								閉じる
							</Button>
						</Modal.Footer>
					</FormProvider>
				</form>
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
