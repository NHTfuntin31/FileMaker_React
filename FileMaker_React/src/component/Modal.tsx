
import { Button, Modal } from 'flowbite-react';

const CalendarModal = (props: any) => {
	const { status, changeStatus, children, title, submit, notFooter, mobile, kirikae } = props;

	return (
		<>
			<Modal show={status} onClose={() => {
				changeStatus()
				kirikae()
			}} 
				className={mobile ? 'block md:hidden' : ""}>
				<Modal.Header className='bg-slate-600'>
					{title} <br />
				</Modal.Header>
				<Modal.Body className='bg-slate-700'>
					<div className="space-y-6">
						{children}
					</div>
				</Modal.Body>
				{
					notFooter
						? 
						<Modal.Footer className='bg-slate-600'>
							<Button onClick={() => kirikae()}>修正</Button>
							<Button color="gray" onClick={() => {
								kirikae(true)
								submit()
								}}>
								<p className='text-red-500'>削除</p>
							</Button>
						</Modal.Footer>
						:
						<Modal.Footer className='bg-slate-600'>
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
