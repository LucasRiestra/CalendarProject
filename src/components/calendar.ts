import { months } from '../utils/constants.js'
import { getDateInfo } from '../utils/dateInfo.js'
import { getDay, getDayEvents, renderDayEvents } from '../utils/renderEvents.js'
import { loadHolidays, HolidayInfo } from '../utils/holidays.js'
import { updateMiniCalendar } from './minicalendar.js'
import { CalendarEvent } from '../utils/newEventHandler.js'

const currentDate: Date = new Date()
export function clearCalendar(): void {
	const daysDisplay: HTMLElement = document.querySelector('.calendar__days')!
	daysDisplay.innerHTML = ''
}

export function updateMonthHeader(currentDate: Date): void {
	const currentMonthInfo = months[currentDate.getMonth()]
	const monthHeader = document.querySelector('.calendar__month-title') as HTMLElement
	if (monthHeader) {
		monthHeader.innerHTML = `${currentMonthInfo.name} ${currentDate.getFullYear()}`
	}
}

function updateExpiredEvents(eventsArray:CalendarEvent[], currentMiliseconds:number): void{
  
    eventsArray.forEach(event=>{
      if(event.miliseconds < currentMiliseconds) event.expired = true
    })
    localStorage.setItem('events', JSON.stringify(eventsArray))
    
    const eventExpirationDetails = getEventExpirationTimeout(eventsArray)
    eventExpirationDetails.nextEventsArray.forEach(toExpEvent => {
      setTimeout(()=>{
        const eventEl = document.querySelector(`[data-event-id="${toExpEvent.id}"]`)
        eventEl?.classList.add('expired-event')
        updateExpiredEvents(eventsArray, currentMiliseconds)
      }, eventExpirationDetails.timeout)
    } )
  }

function addNotifications(eventsArray:CalendarEvent[]): void{
  const eventNotificationDetails = getEventNotificationTimeout(eventsArray)
  console.log(eventNotificationDetails)
  eventNotificationDetails.nextEventsArray.forEach(toNotEvent => {
    setTimeout(()=>{
      renderToast(toNotEvent)
      playNotificationSound('../media/sounds/notification_guitar.wav')
      addNotifications(eventsArray)
    }, eventNotificationDetails.timeout)
  })
}

function playNotificationSound(url:string): void{
  console.log('init')
  const notificationSound = new Audio(url)
  notificationSound.play()
}

function renderToast(event:CalendarEvent): void{
  const toastBodyEl = document.querySelector('#toastBody') 
  toastBodyEl!.textContent = `${event.reminder} minutes to ${event.title}`
  const notificationToastEl = document.querySelector('#notificationToast')!
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(notificationToastEl)
  toastBootstrap.show()
}


function getEventNotificationTimeout(eventsArray:CalendarEvent[]){
  const currentMiliseconds =  Date.now()

  const futureEventsArray = eventsArray.filter(localEvent => {
    return localEvent.timeToReminder! > currentMiliseconds
  })

  const nextTimeWithEvents = futureEventsArray.map(localEvent => {
    return localEvent.timeToReminder
  }).sort()[0]

  const nextEventsArray = futureEventsArray.filter(localEvent => {
    return localEvent.timeToReminder === nextTimeWithEvents
  })
  
  const timeout = nextTimeWithEvents! - currentMiliseconds

  return {timeout, nextEventsArray}

}


function getEventExpirationTimeout(eventsArray:CalendarEvent[]){
  const currentMiliseconds =  Date.now()

  const futureEventsArray = eventsArray.filter(localEvent => {
    return localEvent.miliseconds > currentMiliseconds
  })

  const nextTimeWithEvents = futureEventsArray.map(localEvent => {
    return localEvent.miliseconds 
  }).sort()[0]

  const nextEventsArray = futureEventsArray.filter(localEvent => {
    return localEvent.miliseconds === nextTimeWithEvents
  })
  
  const timeout = nextTimeWithEvents - currentMiliseconds

  return {timeout, nextEventsArray}
}

function populateDays(currentDate: Date): void {
  const localEvents = JSON.parse(localStorage.getItem('events') || '[]');
  const { firstDay, lastDayOfWeek, monthLength, prevLastDay } = getDateInfo(currentDate);
  const daysDisplay: HTMLElement = document.querySelector(".calendarDisplay")!;

  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjusting for Monday start
  const adjustedLastDayOfWeek = lastDayOfWeek; // Since Sunday is the last day, no adjustment needed

  appendPaddingDays(adjustedFirstDay, prevLastDay, daysDisplay, true);
  appendCurrentMonthDays(localEvents, currentDate, monthLength, daysDisplay);
  appendPaddingDays(7 - adjustedLastDayOfWeek, 0, daysDisplay, false);
}


function appendPaddingDays(count: number, start: number, container: HTMLElement, isPrevMonth: boolean) {
	let value = isPrevMonth ? (start - count + 1) : 1
	for (let i = 0; i < count; i++) {
		const day: HTMLParagraphElement = document.createElement('p')
		day.innerText = `${value++}`
		day.classList.add('paddingDay')
		container.appendChild(day)
	}
}

function appendCurrentMonthDays(localEvents: any[], currentDate: Date, monthLength: number, container: HTMLElement) {
    for (let i = 1; i <= monthLength; i++) {
        const day: HTMLDivElement = document.createElement('div');
        day.classList.add('day');
        day.setAttribute('data-day-number', i.toString());
        day.addEventListener('click', (event) => {
            const clickedDay = event.currentTarget as HTMLElement;
            console.log(clickedDay.getAttribute('data-day-number'));
        });

		const dayNumber: HTMLParagraphElement = document.createElement('p')
		dayNumber.innerText = `${i}`
		dayNumber.classList.add('day__number')

		const dayEventsEl = document.createElement('ul')
		dayEventsEl.classList.add('day__events-list')
		day.append(dayNumber, dayEventsEl)

        if (i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()) {
          dayNumber.classList.add('today');
        }
        if (localEvents) {
            const dayEvents = getDayEvents(currentDay);
            if (dayEvents) {
                renderDayEvents(dayEvents, dayEventsEl, day, currentMiliseconds);
            }
        }
        container.appendChild(day);
    }
}
  
async function loadHolidaysAsync(year: number): Promise<void> {
	try {
		const holidays = await loadHolidays(year)
		if (holidays) {
			processHolidays(holidays)
		}
	} catch (error) {
		console.error('Error fetching holidays:', error)
	}
}

function processHolidays(holidays: HolidayInfo[]): void {
	for (const holiday of holidays) {
		const holidayDate = new Date(holiday.date)
		if (holidayDate.getFullYear() === currentDate.getFullYear() && holidayDate.getMonth() === currentDate.getMonth()) {
			const day = holidayDate.getDate() + 4
			const dayHolidayEventsEl = document.querySelector(`.day:nth-child(${day}) .day__events-list`)
			if (dayHolidayEventsEl) {
				const holidayEvent = document.createElement('li')
				holidayEvent.classList.add('holiday')
				holidayEvent.textContent = holiday.name
				dayHolidayEventsEl.prepend(holidayEvent)
			}
		}
	}
}

export function populateCalendar(currentDate: Date): void {
  clearCalendar();
  updateMonthHeader(currentDate);
  populateDays(currentDate);
  loadHolidaysAsync(currentDate.getFullYear());
}


const miniCalendarDate: Date = new Date(currentDate)

updateMiniCalendar(miniCalendarDate) 