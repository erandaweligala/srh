export const validateEmail = (_rule: object, value?: string) => {
    if (!value) return Promise.resolve();

    const atIndex = value.indexOf('@');
    const dotIndex = value.lastIndexOf('.');

    const isValid =
        atIndex > 0 &&
        dotIndex > atIndex + 1 &&
        dotIndex < value.length - 1 &&
        !value.includes(' ');

    return isValid
        ? Promise.resolve()
        : Promise.reject(new Error('Invalid email address'));
};

export function formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}


export const validateCharactersOnly = (_rule: object, value: string) => {
    const charRegex = /^[A-Za-z\s]+$/;
    if (value && !charRegex.test(value)) {
        return Promise.reject(new Error('Special characters and numbers are not allowed'));
    }
    return Promise.resolve();
};