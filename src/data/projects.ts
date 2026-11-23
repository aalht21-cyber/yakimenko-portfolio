import boost1 from '../assets/projects/Boost_1.jpeg'
import boost2 from '../assets/projects/Boost_2.jpeg'
import boost3 from '../assets/projects/Boost_3.jpeg'
import buro1 from '../assets/projects/Бюро_1.jpeg'
import buro2 from '../assets/projects/Бюро_2.jpeg'
import buro3 from '../assets/projects/Бюро_3.jpeg'
import rev1 from '../assets/projects/revolution_1.jpeg'
import rev2 from '../assets/projects/revolution_2.jpeg'
import rev3 from '../assets/projects/revolution_3.jpeg'
import aart1 from '../assets/projects/Аарт_1.jpeg'
import aart2 from '../assets/projects/Аарт_2.jpeg'
import aart3 from '../assets/projects/Аарт_3.jpeg'

export interface SelfBuiltCase {
  title: string
  text: string
  result: string
}

export interface Project {
  id: string
  spine: string
  title: string
  description: string
  term?: string
  result?: string
  shots?: { src: string; alt: string }[]
  cases?: SelfBuiltCase[]
}

export const PROJECTS: Project[] = [
  {
    id: 'boost',
    spine: 'BOOST MARINE',
    title: 'Boost Marine',
    description:
      'Корпоративный сайт компании по ремонту водной техники: услуги, портфолио, команда, магазин запчастей.',
    term: 'Около месяца, с большим количеством правок от заказчика в процессе.',
    result: 'Сайт сдан и работает, заказчик доволен.',
    shots: [
      { src: boost1, alt: 'Boost Marine — первый экран с яхтами' },
      { src: boost2, alt: 'Boost Marine — раздел услуг' },
      { src: boost3, alt: 'Boost Marine — страница услуги' },
    ],
  },
  {
    id: 'a13',
    spine: 'БЮРО A13',
    title: 'Бюро A13',
    description:
      'Сайт архитектурного бюро, специализирующегося на светопрозрачных конструкциях и фасадных системах.',
    term: '2 недели, с правками.',
    result: 'Сайт сдан, заказчик доволен.',
    shots: [
      { src: buro1, alt: 'Бюро A13 — первый экран, проект «Сколково»' },
      { src: buro2, alt: 'Бюро A13 — портфолио работ' },
      { src: buro3, alt: 'Бюро A13 — калькулятор стоимости' },
    ],
  },
  {
    id: 'revolution',
    spine: 'REVOLUTION PRINT',
    title: 'Revolution Print',
    description:
      'MVP-платформа для отдела продаж и производства: калькулятор стоимости печати, CRM для клиентов, заказы, генератор документов.',
    term: '2 месяца, так как CRM большая.',
    result: 'Платформа сдана, заказчик доволен.',
    shots: [
      { src: rev1, alt: 'Revolution Print — главная панель платформы' },
      { src: rev2, alt: 'Revolution Print — калькулятор DTF' },
      { src: rev3, alt: 'Revolution Print — личный кабинет' },
    ],
  },
  {
    id: 'aart',
    spine: 'AART ATELIER',
    title: 'Aart Atelier',
    description:
      'Креативное бюро: арт-консалтинг, дизайн интерьера, брендинг, видеопродакшн, кураторские проекты.',
    term: 'Полторы недели.',
    result: 'Сайт сдан, заказчик доволен.',
    shots: [
      { src: aart1, alt: 'Aart Atelier — обложка сайта' },
      { src: aart2, alt: 'Aart Atelier — страница услуг' },
      { src: aart3, alt: 'Aart Atelier — страница команды' },
    ],
  },
  {
    id: 'self',
    spine: 'СВОИ НАРАБОТКИ',
    title: 'Что я построил сам',
    description:
      'Не клиентские проекты, а системы, которые я спроектировал и внедрил внутри своей команды.',
    cases: [
      {
        title: 'Операционный регламент команды',
        text: 'Когда команда выросла с 3 до 10 человек, начался хаос. Внедрил ежедневные короткие встречи, недельное планирование и правило: если срок под угрозой, сообщаем сразу, а не в последний день. Искали причину сбоя, а не виноватого.',
        result: 'Число сорванных дедлайнов сократилось, команда работает по понятным правилам.',
      },
      {
        title: 'Корпоративная культура и роли в команде',
        text: 'Заложил ценности совместной работы (прозрачность, no-blame, честность с клиентом), расписал должностные инструкции для всей команды из 10 человек, включая стажёров, с чёткими зонами ответственности.',
        result: 'Прозрачные правила и роли вместо хаоса при росте команды с 3 до 10 человек.',
      },
      {
        title: 'Воронка продаж консалтинговых услуг',
        text: 'Спроектировал полный цикл продаж: скрипты первого контакта, структуру диагностики и КП, работу с возражениями, механику удержания клиента после сделки.',
        result: 'Полный цикл продаж, применённый на реальных сделках компании.',
      },
      {
        title: 'Запуск компании на рынок за 4 недели',
        text: 'Разработал и вёл поэтапный план вывода компании на рынок: фундамент и финансы → упаковка продуктов → прайс и визитка → выход на рынок, с конкретным результатом на каждую неделю.',
        result:
          'Компания вышла на рынок, все 4 этапа доведены до результата, несмотря на отклонение части команды от плана.',
      },
    ],
  },
]
