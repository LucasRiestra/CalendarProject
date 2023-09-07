import { formatDate } from "./formatDate.js";
export function getDayEvents(eventsArray, day, currentDate) {
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentDay = day;
    const fullDate = formatDate(`${currentMonth} ${currentDay}, ${currentYear}`);
    return eventsArray.filter((event) => event.date === fullDate);
}
export function renderDayEvents(dayEvents, eventsContainer, dayContainer) {
    const eventsToRender = [...dayEvents];
    if (dayEvents.length > 3) {
        eventsToRender.splice(3);
    }
    eventsToRender.forEach((event) => {
        const eventNameEl = document.createElement('li');
        eventNameEl.classList.add('event', event.label);
        eventNameEl.innerText = `${event.time} ${event.title}`;
        eventNameEl.dataset.eventId = event.id;
        eventsContainer.appendChild(eventNameEl);
        const eventDetailsTemplateOutter = `<div class="eventDetails">innerTemplate</div>`;
        let eventDetailsInnerTemplate = `<p>Date: ${event.date}</p>
        <p>Time: ${event.time}</p>
        <p>Details: ${event.txt}</p>
        <p>Label: ${event.label}</p>`;
        if (event.endDate)
            eventDetailsInnerTemplate += `<p>endDate: ${event.endDate}</p>`;
        if (event.reminder)
            eventDetailsInnerTemplate += `<p>Reminder: ${event.reminder}</p>`;
        const eventDetailsTemplate = eventDetailsTemplateOutter.replace('innerTemplate', eventDetailsInnerTemplate);
        const eventDetailsPopover = new bootstrap.Popover(eventNameEl, {
            html: true,
            title: event.title,
            content: eventDetailsTemplate,
            placement: "left"
        });
    });
    if (dayEvents.length > 3) {
        const viewDayEventsBtn = document.createElement('button');
        viewDayEventsBtn.textContent = `${dayEvents.length - 3} more`;
        viewDayEventsBtn.classList.add('view_more_btn', 'btn');
        viewDayEventsBtn.dataset.type = "view-day-events-btn";
        /* Add Offset */
        dayContainer.appendChild(viewDayEventsBtn);
        setTimeout(() => {
            const popoverTriggerEl = document.querySelector('[data-type="view-day-events-btn"]:not([data-trigger="popover"])');
            popoverTriggerEl.dataset.trigger = 'popover';
            let popoverTemplate = "<ul>templateInner</ul>";
            let popoverTemplateInner = "";
            dayEvents.forEach(event => {
                popoverTemplateInner += `<li data-event-id="${event.id}" class="event ${event.label}">${event.time} ${event.title}</li>`;
            });
            popoverTemplate = popoverTemplate.replace('templateInner', popoverTemplateInner);
            const dayEventsPopover = new bootstrap.Popover(popoverTriggerEl, {
                html: true,
                title: dayEvents[0].date,
                content: popoverTemplate,
                placement: "left"
            });
            popoverTriggerEl === null || popoverTriggerEl === void 0 ? void 0 : popoverTriggerEl.addEventListener('inserted.bs.popover', () => setPopoverEventsIds(dayEvents));
        }, 500); // Test changing the timeout with async await promise
    }
}
function setPopoverEventsIds(dayEvents) {
    const popoverEventsElArray = document.querySelectorAll('.popover-body .event');
    dayEvents.forEach((event, index) => {
        popoverEventsElArray[index].dataset.eventId = event.id;
        addEventDetailsPopover(event);
    });
}
function addEventDetailsPopover(event) {
    const popoverTriggerEl = document.querySelector('.popover-body [data-event-id]:not([data-trigger="popover"])');
    popoverTriggerEl.dataset.trigger = 'popover';
    const eventDetailsTemplateOutter = `<div class="eventDetails">innerTemplate</div>`;
    let eventDetailsInnerTemplate = `<p>Date: ${event.date}</p>
        <p>Time: ${event.time}</p>
        <p>Details: ${event.txt}</p>
        <p>Label: ${event.label}</p>`;
    if (event.endDate)
        eventDetailsInnerTemplate += `<p>endDate: ${event.endDate}</p>`;
    if (event.reminder)
        eventDetailsInnerTemplate += `<p>Reminder: ${event.reminder}</p>`;
    const eventDetailsTemplate = eventDetailsTemplateOutter.replace('innerTemplate', eventDetailsInnerTemplate);
    const eventDetailsPopover = new bootstrap.Popover(popoverTriggerEl, {
        html: true,
        title: event.title,
        content: eventDetailsTemplate,
        placement: "left"
    });
}
