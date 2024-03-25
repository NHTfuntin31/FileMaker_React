import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from 'date-fns/locale/ja';
import { registerLocale } from  "react-datepicker";
import { format } from 'date-fns';
import { Icon } from "@iconify/react/dist/iconify.js";
registerLocale('ja', ja)

interface DatePickerProps {
	selected: string | null;
	onChange: (date: string | null) => void;
	customInput?: JSX.Element;
	popperPlacement?: string;
	showMonthYearPicker?: boolean;
	dateFormat?: string;
	disabled?: boolean;
}

const MonthPicker = forwardRef(
	(
		{
			selected,
			customInput,
			popperPlacement = "bottom",
			showMonthYearPicker = true,
			dateFormat = "yyyy/MM",
			onChange,
			disabled = false,
		}: DatePickerProps,
		ref
	) => {
		const [startMonth, setStartMonth] = useState<string | null>(selected);

		return (
				<DatePicker
					locale="ja"
					selected={startMonth}
					onChange={(date: any) => {
						setStartMonth(format(date, 'yyyy/MM'))
						onChange(format(date, 'yyyy/MM'))
					}} 
					customInput={customInput}
					decoration={<Icon icon="solar:calendar-outline" width="20" height="20"/>}
					popperPlacement={popperPlacement}
					showMonthYearPicker={showMonthYearPicker}
					dateFormat={dateFormat}
					disabled={disabled}
					ref={ref as React.RefObject<HTMLInputElement>}
				/>
		);
	}
);

export default MonthPicker;
