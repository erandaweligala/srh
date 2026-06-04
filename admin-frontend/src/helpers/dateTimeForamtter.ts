const formatDateTime = (date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
    const map: { [key: string]: string } = {
        'YYYY': date.getFullYear().toString(),
        'MM': String(date.getMonth() + 1).padStart(2, '0'), // Months are zero-based
        'DD': String(date.getDate()).padStart(2, '0'),
        'HH': String(date.getHours()).padStart(2, '0'),
        'mm': String(date.getMinutes()).padStart(2, '0'),
        'ss': String(date.getSeconds()).padStart(2, '0')
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched: string) => map[matched]);
};

export default formatDateTime;