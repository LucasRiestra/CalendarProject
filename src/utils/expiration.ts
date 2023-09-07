
export function eventsExpired() {
    setInterval(() => {
        const currentDate = new Date();
        const allEvents = document.querySelectorAll('.day__events-list li') as NodeListOf<HTMLElement>;

        allEvents.forEach((event: HTMLElement) => {

            const eventDateStr = event.dataset.eventDate;

            if (eventDateStr) {
                
                const eventDate = new Date(eventDateStr);

                if (eventDate.getTime() <= currentDate.getTime()) {
                    event.classList.add('expired-event');
                } else {
                    event.classList.remove('expired-event');
                }
            }
        });
    }, 100000);
}