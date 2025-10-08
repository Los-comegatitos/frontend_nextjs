export const showDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
    });
}

export const showFormalDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
    });
}

export const showDateInput = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.log(error);
        return '';
    }
}