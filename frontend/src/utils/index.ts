import { IMessage, IUser } from "@/types";
import moment from "moment";

export function getInitials(user: IUser) {
    const first = user.firstName ? user.firstName.toUpperCase() : '';
    const last = user.lastName ? user.lastName.toUpperCase() : '';

    if (last) {
        return first[0] + last[0];
    } else {
        return first.slice(0, 2);
    }
}

export function formatDate(isoString: string | undefined) {
    if (!isoString) return "";
    const inputDate = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Remove time part for comparison
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    if (isSameDay(inputDate, today)) {
        return "Today";
    } else if (isSameDay(inputDate, yesterday)) {
        return "Yesterday";
    } else {
        const dd = String(inputDate.getDate()).padStart(2, '0');
        const mm = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const yy = String(inputDate.getFullYear()).slice(-2);
        return `${dd}/${mm}/${yy}`;
    }
}

export const groupMessagesByDate = (messages: IMessage[]) => {
    const groups: { date: string; messages: IMessage[] }[] = [];

    messages.forEach((msg) => {
        const dateKey = moment(msg.createdAt).format("YYYY-MM-DD");
        const existingGroup = groups.find((g) => g.date === dateKey);

        if (existingGroup) {
            existingGroup.messages.push(msg);
        } else {
            groups.push({
                date: dateKey,
                messages: [msg],
            });
        }
    });

    return groups;
};


export const getFriendlyDate = (dateStr: string) => {
    const date = moment(dateStr);
    const today = moment();
    const yesterday = moment().subtract(1, "day");

    if (date.isSame(today, "day")) return "Today";
    if (date.isSame(yesterday, "day")) return "Yesterday";

    return date.format("DD MMMM YYYY");
};

export const getFileExtension = (filename: string): string | null => {
    const cleanedName = filename.trim().replace(/\s+\(.*\)$/, "");

    const parts = cleanedName.split(".");
    if (parts.length < 2) return null;

    return parts.pop()?.toLowerCase() || null;
}



export function formatLastSeen(dateInput: string) {
    const inputDate = new Date(dateInput);
    const now = new Date();

    const inputDay = inputDate.toDateString();
    const today = now.toDateString();

    // Check if it's today
    if (inputDay === today) {
        return `today at ${formatTime(inputDate)}`;
    }

    // Check if it's yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (inputDay === yesterday.toDateString()) {
        return `yesterday at ${formatTime(inputDate)}`;
    }

    // Get the difference in days
    const diffTime = now.getTime() - inputDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        const weekday = inputDate.toLocaleDateString('en-US', { weekday: 'long' });
        return `on ${weekday} at ${formatTime(inputDate)}`;
    }

    // If in the same year
    if (inputDate.getFullYear() === now.getFullYear()) {
        return `on ${formatDayMonth(inputDate)} at ${formatTime(inputDate)}`;
    }

    // Older than current year
    return `on ${formatFullDate(inputDate)} at ${formatTime(inputDate)}`;
}

function formatTime(date: Date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatDayMonth(date: Date) {
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short'
    });
}

function formatFullDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

