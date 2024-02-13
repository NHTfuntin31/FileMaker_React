import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const navObjArr = [
	{ label: "広告掲載と人材紹介について", url: "https://www.e-doctor.ne.jp/recruiter/" },
	{ label: "お問い合わせ", url: "https://www.e-doctor.ne.jp/inquiry/" },
	{ label: "よくある質問", url: "https://www.e-doctor.ne.jp/c/help/" },
	{ label: "サイトマップ", url: "https://www.e-doctor.ne.jp/j/sitemap.html" },
]
const headerObjArr = [
	{ label: "常勤求人", url: "https://www.e-doctor.ne.jp/", mobile: "常勤" },
	{ label: "定期非常勤求人", url: "https://www.e-doctor.ne.jp/h/", mobile: "定期非常勤" },
	{ label: "スポット求人", url: "https://www.e-doctor.ne.jp/s/", mobile: "スポット" },
	{ label: "健診求人", url: "https://www.e-doctor.ne.jp/k/", mobile: "健診" },
	{ label: "事業継承", url: "https://www.e-doctor.ne.jp/estate/", mobile: "事業継承" },
	{ label: "コンテンツ", url: "https://www.e-doctor.ne.jp/c/", mobile: "" },
	{ label: "マイページ", url: "https://www.e-doctor.ne.jp/mypage/dr/login", mobile: "" },
]

export const Header = () => {
	return (
		<div className="w-full flex justify-center">
			<div className="flex flex-col w-full max-w-5xl px-5 md:px-14 mt-3">
				<div className="flex justify-between">
					<div className="text-neutral-700 text-xs font-normal whitespace-nowrap">e-doctor 会員医師のカレンダー</div>
					<div className="hidden md:block">
						<ul className="flex gap-3">
							{
								navObjArr.map((item: any) => {
									return (
										<>
											<li className="text-neutral-700 text-xs font-normal font-['Meiryo'] leading-none whitespace-nowrap cursor-pointer">
												<Link to={item.url} className='flex gap-1'>
													<Icon icon="teenyicons:right-circle-solid" style={{ color: "#2f88ff" }} />
													<p className='hover:border-b hover:border-black'>{item.label}</p>
												</Link>
											</li>
										</>

									)
								})
							}
						</ul>
					</div>
				</div>

				<div className="flex justify-between my-1">
					<div>
						<img className="" src="/public/Link.png" />
					</div>
				</div>


				<div className="my-2 text-sky-600 text-xs font-normal font-['Meiryo'] leading-snug whitespace-nowrap">カレンダー</div>
				<div className="grid grid-flow-col">
					{
						headerObjArr.map((item: any) => {
							return (
								<>
									<Link to={item.url} className="hidden md:block p-3 border font-bold text-center font-meiryo text-base leading-6 whitespace-nowrap cursor-pointer">{item.label}
									</Link>
									{
										item.mobile && <div className="block md:hidden p-3 border font-bold text-center font-meiryo text-sm rounded-t-lg">{item.mobile}</div>
									}
								</>
							)
						})
					}
				</div>
			</div>
		</div>
	)
}
