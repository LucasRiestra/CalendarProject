import { months } from '../utils/constants.js';
import { getDateInfo } from '../utils/dateInfo.js';
import { getDay, getDayEvents, renderDayEvents } from '../utils/renderEvents.js';
import { loadHolidays } from '../utils/holidays.js';
import { updateMiniCalendar } from './minicalendar.js';
const currentDate = new Date();
export function clearCalendar() {
    const daysDisplay = document.querySelector('.calendar__days');
    daysDisplay.innerHTML = '';
}
export function updateMonthHeader(currentDate) {
    const currentMonthInfo = months[currentDate.getMonth()];
    const monthHeader = document.querySelector('.calendar__month-title');
    if (monthHeader) {
        monthHeader.innerHTML = `${currentMonthInfo.name} ${currentDate.getFullYear()}`;
    }
}
function updateExpiredEvents(currentMiliseconds) {
    const eventsArray = JSON.parse(localStorage.getItem('events') || '[]');
    eventsArray.forEach(event => {
        if (event.miliseconds < currentMiliseconds)
            event.expired = true;
    });
    localStorage.setItem('events', JSON.stringify(eventsArray));
    const eventExpirationDetails = getEventExpirationTimeout(eventsArray);
    eventExpirationDetails.nextEventsArray.forEach(toExpEvent => {
        setTimeout(() => {
            const eventEl = document.querySelector(`[data-event-id="${toExpEvent.id}"]`);
            eventEl === null || eventEl === void 0 ? void 0 : eventEl.classList.add('expired-event');
            updateExpiredEvents(currentMiliseconds);
        }, eventExpirationDetails.timeout);
    });
}
function addNotifications(eventsArray) {
    const eventNotificationDetails = getEventNotificationTimeout(eventsArray);
    eventNotificationDetails.nextEventsArray.forEach(toNotEvent => {
        setTimeout(() => {
            renderToast(toNotEvent);
            playNotificationSound('../media/sounds/notification_guitar.wav');
            addNotifications(eventsArray);
        }, eventNotificationDetails.timeout);
    });
}
function playNotificationSound(url) {
    const notificationSound = new Audio(url);
    notificationSound.play();
}
function renderToast(event) {
    const toastBodyEl = document.querySelector('#toastBody');
    toastBodyEl.textContent = `${event.reminder} minutes to ${event.title}`;
    const notificationToastEl = document.querySelector('#notificationToast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(notificationToastEl);
    toastBootstrap.show();
}
function getEventNotificationTimeout(eventsArray) {
    const currentMiliseconds = Date.now();
    const futureEventsArray = eventsArray.filter(localEvent => {
        return localEvent.timeToReminder > currentMiliseconds;
    });
    const nextTimeWithEvents = futureEventsArray.map(localEvent => {
        return localEvent.timeToReminder;
    }).sort()[0];
    const nextEventsArray = futureEventsArray.filter(localEvent => {
        return localEvent.timeToReminder === nextTimeWithEvents;
    });
    const timeout = nextTimeWithEvents - currentMiliseconds;
    return { timeout, nextEventsArray };
}
function getEventExpirationTimeout(eventsArray) {
    const currentMiliseconds = Date.now();
    const futureEventsArray = eventsArray.filter(localEvent => {
        return localEvent.miliseconds > currentMiliseconds;
    });
    const nextTimeWithEvents = futureEventsArray.map(localEvent => {
        return localEvent.miliseconds;
    }).sort()[0];
    const nextEventsArray = futureEventsArray.filter(localEvent => {
        return localEvent.miliseconds === nextTimeWithEvents;
    });
    const timeout = nextTimeWithEvents - currentMiliseconds;
    return { timeout, nextEventsArray };
}
function populateDays(currentDate, eventsToDisplay) {
    let localEvents = eventsToDisplay;
    const currentMiliseconds = Date.now();
    updateExpiredEvents(currentMiliseconds);
    addNotifications(localEvents);
    const { firstDay, lastDayOfWeek, monthLength, prevLastDay } = getDateInfo(currentDate);
    const daysDisplay = document.querySelector(".calendar__days");
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const adjustedLastDayOfWeek = lastDayOfWeek;
    appendPaddingDays(adjustedFirstDay, prevLastDay, daysDisplay, true);
    appendCurrentMonthDays(localEvents, currentDate, monthLength, daysDisplay, currentMiliseconds);
    appendPaddingDays(7 - adjustedLastDayOfWeek, 0, daysDisplay, false);
}
function appendPaddingDays(count, start, container, isPrevMonth) {
    let value = isPrevMonth ? (start - count + 1) : 1;
    for (let i = 0; i < count; i++) {
        const day = document.createElement('p');
        day.innerText = `${value++}`;
        day.classList.add('paddingDay');
        container.appendChild(day);
    }
}
function createAddEventButton(dayElement, currentDay) {
    const addEventButton = document.createElement('button');
    addEventButton.innerText = 'Add Event';
    addEventButton.classList.add('add-event-button');
    addEventButton.dataset.type = "addEventBtn";
    addEventButton.addEventListener('click', () => {
        console.log('Clicked Day:', currentDay);
        const modal = new bootstrap.Modal(document.querySelector('#staticBackdrop'));
        currentDay;
        const formattedDate = formatDateForInput(currentDay);
        handleNewEventOpenModal(formattedDate);
        modal.show();
    });
    dayElement.appendChild(addEventButton);
}
function formatDateForInput(date) {
    const dayArray = date.split('/');
    const formattedNumbersArray = dayArray.map(dayNumber => {
        if (dayNumber.length < 2) {
            return `0${dayNumber}`;
        }
        else {
            return dayNumber;
        }
    });
    return `${formattedNumbersArray[2]}-${formattedNumbersArray[1]}-${formattedNumbersArray[0]}`;
}
function handleNewEventOpenModal(formattedDate) {
    const modal = document.querySelector('#staticBackdrop');
    modal === null || modal === void 0 ? void 0 : modal.addEventListener('show.bs.modal', () => {
        setModalDate(event, formattedDate);
    });
}
function setModalDate(event, formattedDate) {
    const target = event.relatedTarget;
    if (!target) {
        console.log('magic button');
        const dateInput = document.querySelector('#newEventDate');
        console.log(dateInput);
        console.log(formattedDate);
        dateInput.value = formattedDate;
    }
}
function appendCurrentMonthDays(localEvents, currentDate, monthLength, container, currentMiliseconds) {
    for (let i = 1; i <= monthLength; i++) {
        const currentDay = getDay(i, currentDate);
        const day = document.createElement('div');
        day.dataset.date = currentDay;
        day.classList.add('day');
        day.setAttribute('data-day-number', i.toString());
        day.addEventListener('click', (event) => {
            const clickedDay = event.currentTarget;
        });
        day.addEventListener('mouseenter', () => {
            createAddEventButton(day, currentDay);
        });
        day.addEventListener('mouseleave', () => {
            const addEventButton = day.querySelector('.add-event-button');
            if (addEventButton) {
                addEventButton.remove();
            }
        });
        const dayNumber = document.createElement("p");
        dayNumber.innerText = `${i}`;
        dayNumber.classList.add('day__number');
        const dayEventsEl = document.createElement('ul');
        dayEventsEl.classList.add('day__events-list');
        day.append(dayNumber, dayEventsEl);
        if (i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()) {
            dayNumber.classList.add('today');
        }
        if (localEvents) {
            const dayEvents = getDayEvents(currentDay, localEvents);
            if (dayEvents) {
                renderDayEvents(dayEvents, dayEventsEl, day, currentMiliseconds);
            }
        }
        container.appendChild(day);
    }
}
export function populateCalendar(currentDate, eventsToDisplay = JSON.parse(localStorage.getItem('events') || '[]')) {
    clearCalendar();
    updateMonthHeader(currentDate);
    populateDays(currentDate, eventsToDisplay);
    loadHolidaysAsync(currentDate.getFullYear());
    async function loadHolidaysAsync(year) {
        try {
            const holidays = await loadHolidays(year);
            if (holidays) {
                processHolidays(holidays);
            }
        }
        catch (error) {
            console.error('Error fetching holidays:', error);
        }
    }
    function processHolidays(holidays) {
        for (const holiday of holidays) {
            const holidayDate = new Date(holiday.date);
            if (holidayDate.getFullYear() === currentDate.getFullYear() && holidayDate.getMonth() === currentDate.getMonth()) {
                const day = holidayDate.getDate() + 4;
                const dayHolidayEventsEl = document.querySelector(`.day:nth-child(${day}) .day__events-list`);
                if (dayHolidayEventsEl) {
                    const holidayEvent = document.createElement('li');
                    holidayEvent.classList.add('holiday');
                    holidayEvent.textContent = holiday.name;
                    dayHolidayEventsEl.prepend(holidayEvent);
                }
            }
        }
    }
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    darkModeToggle.addEventListener("change", function () {
        if (this.checked) {
            body.classList.add("dark-mode");
        }
        else {
            body.classList.remove("dark-mode");
        }
    });
}
const miniCalendarDate = new Date(currentDate);
updateMiniCalendar(miniCalendarDate);
