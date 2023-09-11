import { months } from '../utils/constants.js'
import { getDateInfo } from '../utils/dateInfo.js'
import { getDayEvents, renderDayEvents } from '../utils/renderEvents.js'
import { loadHolidays, HolidayInfo } from '../utils/holidays.js'
import { getEventExpiration } from '../utils/expiration.js'
import { updateMiniCalendar } from './minicalendar.js'
import { Event } from '../utils/newEventHandler.js'

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

function populateDays(currentDate: Date, eventsToDisplay: Event[]): void {
	const { firstDay, lastDayOfWeek, monthLength, prevLastDay } = getDateInfo(currentDate)
	const daysDisplay: HTMLElement = document.querySelector('.calendar__days')!
	const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
	const adjustedLastDayOfWeek = lastDayOfWeek
	appendPaddingDays(adjustedFirstDay, prevLastDay, daysDisplay, true)
	appendCurrentMonthDays(eventsToDisplay, currentDate, monthLength, daysDisplay)
	appendPaddingDays(7 - adjustedLastDayOfWeek, 0, daysDisplay, false)
}

function appendPaddingDays(count: number, start: number, container: HTMLElement, isPrevMonth: boolean) {
	let value = isPrevMonth ? (start - count + 1) : 1
	for (let i = 0; i < count; i++) {
		const day: HTMLDivElement = document.createElement('div')
		day.classList.add('day')

		const dayNumber: HTMLParagraphElement = document.createElement('p')
		dayNumber.innerText = `${value++}`
		dayNumber.classList.add('day__number')

		const dayEventsEl = document.createElement('ul')
		dayEventsEl.classList.add('day__events-list')
		day.append(dayNumber, dayEventsEl)
		
		
		day.classList.add('paddingDay')
		container.appendChild(day)
	}
}

function appendCurrentMonthDays(eventsToDisplay: Event[], currentDate: Date, monthLength: number, container: HTMLElement) {
	for (let i = 1; i <= monthLength; i++) {
		const day: HTMLDivElement = document.createElement('div')
		day.classList.add('day')
		day.setAttribute('data-day-number', i.toString())
		day.addEventListener('click', (event) => {
			const clickedDay = event.currentTarget as HTMLElement
			console.log(clickedDay.getAttribute('data-day-number'))
		})

		const dayNumber: HTMLParagraphElement = document.createElement('p')
		dayNumber.innerText = `${i}`
		dayNumber.classList.add('day__number')

		const dayEventsEl = document.createElement('ul')
		dayEventsEl.classList.add('day__events-list')
		day.prepend(dayNumber)
		day.append(dayEventsEl)

		if (i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()) {
			dayNumber.classList.add('today')
		}

		const dayEvents = getDayEvents(eventsToDisplay, i, currentDate)
		if (dayEvents) {
			const currentMiliseconds = Date.now()
			renderDayEvents(dayEvents, dayEventsEl, day, currentMiliseconds)
		}

		container.appendChild(day)
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

export function populateCalendar(currentDate: Date, eventsToDisplay: Event[] = JSON.parse(localStorage.getItem('events') || '[]')): void {
	clearCalendar()
	updateMonthHeader(currentDate)
	populateDays(currentDate, eventsToDisplay)
	loadHolidaysAsync(currentDate.getFullYear())
	getEventExpiration()
}


const miniCalendarDate: Date = new Date(currentDate)

updateMiniCalendar(miniCalendarDate) 