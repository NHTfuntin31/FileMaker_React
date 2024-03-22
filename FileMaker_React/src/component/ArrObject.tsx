export const sexObj = [
	{
		label : "男性",
		value : "male"
	},
	{
		label : "女性",
		value : "female"
	},
]
export const categoryObj = [
	{
		label : "常勤",
		value : "1"
	},
	{
		label : "定期非常勤",
		value : "2"
	},
	{
		label : "スポット",
		value : "3"
	},
	{
		label : "健診",
		value : "4"
	},
]

export const shifts = [
	{ key: "mimei", label : "未明", start: "00:00", end: "08:00" ,color : "pink-700", default : "slate-200", test :'f7:sunrise-fill'}, 
	{ key: "gozen", label : "午前", start: "08:00", end: "14:00" , color : "amber-700", default : "slate-200", test :'ic:twotone-wb-sunny'}, 
	{ key: "gogo", label : "午後", start: "12:00", end: "19:00" , color : "green-700", default : "slate-200", test :'game-icons:sunset'}, 
	{ key: "yakan", label : "夜間", start: "18:00", end: "23:59" ,color : "indigo-700", default : "slate-200", test :'cbi:scene-nightlight'}, 
]

export const classificationArrObj = [
	{label: "定期", key : "□", number: "01"},
	{label: "スポット", key : "△", number: "02"},
	{label: "検診", key : "〇", number: "03"},
	{label: "他業務", key : "◇", number: "91"},
	{label: "プライベート", key : "▽", number: "91"},
]

export const masterMenu = [
	{ key: "61" },
	{ key: "71" },
]