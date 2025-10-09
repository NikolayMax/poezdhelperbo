import {IUserData} from "./types/session";

const isSelectedDate = ({selectedYear, selectedMonth,selectedDay}:IUserData) => {
    return selectedYear !== undefined &&
        selectedMonth !== undefined &&
        selectedDay !== undefined;
}

export const renderSelectDate = (userData: IUserData) => {
    const isSelectDate = isSelectedDate(userData);
    const {selectedYear, selectedMonth,selectedDay} = userData;

    return `Выберите ${isSelectDate ? 'другую' : ''} дату: ${ 
        isSelectDate ? 
            `✅ ${selectedDay.toString().padStart(2, '0')}.${(selectedMonth+1).toString().padStart(2, '0')}.${selectedYear}` 
            : ''
    }`;
}

export const renderSelectFromCity = ({cityFrom}:IUserData) => {
    return `Город откуда: ${cityFrom ? `✅ ${cityFrom.name}` : ''}`
}

export const renderSelectToCity = ({cityTo}:IUserData) => {
    return `Город куда: ${cityTo ? `✅ ${cityTo.name}` : ''}`
}
export const getLastDayOfMonth = (year: number, month: number) => {
    return (new Date(year, month + 1, 0)).getDate();
}