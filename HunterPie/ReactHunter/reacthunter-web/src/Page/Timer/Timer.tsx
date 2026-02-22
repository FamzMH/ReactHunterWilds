export function getMinutes(seconds: number) {
    return Math.floor(seconds / 60);
}

export function processMinutes(seconds: number) {
    const minute = getMinutes(seconds);
    if (minute < 10) return "0" + String(minute)
    return minute
}

export function getSeconds(seconds: number) {
    const minutes = getMinutes(seconds);
    const answer = seconds - 60 * minutes;
    if (answer < 10) {
        return "0" + answer;
    }
    return answer;
}
